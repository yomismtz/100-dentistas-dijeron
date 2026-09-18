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
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final int SPEECH_REQUEST_CODE = 1001;
    private WebView webView;
    private TextToSpeech textToSpeech;
    private volatile boolean ttsReady = false;

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
        public void openUrl(String url) {
            runOnUiThread(() -> {
                try {
                    Uri uri = Uri.parse(url);
                    String scheme = uri.getScheme();
                    if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) {
                        return;
                    }
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception ignored) {
                }
            });
        }

        @JavascriptInterface
        public String getAssetText(String assetName) {
            if (assetName == null || !assetName.matches("[A-Za-z0-9_.-]+")) {
                return "";
            }
            try (InputStream input = getAssets().open(assetName);
                 BufferedReader reader = new BufferedReader(
                         new InputStreamReader(input, StandardCharsets.UTF_8))) {
                StringBuilder text = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    text.append(line).append('\n');
                }
                return text.toString();
            } catch (IOException ignored) {
                return "";
            }
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
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
