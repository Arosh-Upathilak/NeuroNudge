# NeuroNudge Native Android

Native Kotlin/Jetpack Compose replacement for the Expo app in `../mobile`. The Expo project remains unchanged and can still be built independently.

## Requirements

- Android Studio with Android SDK 36
- JDK 17
- A Firebase Android registration for `com.avidz.NeuroNudge` (the existing `app/google-services.json` is included)
- The debug SHA-1 fingerprint registered in the Firebase Console under this Android app. Run the command below to get it, then add it in **Project Settings → Your apps → Android → SHA certificate fingerprints** in the Firebase console:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

This step is required for Google Sign-In to work; without it, sign-in fails with `SIGN_IN_REQUIRED` / "This android application is not registered to use OAuth2.0" in logcat.

## Build

```bash
./gradlew testDebugUnitTest lintDebug assembleDebug
```

The debug APK is generated at `app/build/outputs/apk/debug/app-debug.apk`.

Because this project keeps the existing package ID, it replaces the Expo build on a device rather than installing beside it. Native Firebase Auth uses its own persisted session, so users sign in again after switching builds; backend memories and chat remain available.

## Architecture

- `data/`: Firebase authentication, Retrofit API contract and DataStore preferences
- `platform/`: microphone, speech, location, media, notifications, camera and SoundPeats Bluetooth integrations
- `ui/`: Compose theme, shared controls and feature screens
- `AppViewModel.kt`: application state and feature orchestration

Hardware-dependent behavior should be validated on a physical Android device, especially Google sign-in, microphone levels, scheduled notifications and SoundPeats ANC commands.
