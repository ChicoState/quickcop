# QuickCop mobile

Expo/React Native Android foundation. Authentication is intentionally local-only for this first UI slice: entered email, phone number, username, and password are never persisted, logged, or sent over the network.

## Commands

Run these with Node.js 22.14.0:

```bash
cd apps/mobile
npm ci
npm run android:run
npm test -- --runInBand
npm run typecheck
```

The login screen is the initial route. A valid local login or account-creation form takes the user to an empty home screen; **Log out** returns to login.

## Android SDK launch

1. Install Android Studio, Android SDK Platform 36, Android SDK Build-Tools, and Android Emulator. Create and start an Android Virtual Device in Android Studio's Device Manager.
2. Set `ANDROID_HOME` to the SDK location shown by Android Studio and put its `platform-tools` and `emulator` directories on `PATH`. Confirm `adb --version` works in a new terminal.
3. From this directory, run `npm ci` with Node.js 22.14.0, then run `npm run android:run`.

`android:run` generates the native Android project when needed, builds the debug app, installs it on the running emulator (or connected device), and starts Metro. To use Expo Go instead, start an emulator and run `npm run android`.
