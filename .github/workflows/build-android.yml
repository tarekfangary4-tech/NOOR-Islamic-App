name: Build NOOR Android APK
on:
  workflow_dispatch:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
      - uses: android-actions/setup-android@v3
      - name: Install SDK packages
        run: |
          yes | sdkmanager --licenses
          sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
      - run: npm install
      - run: npm run build
      - run: npx cap add android
      - name: Generate Android launcher icons
        run: npx capacitor-assets generate --android
      - run: npx cap sync android
      - name: Add Android permissions
        run: |
          M=android/app/src/main/AndroidManifest.xml
          sed -i '/<manifest/a\    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\n    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />' "$M"
      - name: Build APK
        run: cd android && chmod +x gradlew && ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: NOOR-Android-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: error
          retention-days: 14
