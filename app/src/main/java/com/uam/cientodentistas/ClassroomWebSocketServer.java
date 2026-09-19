package com.uam.cientodentistas;

import android.util.Base64;

import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Minimal RFC6455 WebSocket server for classroom LAN only.
 * No cloud service or external dependency is used.
 */
public final class ClassroomWebSocketServer extends Thread {
    public interface Listener {
        boolean onBuzz(int team);
        void onTeacherCommand(String name, String arg);
        void onExamAnswer(String answer);
        void onLatency(int team, long milliseconds);
    }

    private static final String GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    private final int port;
    private final String teacherPin;
    private final Listener listener;
    private final Set<Client> clients = new CopyOnWriteArraySet<>();
    private volatile boolean running = true;
    private volatile boolean ready = false;
    private volatile boolean buzzArmed = false;
    private volatile String stateJson = "{}";
    private ServerSocket serverSocket;

    public ClassroomWebSocketServer(int port, String teacherPin, Listener listener) {
        super("DentistasWebSocket");
        this.port = port;
        this.teacherPin = teacherPin == null ? "" : teacherPin;
        this.listener = listener;
        setDaemon(true);
    }

    @Override
    public void run() {
        try {
            serverSocket = new ServerSocket(port);
            ready = true;
            while (running) {
                Socket socket = serverSocket.accept();
                Thread t = new Thread(() -> handle(socket), "DentistasWsClient");
                t.setDaemon(true);
                t.start();
            }
        } catch (Exception ignored) {
        } finally {
            ready = false;
        }
    }

    public boolean isReady() {
        return ready;
    }

    public synchronized void armBuzz() {
        buzzArmed = true;
        broadcastStates();
    }

    public synchronized void closeBuzz() {
        buzzArmed = false;
        broadcastStates();
    }

    public synchronized void closeBuzzAndBroadcast(int winnerTeam) {
        buzzArmed = false;
        JSONObject event = new JSONObject();
        try {
            event.put("type", "buzzResult");
            event.put("winner", winnerTeam);
        } catch (Exception ignored) {}
        broadcast(event.toString(), null);
        broadcastStates();
    }

    public void updateState(String json) {
        stateJson = json == null || json.trim().isEmpty() ? "{}" : json;
        broadcastStates();
    }

    public void stopServer() {
        running = false;
        for (Client c : clients) c.close();
        clients.clear();
        try { if (serverSocket != null) serverSocket.close(); } catch (Exception ignored) {}
    }

    private void handle(Socket socket) {
        Client client = null;
        try {
            InputStream input = socket.getInputStream();
            OutputStream output = socket.getOutputStream();
            String header = readHttpHeader(input);
            if (header.isEmpty()) { socket.close(); return; }

            String[] lines = header.split("\r?\n");
            String[] request = lines[0].split(" ");
            String target = request.length > 1 ? request[1] : "/ws";
            String path = target;
            String query = "";
            int qi = target.indexOf('?');
            if (qi >= 0) {
                path = target.substring(0, qi);
                query = target.substring(qi + 1);
            }
            if (!"/ws".equals(path)) { socket.close(); return; }

            Map<String,String> headers = new ConcurrentHashMap<>();
            for (int i=1;i<lines.length;i++) {
                int colon=lines[i].indexOf(':');
                if(colon>0) headers.put(lines[i].substring(0,colon).trim().toLowerCase(Locale.ROOT),lines[i].substring(colon+1).trim());
            }
            String key=headers.get("sec-websocket-key");
            if(key==null || key.isEmpty()){socket.close();return;}

            String role=queryValue(query,"role");
            int team=parseInt(queryValue(query,"team"),0);
            String pin=queryValue(query,"pin");
            boolean teacher="teacher".equals(role) && teacherPin.equals(pin);
            if("teacher".equals(role) && !teacher){
                writeHttp(output,"HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
                socket.close();return;
            }

            String accept=Base64.encodeToString(
                    MessageDigest.getInstance("SHA-1").digest((key+GUID).getBytes(StandardCharsets.ISO_8859_1)),
                    Base64.NO_WRAP);
            writeHttp(output,
                    "HTTP/1.1 101 Switching Protocols\r\n"+
                    "Upgrade: websocket\r\n"+
                    "Connection: Upgrade\r\n"+
                    "Sec-WebSocket-Accept: "+accept+"\r\n\r\n");

            client=new Client(socket,output,role,team,teacher);
            clients.add(client);
            sendState(client);
            readFrames(client,input);
        } catch (Exception ignored) {
        } finally {
            if(client!=null) clients.remove(client);
            try{socket.close();}catch(Exception ignored){}
        }
    }

    private void readFrames(Client client, InputStream input) throws Exception {
        while(running && !client.socket.isClosed()){
            int b1=input.read(); if(b1<0)return;
            int b2=input.read(); if(b2<0)return;
            int opcode=b1 & 0x0f;
            boolean masked=(b2 & 0x80)!=0;
            long len=b2 & 0x7f;
            if(len==126){
                len=((input.read()&0xff)<<8)|(input.read()&0xff);
            }else if(len==127){
                len=0;
                for(int i=0;i<8;i++)len=(len<<8)|(input.read()&0xff);
            }
            if(len>65536){client.close();return;}
            byte[] mask=masked?readExact(input,4):null;
            byte[] payload=readExact(input,(int)len);
            if(masked)for(int i=0;i<payload.length;i++)payload[i]=(byte)(payload[i]^mask[i%4]);
            if(opcode==0x8)return;
            if(opcode==0x9){client.sendFrame(payload,0xA);continue;}
            if(opcode!=0x1)continue;
            handleMessage(client,new String(payload,StandardCharsets.UTF_8));
        }
    }

    private void handleMessage(Client client,String text){
        try{
            JSONObject msg=new JSONObject(text);
            String type=msg.optString("type","");
            if("buzz".equals(type)){
                int team=client.team>0?client.team:msg.optInt("team",0);
                boolean accepted=buzzArmed && (team==1||team==2) && listener!=null && listener.onBuzz(team);
                if(accepted)closeBuzzAndBroadcast(team);
                JSONObject out=new JSONObject();
                out.put("type","buzzAck");out.put("accepted",accepted);
                client.send(out.toString());
            }else if("cmd".equals(type) && client.teacher){
                String name=msg.optString("name","");
                String arg=msg.optString("arg","");
                boolean locked=("reveal".equals(name)||"revealNext".equals(name))&&!isRoundOver();
                JSONObject out=new JSONObject();
                out.put("type","cmdAck");
                out.put("ok",!locked);
                if(locked)out.put("error","ROUND_ACTIVE");
                else if(listener!=null)listener.onTeacherCommand(name,arg);
                client.send(out.toString());
            }else if("exam".equals(type) && "exam".equals(client.role)){
                if(listener!=null)listener.onExamAnswer(msg.optString("answer",""));
                JSONObject out=new JSONObject();out.put("type","examAck");out.put("ok",true);client.send(out.toString());
            }else if("latency".equals(type)){
                long ms=Math.max(0,msg.optLong("ms",0));
                if(client.team>0 && listener!=null)listener.onLatency(client.team,ms);
            }else if("ping".equals(type)){
                JSONObject out=new JSONObject();
                out.put("type","pong");
                out.put("sent",msg.optLong("sent",0));
                out.put("server",System.currentTimeMillis());
                client.send(out.toString());
            }else if("state".equals(type)){
                sendState(client);
            }
        }catch(Exception ignored){}
    }

    private boolean isRoundOver(){
        try{return "over".equals(new JSONObject(safeState()).optString("phase",""));}
        catch(Exception ignored){return false;}
    }

    private void broadcastStates(){
        for(Client c:clients)sendState(c);
    }

    private void sendState(Client client){
        try{
            JSONObject root=new JSONObject();
            root.put("type","state");
            root.put("buzzArmed",buzzArmed);
            root.put("transport","websocket");
            JSONObject state=new JSONObject(safeState());
            if(!client.teacher){
                state.remove("answers");
                state.remove("scores");
                state.remove("source");
                state.remove("explanation");
                state.remove("editorial");
                state.remove("reviewedAt");
            }else if(!"over".equals(state.optString("phase",""))){
                state.remove("answers");
            }
            root.put("state",state);
            client.send(root.toString());
        }catch(Exception ignored){}
    }

    private void broadcast(String text, String role){
        for(Client c:clients){
            if(role==null || role.equals(c.role))c.send(text);
        }
    }

    private String safeState(){
        String t=stateJson==null?"{}":stateJson.trim();
        return t.startsWith("{")&&t.endsWith("}")?t:"{}";
    }

    private String readHttpHeader(InputStream in)throws Exception{
        ByteArrayOutputStream b=new ByteArrayOutputStream();
        int prev3=-1,prev2=-1,prev1=-1,cur;
        while((cur=in.read())!=-1){
            b.write(cur);
            if(prev3=='\r'&&prev2=='\n'&&prev1=='\r'&&cur=='\n')break;
            prev3=prev2;prev2=prev1;prev1=cur;
            if(b.size()>16384)break;
        }
        return b.toString(StandardCharsets.ISO_8859_1.name());
    }

    private byte[] readExact(InputStream in,int len)throws Exception{
        byte[] b=new byte[len];int off=0;
        while(off<len){int n=in.read(b,off,len-off);if(n<0)throw new IllegalStateException("socket closed");off+=n;}
        return b;
    }

    private void writeHttp(OutputStream out,String s)throws Exception{
        out.write(s.getBytes(StandardCharsets.ISO_8859_1));out.flush();
    }

    private String queryValue(String query,String key){
        if(query==null||query.isEmpty())return "";
        for(String pair:query.split("&")){
            int idx=pair.indexOf('=');
            String k=idx>=0?pair.substring(0,idx):pair;
            if(!key.equals(k))continue;
            String v=idx>=0?pair.substring(idx+1):"";
            try{return URLDecoder.decode(v,StandardCharsets.UTF_8.name());}catch(Exception ignored){return v;}
        }
        return "";
    }

    private int parseInt(String s,int fallback){try{return Integer.parseInt(s);}catch(Exception ignored){return fallback;}}

    private static final class Client {
        final Socket socket;
        final OutputStream output;
        final String role;
        final int team;
        final boolean teacher;
        Client(Socket socket,OutputStream output,String role,int team,boolean teacher){
            this.socket=socket;this.output=output;this.role=role;this.team=team;this.teacher=teacher;
        }
        synchronized void send(String text){
            try{sendFrame(text.getBytes(StandardCharsets.UTF_8),0x1);}catch(Exception e){close();}
        }
        synchronized void sendFrame(byte[] payload,int opcode)throws Exception{
            int len=payload.length;
            ByteArrayOutputStream frame=new ByteArrayOutputStream();
            frame.write(0x80|(opcode&0x0f));
            if(len<126)frame.write(len);
            else if(len<=65535){frame.write(126);frame.write((len>>8)&0xff);frame.write(len&0xff);}
            else{frame.write(127);for(int i=7;i>=0;i--)frame.write((int)((len>>(8*i))&0xff));}
            frame.write(payload);output.write(frame.toByteArray());output.flush();
        }
        void close(){try{socket.close();}catch(Exception ignored){}}
    }
}
