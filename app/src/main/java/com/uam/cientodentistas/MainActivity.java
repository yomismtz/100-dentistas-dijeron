package com.uam.cientodentistas;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;
import java.util.UUID;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;

public class MainActivity extends Activity {
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

        textToSpeech = new TextToSpeech(this, status -> {
            ttsReady = status == TextToSpeech.SUCCESS;
            if (ttsReady) {
                textToSpeech.setSpeechRate(0.94f);
                textToSpeech.setPitch(1.03f);
            }
        });

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

        webView.addJavascriptInterface(new NarratorBridge(), "AndroidNarrator");
        webView.addJavascriptInterface(new AssetBridge(), "AndroidAssets");
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/index.html");
    }

    private class AssetBridge {
        @JavascriptInterface
        public String readText(String name) {
            if (name == null || name.trim().isEmpty() || name.contains("..") || name.startsWith("/")) return "";
            try (InputStream in = getAssets().open(name);
                 ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[8192];
                int n;
                while ((n = in.read(buffer)) > 0) out.write(buffer, 0, n);
                return out.toString("UTF-8");
            } catch (Exception e) {
                return "";
            }
        }
    }

    private class NarratorBridge {
        @JavascriptInterface
        public void speak(String text, String languageTag) {
            if (!ttsReady || textToSpeech == null || text == null || text.trim().isEmpty()) return;

            runOnUiThread(() -> {
                Locale requested = Locale.forLanguageTag(
                        languageTag == null || languageTag.trim().isEmpty() ? "es-MX" : languageTag
                );
                int result = textToSpeech.setLanguage(requested);

                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    Locale fallback = languageTag != null && languageTag.toLowerCase(Locale.ROOT).startsWith("en")
                            ? Locale.US
                            : new Locale("es", "MX");
                    textToSpeech.setLanguage(fallback);
                }

                textToSpeech.speak(
                        text.trim(),
                        TextToSpeech.QUEUE_FLUSH,
                        null,
                        "dentistas-" + UUID.randomUUID()
                );
            });
        }

        @JavascriptInterface
        public void stop() {
            if (textToSpeech != null) {
                runOnUiThread(() -> textToSpeech.stop());
            }
        }

        @JavascriptInterface
        public boolean isReady() {
            return ttsReady;
        }
    }

    @Override
    protected void onDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
            textToSpeech = null;
        }
        if (webView != null) {
            webView.removeJavascriptInterface("AndroidNarrator");
            webView.removeJavascriptInterface("AndroidAssets");
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }

        String script =
                "(function(){" +
                "try{" +
                "if(window.DentistasStudyBack && window.DentistasStudyBack()) return 'handled';" +
                "if(window.DentistasAppBack && window.DentistasAppBack()) return 'handled';" +
                "}catch(e){}" +
                "return 'exit';" +
                "})()";

        webView.evaluateJavascript(script, value -> {
            if (value == null || value.contains("exit")) {
                finish();
            }
        });
    }
}
