# JoblyAI Mobile Notifications Setup

This app uses one notification code path with Expo Notifications:

- Android: real remote push through Expo Push Service and Firebase Cloud Messaging.
- iOS demo: no Apple Developer Program, no APNs, no production remote push. The app uses polling plus local notifications, toast, and badge count.

## Android FCM Setup

1. Open Firebase Console and create or select a Firebase project.
2. Add an Android app with package name:

   ```txt
   com.jobly.mobile
   ```

3. Download `google-services.json`.
4. Put it at:

   ```txt
   apps/mobile/google-services.json
   ```

5. `apps/mobile/app.config.js` automatically adds `android.googleServicesFile`
   when `apps/mobile/google-services.json` exists.

6. In Firebase Console, open Project settings > Service accounts.
7. Generate a new private key for Firebase Admin SDK.

   This downloads a private key file with a name similar to:

   ```txt
   jobly-ai-xxxx-firebase-adminsdk-xxxxx.json
   ```

   This is not the same file as `google-services.json`:

   - `google-services.json`: put this in `apps/mobile/google-services.json`.
   - `firebase-adminsdk...json`: upload this to EAS credentials.

8. If EAS CLI is not installed yet, use one of these options.

   Recommended without global install:

   ```powershell
   cd apps/mobile
   npx eas-cli@latest login
   npx eas-cli@latest whoami
   ```

   Or install globally:

   ```powershell
   npm install --global eas-cli
   eas login
   eas whoami
   ```

9. If this Expo project has not been connected to EAS yet, initialize it:

   ```powershell
   cd apps/mobile
   npx eas-cli@latest init
   ```

   After this, Expo should add an EAS project id to the app config, usually under:

   ```json
   {
     "expo": {
       "extra": {
         "eas": {
           "projectId": "..."
         }
       }
     }
   }
   ```

   If you installed EAS globally, you can run `eas init` instead of `npx eas-cli@latest init`.

10. Upload the Firebase Admin SDK JSON key to EAS credentials as the Android FCM V1 service account key:

   ```powershell
   cd apps/mobile
   npx eas-cli@latest credentials
   ```

   If you installed EAS globally, use:

   ```powershell
   eas credentials
   ```

11. In the EAS credentials menu:

   - Choose `Android`.
   - Select the EAS project for JoblyAI.
   - Select the Android application identifier `com.jobly.mobile`.
   - Open push notification credentials / FCM credentials.
   - Choose FCM V1 service account key.
   - Choose upload a new service account key.
   - Paste or select the `firebase-adminsdk...json` file downloaded from Firebase.

   Do not upload `google-services.json` here. That file belongs inside the mobile app folder.

12. Build Android again:

   ```powershell
   cd apps/mobile
   npx eas-cli@latest build -p android --profile production
   ```

Do not commit Firebase service account private keys.

## iOS Demo Setup

No Apple Developer Program or APNs credential is required for the demo mode.

The app:

- Polls backend notifications every 15 seconds while the user is signed in.
- Refreshes when the app returns to foreground.
- Updates the unread badge count with `expo-notifications`.
- Shows a toast and schedules a local notification when a newer unread notification appears.

Production iOS remote push can be added later by configuring APNs in EAS and allowing iOS push tokens to be registered/sent.

## Backend Behavior

Backend notification creation does three things:

1. Saves the notification in the database.
2. Emits the existing realtime Socket.IO event.
3. Sends Expo remote push only to stored Android push tokens.
