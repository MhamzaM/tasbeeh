plugins {
    id("com.android.application")
}

android {
    namespace = "io.github.mhamzam.tasbeeh"
    compileSdk = 36

    defaultConfig {
        // Permanent once published on Google Play.
        applicationId = "io.github.mhamzam.tasbeeh"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
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

// No dependencies: the game is plain HTML5 canvas running in the system WebView.
