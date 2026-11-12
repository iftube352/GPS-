plugins {
    id("com.android.application")
}

android {
    namespace = "pk.edu.gpschambai.schoolapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "pk.edu.gpschambai.schoolapp"
        minSdk = 24
        targetSdk = 35
        versionCode = 6
        versionName = "1.0.5"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // Uses standard Android SDK WebView, Activity, and Intent APIs (zero external third-party dependencies required)
}
