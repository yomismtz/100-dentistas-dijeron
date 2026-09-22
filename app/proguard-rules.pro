# Conserva anotaciones e interfaces expuestas desde Android a JavaScript.
-keepattributes *Annotation*

-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Conserva la Activity declarada en el manifest.
-keep class com.uam.cientodentistas.MainActivity { *; }

# Conserva los servidores locales usados por el modo aula.
-keep class com.uam.cientodentistas.ClassroomWebSocketServer { *; }
