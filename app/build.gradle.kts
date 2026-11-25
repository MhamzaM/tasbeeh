plugins {
    id("com.android.application")
}

// Release signing. GitHub Actions decodes the upload key from the repo's secrets and passes its
// location and password in these environment variables. A local build without them falls back
// to the debug key, so it still works (Google Play just won't accept that file).
val uploadKeystore: String? = System.getenv("ANDROID_KEYSTORE_FILE")?.takeIf { it.isNotBlank() }

android {
    namespace = "io.github.mhamzam.tasbeeh"
    compileSdk = 36

    defaultConfig {
        // Permanent once published on Google Play.
        applicationId = "io.github.mhamzam.tasbeeh"
        minSdk = 26
        targetSdk = 36
        versionCode = System.getenv("APP_VERSION_CODE")?.toIntOrNull() ?: 1
        versionName = System.getenv("APP_VERSION_NAME") ?: "1.0"
    }

    signingConfigs {
        uploadKeystore?.let { keystorePath ->
            create("upload") {
                storeFile = file(keystorePath)
                storePassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
                keyAlias = System.getenv("ANDROID_KEY_ALIAS") ?: "upload"
                keyPassword = System.getenv("ANDROID_KEYSTORE_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName(if (uploadKeystore != null) "upload" else "debug")
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

// No dependencies: the screens are plain HTML/JS running in the system WebView.
