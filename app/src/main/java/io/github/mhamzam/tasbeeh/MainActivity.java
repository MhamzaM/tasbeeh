package io.github.mhamzam.tasbeeh;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedDispatcher;

/**
 * Tasbeeh: the counter UI lives in assets/app (HTML/JS). This activity hosts it and adds what
 * only native code can do: counting with the volume buttons, vibration, keep-screen-on and dimming.
 */
public class MainActivity extends Activity {

    private static final String APP_URL = "file:///android_asset/app/index.html";

    private WebView web;
    private boolean pageReady = false;
    private volatile boolean volumeKeys = true;
    private float insetTop = 0f, insetBottom = 0f, insetKeyboard = 0f;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false); // draw edge to edge; the page pads itself
        }

        web = new WebView(this);
        web.setBackgroundColor(0xFF0D3330);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);   // counts, history and settings
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);

        web.addJavascriptInterface(new Bridge(), "TasbeehNative");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !request.getUrl().toString().startsWith("file:///android_asset/");
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                pageReady = true;
                pushInsets();
            }
        });

        web.setOnApplyWindowInsetsListener((v, insets) -> {
            readInsets(insets);
            pushInsets();
            return insets;
        });

        setContentView(web);

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
        web.loadUrl(APP_URL);
    }

    /** Volume up counts one, volume down undoes. Holding a key does not repeat. */
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        int code = event.getKeyCode();
        if (volumeKeys && pageReady && (code == KeyEvent.KEYCODE_VOLUME_UP || code == KeyEvent.KEYCODE_VOLUME_DOWN)) {
            if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0) {
                String dir = code == KeyEvent.KEYCODE_VOLUME_UP ? "up" : "down";
                web.evaluateJavascript("window.onVolumeKey && window.onVolumeKey('" + dir + "')", null);
            }
            return true; // don't change the phone volume while counting
        }
        return super.dispatchKeyEvent(event);
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        handleBack();
    }

    private void handleBack() {
        web.evaluateJavascript("window.onAndroidBack ? window.onAndroidBack() : false", value -> {
            if (!"true".equals(value)) finish();
        });
    }

    @SuppressWarnings("deprecation")
    private void readInsets(WindowInsets insets) {
        float density = getResources().getDisplayMetrics().density;
        int top, bottom, keyboard = 0;
        if (Build.VERSION.SDK_INT >= 30) {
            android.graphics.Insets i = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
            top = i.top;
            bottom = i.bottom;
            // Edge to edge means the window is not resized for the keyboard, so tell the page how tall it is.
            keyboard = insets.getInsets(WindowInsets.Type.ime()).bottom;
        } else {
            top = insets.getSystemWindowInsetTop();
            bottom = insets.getSystemWindowInsetBottom();
        }
        insetTop = top / density;
        insetBottom = bottom / density;
        insetKeyboard = keyboard / density;
    }

    private void pushInsets() {
        if (!pageReady) return;
        web.evaluateJavascript("window.setInsets && window.setInsets(" + insetTop + "," + insetBottom + "," + insetKeyboard + ")", null);
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        if (pageReady) web.evaluateJavascript("window.onAndroidResume && window.onAndroidResume()", null);
    }

    @Override
    protected void onPause() {
        web.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }

    private Vibrator vibrator() {
        if (Build.VERSION.SDK_INT >= 31) {
            VibratorManager vm = (VibratorManager) getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            return vm != null ? vm.getDefaultVibrator() : null;
        }
        @SuppressWarnings("deprecation")
        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        return v;
    }

    /** Called from JavaScript as window.TasbeehNative. Runs on a background thread. */
    public class Bridge {
        @JavascriptInterface
        public void vibrate(int ms) {
            Vibrator v = vibrator();
            if (v == null || !v.hasVibrator()) return;
            // Many phones skip very short, default-strength pulses, so keep a floor and use full strength.
            int len = Math.max(25, Math.min(ms, 400));
            int amp = v.hasAmplitudeControl() ? 255 : VibrationEffect.DEFAULT_AMPLITUDE;
            v.vibrate(VibrationEffect.createOneShot(len, amp));
        }

        /** Comma-separated off/on durations in ms, e.g. "0,70,70,140". */
        @JavascriptInterface
        public void vibratePattern(String csv) {
            Vibrator v = vibrator();
            if (v == null || !v.hasVibrator() || csv == null) return;
            String[] parts = csv.split(",");
            long[] timings = new long[Math.min(parts.length, 16)];
            try {
                for (int i = 0; i < timings.length; i++) timings[i] = Math.max(0, Math.min(1000, Long.parseLong(parts[i].trim())));
            } catch (NumberFormatException e) {
                return;
            }
            v.vibrate(VibrationEffect.createWaveform(timings, -1));
        }

        @JavascriptInterface
        public void setKeepScreenOn(boolean on) {
            runOnUiThread(() -> {
                if (on) getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
                else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            });
        }

        @JavascriptInterface
        public void setVolumeKeys(boolean on) {
            volumeKeys = on;
        }

        /** Dim mode turns the screen brightness right down; off returns to the system setting. */
        @JavascriptInterface
        public void setDim(boolean on) {
            runOnUiThread(() -> {
                WindowManager.LayoutParams lp = getWindow().getAttributes();
                lp.screenBrightness = on ? 0.02f : WindowManager.LayoutParams.BRIGHTNESS_OVERRIDE_NONE;
                getWindow().setAttributes(lp);
            });
        }
    }
}
