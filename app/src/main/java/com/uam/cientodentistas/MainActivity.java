package com.uam.cientodentistas;

import android.app.Activity;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.speech.RecognizerIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.Manifest;
import org.json.JSONObject;
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
    private static final int VOICE_REQUEST = 4107;
    private static final int AUDIO_PERMISSION_REQUEST = 4108;
    private static final int CONNECTIVITY_PERMISSION_REQUEST = 4109;
    private String pendingVoiceLanguage = "es-MX";

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
                textToSpeech.setSpeechRate(0.90f);
                textToSpeech.setPitch(1.0f);
                configureNarratorVoice(new Locale("es", "MX"));
                textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String utteranceId) {}
                    @Override public void onDone(String utteranceId) { notifyNarrationFinished(utteranceId, true); }
                    @Override public void onError(String utteranceId) { notifyNarrationFinished(utteranceId, false); }
                });
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
        webView.addJavascriptInterface(new VoiceBridge(), "AndroidVoice");
        webView.addJavascriptInterface(new ConnectivityBridge(), "AndroidConnectivity");
        webView.addJavascriptInterface(new AssetBridge(), "AndroidAssets");
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void notifyNarrationFinished(String utteranceId, boolean ok) {
        if (webView == null || utteranceId == null || !utteranceId.startsWith("js-")) return;
        final String safeId = utteranceId.replace("\\", "\\\\").replace("'", "\\'");
        runOnUiThread(() -> webView.evaluateJavascript(
                "window.DentistasNarrator&&window.DentistasNarrator.nativeFinished('" + safeId + "'," + ok + ");", null));
    }

    private class VoiceBridge {
        @JavascriptInterface public boolean isAvailable() {
            return getPackageManager().hasSystemFeature(PackageManager.FEATURE_MICROPHONE);
        }
        @JavascriptInterface public void start(String languageTag) {
            pendingVoiceLanguage = (languageTag == null || languageTag.trim().isEmpty()) ? "es-MX" : languageTag;
            if (android.os.Build.VERSION.SDK_INT >= 23 && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, AUDIO_PERMISSION_REQUEST);
                return;
            }
            launchVoiceRecognizer();
        }
    }

    private class ConnectivityBridge {
        @JavascriptInterface public boolean needsRuntimePermission() {
            if (android.os.Build.VERSION.SDK_INT >= 31) {
                return checkSelfPermission(Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED
                        || checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED
                        || checkSelfPermission(Manifest.permission.BLUETOOTH_ADVERTISE) != PackageManager.PERMISSION_GRANTED;
            }
            if (android.os.Build.VERSION.SDK_INT >= 33) {
                return checkSelfPermission(Manifest.permission.NEARBY_WIFI_DEVICES) != PackageManager.PERMISSION_GRANTED;
            }
            return false;
        }
        @JavascriptInterface public void requestPermissions() {
            if (android.os.Build.VERSION.SDK_INT >= 31) {
                MainActivity.this.requestPermissions(new String[]{
                        Manifest.permission.BLUETOOTH_SCAN,
                        Manifest.permission.BLUETOOTH_CONNECT,
                        Manifest.permission.BLUETOOTH_ADVERTISE
                }, CONNECTIVITY_PERMISSION_REQUEST);
            } else if (android.os.Build.VERSION.SDK_INT >= 33) {
                MainActivity.this.requestPermissions(new String[]{Manifest.permission.NEARBY_WIFI_DEVICES}, CONNECTIVITY_PERMISSION_REQUEST);
            }
        }
    }

    private void launchVoiceRecognizer() {
        try {
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, pendingVoiceLanguage);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, pendingVoiceLanguage);
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
            intent.putExtra(RecognizerIntent.EXTRA_PROMPT, pendingVoiceLanguage.toLowerCase(Locale.ROOT).startsWith("en") ? "Say your answer" : "Di tu respuesta");
            startActivityForResult(intent, VOICE_REQUEST);
        } catch (Exception e) {
            notifyVoice("", false);
        }
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == AUDIO_PERMISSION_REQUEST) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) launchVoiceRecognizer();
            else notifyVoice("", false);
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != VOICE_REQUEST) return;
        String heard = "";
        boolean ok = false;
        if (resultCode == RESULT_OK && data != null) {
            java.util.ArrayList<String> results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (results != null && !results.isEmpty()) { heard = results.get(0); ok = heard != null && !heard.trim().isEmpty(); }
        }
        notifyVoice(heard, ok);
    }

    private void notifyVoice(String text, boolean ok) {
        if (webView == null) return;
        final String safe = JSONObject.quote(text == null ? "" : text);
        final String script = "window.DentistasVoice&&window.DentistasVoice.nativeResult(" + safe + "," + ok + ");";
        runOnUiThread(() -> webView.evaluateJavascript(script, null));
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


    private Locale configureNarratorVoice(Locale requested) {
        if (textToSpeech == null) return requested;
        Locale selected = requested;
        int result = textToSpeech.setLanguage(selected);
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            selected = "en".equalsIgnoreCase(requested.getLanguage())
                    ? Locale.US : new Locale("es", "MX");
            textToSpeech.setLanguage(selected);
        }

        // Prefer the best installed voice for the requested language/region.
        // A phone may expose only one voice; in that case Android keeps its default.
        if (android.os.Build.VERSION.SDK_INT >= 21) {
            try {
                java.util.Set<Voice> available = textToSpeech.getVoices();
                Voice best = null;
                int bestScore = Integer.MIN_VALUE;
                if (available != null) {
                    for (Voice candidate : available) {
                        if (candidate == null || candidate.getLocale() == null) continue;
                        Locale voiceLocale = candidate.getLocale();
                        if (!selected.getLanguage().equalsIgnoreCase(voiceLocale.getLanguage())) continue;

                        int score = 100;
                        String region = voiceLocale.getCountry().toUpperCase(Locale.ROOT);
                        if ("MX".equals(region)) score += 520;
                        else if (isLatinAmericanRegion(region)) score += 360;
                        else if ("ES".equals(region)) score -= 700;
                        else if (region.isEmpty()) score += 40;
                        score += Math.max(0, candidate.getQuality()) / 2;
                        String voiceName = String.valueOf(candidate.getName()).toLowerCase(Locale.ROOT);
                        if (voiceName.matches(".*(female|feminine|mujer|sabina|paulina|zira|samantha|victoria|aria|jenny).*")) score += 90;
                        // Enhanced/network voices can sound less synthetic than basic offline voices.
                        if (candidate.isNetworkConnectionRequired()) score += 20;
                        if (score > bestScore) {
                            bestScore = score;
                            best = candidate;
                        }
                    }
                }
                if (best != null) textToSpeech.setVoice(best);
            } catch (Exception ignored) {
                // Retain the language selected by Android when voice metadata is unavailable.
            }
        }
        return selected;
    }

    private boolean isLatinAmericanRegion(String region) {
        return "419".equals(region) || "US".equals(region)
                || "AR".equals(region) || "BO".equals(region) || "CL".equals(region)
                || "CO".equals(region) || "CR".equals(region) || "CU".equals(region)
                || "DO".equals(region) || "EC".equals(region) || "SV".equals(region)
                || "GT".equals(region) || "HN".equals(region) || "NI".equals(region)
                || "PA".equals(region) || "PY".equals(region) || "PE".equals(region)
                || "PR".equals(region) || "UY".equals(region) || "VE".equals(region);
    }

    private float clampSpeechRate(float value) {
        if (Float.isNaN(value) || Float.isInfinite(value)) return 0.90f;
        return Math.max(0.82f, Math.min(1.05f, value));
    }

    private float clampSpeechPitch(float value) {
        if (Float.isNaN(value) || Float.isInfinite(value)) return 1.0f;
        return Math.max(0.90f, Math.min(1.10f, value));
    }

    private class NarratorBridge {
        @JavascriptInterface
        public void speak(String text, String languageTag) {
            if (!ttsReady || textToSpeech == null || text == null || text.trim().isEmpty()) return;

            runOnUiThread(() -> {
                Locale requested = Locale.forLanguageTag(
                        languageTag == null || languageTag.trim().isEmpty() ? "es-MX" : languageTag
                );
                configureNarratorVoice(requested);
                textToSpeech.setSpeechRate(0.90f);
                textToSpeech.setPitch(1.0f);
                textToSpeech.speak(
                        text.trim(),
                        TextToSpeech.QUEUE_FLUSH,
                        null,
                        "dentistas-" + UUID.randomUUID()
                );
            });
        }

        @JavascriptInterface
        public void speakWithId(String text, String languageTag, String utteranceId, float rate, float pitch) {
            if (!ttsReady || textToSpeech == null || text == null || text.trim().isEmpty()) return;
            runOnUiThread(() -> {
                Locale requested = Locale.forLanguageTag(languageTag == null || languageTag.trim().isEmpty() ? "es-MX" : languageTag);
                configureNarratorVoice(requested);
                textToSpeech.setSpeechRate(clampSpeechRate(rate));
                textToSpeech.setPitch(clampSpeechPitch(pitch));
                textToSpeech.speak(text.trim(), TextToSpeech.QUEUE_FLUSH, null, utteranceId);
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
            webView.removeJavascriptInterface("AndroidVoice");
            webView.removeJavascriptInterface("AndroidConnectivity");
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
