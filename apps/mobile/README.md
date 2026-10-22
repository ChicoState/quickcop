# QuickCop mobile

Expo/React Native Android client. Authentication uses Supabase Auth with email/password credentials. Only the public project URL and publishable key belong in the mobile configuration; never put service-role keys, database passwords, or access tokens in Expo variables.

## Commands

Run these with Node.js 22.14.0:

```bash
cd apps/mobile
npm ci
npm run android:run
npm test -- --runInBand
npm run typecheck
```

Set these values in a local, uncommitted `apps/mobile/.env` file:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
EXPO_PUBLIC_API_URL=https://your-api.example.com
```

For local Supabase development, use the local project URL appropriate to the emulator (`http://10.0.2.2:54321` for Android). For the local API, use `http://10.0.2.2:3000` from Android. EAS builds should receive the public Supabase values and HTTPS API URL through EAS environment variables. The app fails closed when required configuration is missing or invalid.

The login screen is the initial public route. Protected routes require a restored Supabase session; **Log out** clears the device session immediately and reports if remote revocation could not be completed.

## Android SDK launch

1. Install Android Studio, Android SDK Platform 36, Android SDK Build-Tools, and Android Emulator. Create and start an Android Virtual Device in Android Studio's Device Manager.
2. Set `ANDROID_HOME` to the SDK location shown by Android Studio and put its `platform-tools` and `emulator` directories on `PATH`. Confirm `adb --version` works in a new terminal.
3. From this directory, run `npm ci` with Node.js 22.14.0, then run `npm run android:run`.

`android:run` generates the native Android project when needed, builds the debug app, installs it on the running emulator (or connected device), and starts Metro. To use Expo Go instead, start an emulator and run `npm run android`.
