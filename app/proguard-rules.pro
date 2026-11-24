# Methods called from JavaScript must keep their names.
-keepclassmembers class io.github.mhamzam.tasbeeh.MainActivity$Bridge {
    @android.webkit.JavascriptInterface <methods>;
}
