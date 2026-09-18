package com.uam.cientodentistas;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int SPEECH_REQUEST_CODE = 1001;
    private static final int CLASSROOM_PORT = 8787;
    private WebView webView;
    private TextToSpeech textToSpeech;
    private volatile boolean ttsReady = false;
    private LocalClassroomServer classroomServer;

    @Override
    @SuppressWarnings("deprecation")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN |
                View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );

        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(false);
        settings.setAllowContentAccess(false);

        initNarrator();
        classroomServer = new LocalClassroomServer(CLASSROOM_PORT);
        classroomServer.start();

        webView.addJavascriptInterface(new AndroidBridge(), "Android");
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void initNarrator() {
        textToSpeech = new TextToSpeech(getApplicationContext(), status -> {
            if (status != TextToSpeech.SUCCESS || textToSpeech == null) {
                ttsReady = false;
                return;
            }

            int language = textToSpeech.setLanguage(new Locale("es", "MX"));
            if (language == TextToSpeech.LANG_MISSING_DATA || language == TextToSpeech.LANG_NOT_SUPPORTED) {
                language = textToSpeech.setLanguage(new Locale("es"));
            }

            ttsReady = language != TextToSpeech.LANG_MISSING_DATA
                    && language != TextToSpeech.LANG_NOT_SUPPORTED;
            textToSpeech.setSpeechRate(0.90f);
            textToSpeech.setPitch(1.02f);
            textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {
                    notifyNarrationEvent("window.onNarrationStarted", utteranceId);
                }

                @Override
                public void onDone(String utteranceId) {
                    notifyNarrationEvent("window.onNarrationDone", utteranceId);
                }

                @Override
                @SuppressWarnings("deprecation")
                public void onError(String utteranceId) {
                    notifyNarrationEvent("window.onNarrationDone", utteranceId);
                }
            });
        });
    }

    private void notifyNarrationEvent(String callback, String utteranceId) {
        if (webView == null) return;
        final String quoted = JSONObject.quote(utteranceId == null ? "" : utteranceId);
        runOnUiThread(() -> webView.evaluateJavascript(
                "if(" + callback + "){" + callback + "(" + quoted + ");}", null));
    }

    private void sendJs(String script) {
        if (webView == null) return;
        runOnUiThread(() -> webView.evaluateJavascript(script, null));
    }

    public class AndroidBridge {
        @JavascriptInterface
        public void startSpeechRecognition() {
            runOnUiThread(() -> {
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "es-MX");
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "es-MX");
                intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
                intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Di tu respuesta");
                try {
                    startActivityForResult(intent, SPEECH_REQUEST_CODE);
                } catch (ActivityNotFoundException ex) {
                    sendSpeechError("No hay un servicio de reconocimiento de voz instalado.");
                }
            });
        }

        @JavascriptInterface
        public void speakText(String text, String utteranceId) {
            runOnUiThread(() -> {
                String safeId = (utteranceId == null || utteranceId.trim().isEmpty())
                        ? "question"
                        : utteranceId;
                if (!ttsReady || textToSpeech == null || text == null || text.trim().isEmpty()) {
                    notifyNarrationEvent("window.onNarrationDone", safeId);
                    return;
                }
                int result = textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, safeId);
                if (result == TextToSpeech.ERROR) {
                    notifyNarrationEvent("window.onNarrationDone", safeId);
                }
            });
        }

        @JavascriptInterface
        public void speakCue(String text) {
            runOnUiThread(() -> {
                if (!ttsReady || textToSpeech == null || text == null || text.trim().isEmpty()) return;
                textToSpeech.speak(text, TextToSpeech.QUEUE_ADD, null, "cue_" + System.nanoTime());
            });
        }

        @JavascriptInterface
        public void stopSpeaking() {
            runOnUiThread(() -> {
                if (textToSpeech != null) textToSpeech.stop();
            });
        }

        @JavascriptInterface
        public boolean isTtsReady() {
            return ttsReady;
        }

        @JavascriptInterface
        public String getClassroomBaseUrl() {
            return classroomServer == null ? "" : classroomServer.getBaseUrl();
        }

        @JavascriptInterface
        public String getTeacherPin() {
            return classroomServer == null ? "" : classroomServer.getTeacherPin();
        }

        @JavascriptInterface
        public void armRemoteBuzz() {
            if (classroomServer != null) classroomServer.armBuzz();
        }

        @JavascriptInterface
        public void closeRemoteBuzz() {
            if (classroomServer != null) classroomServer.closeBuzz();
        }

        @JavascriptInterface
        public boolean tryLocalBuzz(int team) {
            return classroomServer == null || classroomServer.tryBuzz(team, false);
        }

        @JavascriptInterface
        public void updateRemoteState(String json) {
            if (classroomServer != null) classroomServer.setState(json);
        }

        @JavascriptInterface
        public void openUrl(String url) {
            runOnUiThread(() -> {
                try {
                    Uri uri = Uri.parse(url);
                    String scheme = uri.getScheme();
                    if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) return;
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public String getAssetText(String assetName) {
            if (assetName == null || !assetName.matches("[A-Za-z0-9_.-]+")) return "";
            try (InputStream input = getAssets().open(assetName);
                 BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
                StringBuilder text = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) text.append(line).append('\n');
                return text.toString();
            } catch (IOException ignored) {
                return "";
            }
        }
    }

    private class LocalClassroomServer extends Thread {
        private final int port;
        private volatile boolean running = true;
        private volatile boolean ready = false;
        private volatile boolean buzzArmed = false;
        private volatile String stateJson = "{}";
        private final String teacherPin;
        private ServerSocket serverSocket;

        LocalClassroomServer(int port) {
            super("DentistasClassroomServer");
            this.port = port;
            this.teacherPin = String.format(Locale.US, "%04d", new SecureRandom().nextInt(10000));
            setDaemon(true);
        }

        @Override
        public void run() {
            try {
                serverSocket = new ServerSocket(port);
                ready = true;
                while (running) {
                    final Socket client = serverSocket.accept();
                    Thread handler = new Thread(() -> handle(client), "DentistasRemoteClient");
                    handler.setDaemon(true);
                    handler.start();
                }
            } catch (IOException ignored) {
            } finally {
                ready = false;
            }
        }

        synchronized void armBuzz() {
            buzzArmed = true;
        }

        synchronized void closeBuzz() {
            buzzArmed = false;
        }

        synchronized boolean tryBuzz(int team, boolean notifyJs) {
            if (!buzzArmed) return false;
            buzzArmed = false;
            if (notifyJs) {
                sendJs("if(window.onRemoteBuzz){window.onRemoteBuzz(" + team + ");}");
            }
            return true;
        }

        void setState(String json) {
            if (json == null || json.trim().isEmpty()) stateJson = "{}";
            else stateJson = json;
        }

        String getBaseUrl() {
            if (!ready) return "";
            return "http://" + findLocalIpv4() + ":" + port;
        }

        String getTeacherPin() {
            return teacherPin;
        }

        private String findLocalIpv4() {
            String fallback = "127.0.0.1";
            try {
                Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
                while (interfaces != null && interfaces.hasMoreElements()) {
                    NetworkInterface nif = interfaces.nextElement();
                    if (!nif.isUp() || nif.isLoopback()) continue;
                    String name = nif.getName().toLowerCase(Locale.ROOT);
                    Enumeration<InetAddress> addresses = nif.getInetAddresses();
                    while (addresses.hasMoreElements()) {
                        InetAddress address = addresses.nextElement();
                        if (!(address instanceof Inet4Address) || address.isLoopbackAddress()) continue;
                        String ip = address.getHostAddress();
                        if (address.isSiteLocalAddress()) {
                            if (name.contains("wlan") || name.contains("wifi") || name.contains("ap") || name.contains("swlan")) {
                                return ip;
                            }
                            fallback = ip;
                        }
                    }
                }
            } catch (Exception ignored) {
            }
            return fallback;
        }

        private void handle(Socket client) {
            try (Socket socket = client;
                 BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8));
                 OutputStream output = socket.getOutputStream()) {

                String requestLine = reader.readLine();
                if (requestLine == null || requestLine.isEmpty()) return;
                String[] parts = requestLine.split(" ");
                String target = parts.length > 1 ? parts[1] : "/";
                String path = target;
                String query = "";
                int q = target.indexOf('?');
                if (q >= 0) {
                    path = target.substring(0, q);
                    query = target.substring(q + 1);
                }

                if ("/1".equals(path) || "/2".equals(path)) {
                    int team = "/1".equals(path) ? 1 : 2;
                    respond(output, 200, "text/html; charset=utf-8", teamPage(team));
                } else if ("/t".equals(path)) {
                    respond(output, 200, "text/html; charset=utf-8", teacherPage());
                } else if ("/e".equals(path)) {
                    respond(output, 200, "text/html; charset=utf-8", examPage());
                } else if ("/r".equals(path)) {
                    respond(output, 200, "text/html; charset=utf-8", referencePage());
                } else if ("/api/state".equals(path)) {
                    String payload = "{\"buzzArmed\":" + buzzArmed + ",\"state\":" + safeJsonObject(stateJson) + "}";
                    respond(output, 200, "application/json; charset=utf-8", payload);
                } else if ("/api/buzz".equals(path)) {
                    int team = parseInt(queryValue(query, "team"), 0);
                    boolean accepted = (team == 1 || team == 2) && tryBuzz(team, true);
                    respond(output, 200, "application/json; charset=utf-8", "{\"accepted\":" + accepted + "}");
                } else if ("/api/cmd".equals(path)) {
                    String pin = queryValue(query, "pin");
                    if (!teacherPin.equals(pin)) {
                        respond(output, 403, "application/json; charset=utf-8", "{\"ok\":false,\"error\":\"PIN\"}");
                    } else {
                        String name = queryValue(query, "name");
                        String arg = queryValue(query, "arg");
                        String js = "if(window.onRemoteTeacherCommand){window.onRemoteTeacherCommand("
                                + JSONObject.quote(name) + "," + JSONObject.quote(arg) + ");}";
                        sendJs(js);
                        respond(output, 200, "application/json; charset=utf-8", "{\"ok\":true}");
                    }
                } else if ("/api/exam".equals(path)) {
                    String answer = queryValue(query, "answer");
                    sendJs("if(window.onRemoteExamAnswer){window.onRemoteExamAnswer(" + JSONObject.quote(answer) + ");}");
                    respond(output, 200, "application/json; charset=utf-8", "{\"ok\":true}");
                } else {
                    respond(output, 200, "text/html; charset=utf-8", landingPage());
                }
            } catch (Exception ignored) {
            }
        }

        private String safeJsonObject(String raw) {
            String t = raw == null ? "{}" : raw.trim();
            return t.startsWith("{") && t.endsWith("}") ? t : "{}";
        }

        private int parseInt(String value, int fallback) {
            try { return Integer.parseInt(value); } catch (Exception ignored) { return fallback; }
        }

        private String queryValue(String query, String key) {
            if (query == null || query.isEmpty()) return "";
            for (String pair : query.split("&")) {
                int idx = pair.indexOf('=');
                String k = idx >= 0 ? pair.substring(0, idx) : pair;
                if (!key.equals(k)) continue;
                String v = idx >= 0 ? pair.substring(idx + 1) : "";
                try { return URLDecoder.decode(v, StandardCharsets.UTF_8.name()); }
                catch (Exception ignored) { return v; }
            }
            return "";
        }

        private void respond(OutputStream output, int code, String contentType, String body) throws IOException {
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            String reason = code == 200 ? "OK" : code == 403 ? "Forbidden" : "Error";
            String headers = "HTTP/1.1 " + code + " " + reason + "\r\n"
                    + "Content-Type: " + contentType + "\r\n"
                    + "Content-Length: " + bytes.length + "\r\n"
                    + "Cache-Control: no-store\r\n"
                    + "Connection: close\r\n\r\n";
            output.write(headers.getBytes(StandardCharsets.UTF_8));
            output.write(bytes);
            output.flush();
        }

        private String baseCss() {
            return "html,body{margin:0;min-height:100%;font-family:Arial,sans-serif;background:#070202;color:#fff}"
                    + "body{display:flex;align-items:center;justify-content:center;padding:18px;box-sizing:border-box}"
                    + ".card{width:min(720px,96vw);background:#210706;border:2px solid #e2b55f;border-radius:24px;padding:24px;box-sizing:border-box;text-align:center;box-shadow:0 0 35px #000}"
                    + "h1,h2{color:#ffe09a}button{width:100%;min-height:58px;margin:8px 0;border:2px solid #e5ba64;border-radius:16px;background:#74120c;color:white;font-size:20px;font-weight:900}"
                    + ".buzz{height:52vh;border-radius:50%;font-size:clamp(28px,8vw,64px);background:radial-gradient(circle,#e12a1d,#7a0805 65%,#320100);box-shadow:0 12px 0 #390100,0 0 35px #e22b1d88}"
                    + ".buzz:active{transform:translateY(8px);box-shadow:0 3px 0 #390100}.muted{opacity:.55}.status{padding:10px;border-radius:10px;background:#100404;color:#f5dca6}"
                    + ".answers{text-align:left;display:grid;gap:6px}.ans{padding:8px;border:1px solid #6e522e;border-radius:9px;background:#120606}"
                    + "input{width:100%;box-sizing:border-box;padding:14px;border:1px solid #b99151;border-radius:12px;background:#100707;color:#fff;font-size:18px}";
        }

        private String stateScript() {
            return "async function st(){try{let r=await fetch('/api/state?x='+Date.now());return await r.json()}catch(e){return null}}";
        }

        private String teamPage(int team) {
            return "<!doctype html><meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1'><style>"
                    + baseCss() + "</style><div class='card'><h1 id='name'>EQUIPO " + team + "</h1>"
                    + "<div class='status' id='status'>Esperando careo…</div><button id='b' class='buzz'>PULSAR</button></div><script>"
                    + stateScript()
                    + ";let lastArmed=false,result='';async function refresh(){let j=await st();if(!j)return;let s=j.state||{};let n=(s.teams||[])["
                    + (team - 1) + "];if(n)document.getElementById('name').textContent=n;if(j.buzzArmed&&!lastArmed)result='';lastArmed=!!j.buzzArmed;let b=document.getElementById('b');b.disabled=!j.buzzArmed;b.classList.toggle('muted',!j.buzzArmed);document.getElementById('status').textContent=j.buzzArmed?'¡LISTOS!':(result||'Esperando que se abra el pulsador…')}"
                    + "document.getElementById('b').onpointerdown=async()=>{let r=await fetch('/api/buzz?team=" + team + "&x='+Date.now());let j=await r.json();result=j.accepted?'¡TU EQUIPO FUE PRIMERO!':'El otro equipo fue primero.';document.getElementById('status').textContent=result;document.getElementById('b').disabled=true};setInterval(refresh,120);refresh();</script>";
        }

        private String teacherPage() {
            return "<!doctype html><meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1'><style>"
                    + baseCss() + ".grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.small{font-size:15px;min-height:48px}.pin{display:grid;grid-template-columns:1fr auto;gap:8px;margin:10px 0}</style>"
                    + "<div class='card'><h1>🎓 CONTROL DOCENTE</h1><div class='pin'><input id='pin' inputmode='numeric' maxlength='4' placeholder='PIN docente'><button id='savePin'>USAR PIN</button></div><div id='auth' class='status'>Introduce el PIN mostrado en la app.</div><div id='q' class='status'>Conectando…</div><div id='meta'></div>"
                    + "<div class='grid'><button onclick=\"cmd('pause')\">⏯ PAUSA</button><button onclick=\"cmd('read')\">🎙 LEER</button>"
                    + "<button onclick=\"cmd('strike')\">✖ ERROR</button><button onclick=\"cmd('revealNext')\">👁 REVELAR SIG.</button>"
                    + "<button onclick=\"cmd('accept')\">✅ ACEPTAR</button><button onclick=\"cmd('reject')\">❌ RECHAZAR</button>"
                    + "<button onclick=\"cmd('award','1')\">🏦 BANCO E1</button><button onclick=\"cmd('award','2')\">🏦 BANCO E2</button>"
                    + "<button onclick=\"cmd('prev')\">◀ ANTERIOR</button><button onclick=\"cmd('next')\">SIGUIENTE ▶</button>"
                    + "<button onclick=\"cmd('projector')\">📺 PROYECTOR</button><button onclick=\"cmd('finish')\">🏁 TERMINAR</button></div>"
                    + "<h2>Respuestas privadas</h2><div id='answers' class='answers'></div></div><script>"
                    + stateScript()
                    + ";let pin=sessionStorage.getItem('dentistasTeacherPin')||'';document.getElementById('pin').value=pin;document.getElementById('savePin').onclick=()=>{pin=document.getElementById('pin').value.trim();sessionStorage.setItem('dentistasTeacherPin',pin);document.getElementById('auth').textContent=pin?'PIN guardado en este navegador.':'Introduce el PIN.'};"
                    + "async function cmd(n,a=''){pin=document.getElementById('pin').value.trim();let r=await fetch('/api/cmd?pin='+encodeURIComponent(pin)+'&name='+encodeURIComponent(n)+'&arg='+encodeURIComponent(a)+'&x='+Date.now());document.getElementById('auth').textContent=r.ok?'✓ Comando enviado':'⛔ PIN incorrecto'}"
                    + "async function refresh(){let j=await st();if(!j)return;let s=j.state||{};document.getElementById('q').textContent=s.question||'Sin pregunta';document.getElementById('meta').textContent='Ronda '+(s.round||'-')+' · Banco '+(s.bank||0)+' · X '+(s.strikes||0)+' · '+(s.phase||'');let el=document.getElementById('answers');el.innerHTML='';(s.answers||[]).forEach((a,i)=>{let d=document.createElement('button');d.className='small';d.textContent=(a.revealed?'✓ ':'')+(i+1)+'. '+a.label+' · '+a.points;d.onclick=()=>cmd('reveal',String(i));el.appendChild(d)})}"
                    + "setInterval(refresh,650);refresh();</script>";
        }

        private String examPage() {
            return "<!doctype html><meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1'><style>"
                    + baseCss() + "</style><div class='card'><h1>📝 RESPUESTA INDIVIDUAL</h1><div id='q' class='status'>Esperando pregunta…</div>"
                    + "<input id='a' placeholder='Escribe una respuesta'><button id='send'>ENVIAR RESPUESTA</button><div id='msg'></div></div><script>"
                    + stateScript()
                    + ";let current='',sent=false;async function refresh(){let j=await st();if(!j)return;let q=(j.state||{}).question||'Esperando pregunta…';if(q!==current){current=q;sent=false;document.getElementById('send').disabled=false;document.getElementById('a').disabled=false;document.getElementById('msg').textContent=''}document.getElementById('q').textContent=q}"
                    + "document.getElementById('send').onclick=async()=>{if(sent)return;let v=document.getElementById('a').value.trim();if(!v)return;await fetch('/api/exam?answer='+encodeURIComponent(v)+'&x='+Date.now());sent=true;document.getElementById('send').disabled=true;document.getElementById('a').disabled=true;document.getElementById('msg').textContent='✓ Respuesta registrada para esta pregunta';};setInterval(refresh,500);refresh();</script>";
        }

        private String referencePage() {
            return "<!doctype html><meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1'><style>"
                    + baseCss() + "</style><div class='card'><h1>📚 REFERENCIA DE LA PREGUNTA</h1><div id='q' class='status'></div><p id='why'></p><p id='src'></p></div><script>"
                    + stateScript()
                    + ";async function refresh(){let j=await st();if(!j)return;let s=j.state||{};document.getElementById('q').textContent=s.question||'';document.getElementById('why').textContent=s.explanation||'La explicación específica está pendiente de revisión editorial.';document.getElementById('src').textContent=s.source?'Fuente: '+s.source:'Fuente específica pendiente.'}setInterval(refresh,1000);refresh();</script>";
        }

        private String landingPage() {
            return "<!doctype html><meta name='viewport' content='width=device-width,initial-scale=1'><style>" + baseCss()
                    + "</style><div class='card'><h1>🦷 100 Dentistas Dijeron</h1><p>Servidor local del salón. No necesita Internet.</p></div>";
        }

        void stopServer() {
            running = false;
            try { if (serverSocket != null) serverSocket.close(); } catch (IOException ignored) {}
        }
    }

    @Override
    @SuppressWarnings("deprecation")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != SPEECH_REQUEST_CODE) return;

        if (resultCode == RESULT_OK && data != null) {
            ArrayList<String> results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (results != null && !results.isEmpty()) {
                String quoted = JSONObject.quote(results.get(0));
                webView.evaluateJavascript("window.onSpeechResult(" + quoted + ")", null);
                return;
            }
        }
        sendSpeechError("No se reconoció una respuesta.");
    }

    private void sendSpeechError(String message) {
        if (webView == null) return;
        String quoted = JSONObject.quote(message);
        webView.evaluateJavascript("window.onSpeechError(" + quoted + ")", null);
    }

    @Override
    protected void onDestroy() {
        if (classroomServer != null) classroomServer.stopServer();
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
