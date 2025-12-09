# TimeFlow — AI-assisted Time Tracking & Analytics

Live demo: (add your Firebase Hosting URL after deploy)

## Quick start

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication → Google
3. Create Firestore database (start in test mode for dev)
4. Copy `scripts/firebase-config.example.js` to `scripts/firebase-config.js` and paste your Firebase config (or add a script tag in each HTML with window.__FIREBASE_CONFIG)
5. Open the site (login → activity → seed data or add activities manually)
6. Deploy via GitHub / Firebase Hosting

## Notes
- Firestore structure: `users/{uid}/days/{YYYY-MM-DD}/activities/{activityId}`
- Seed script: `scripts/seed-sample-data.js` – run in browser console (after sign-in) to populate a full 1440-min day.

## AI usage
- Prototype created in Mocha then converted and implemented using ChatGPT. See evaluation notes in assignment README.
