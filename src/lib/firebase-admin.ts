import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors during hot-reloads in development.
if (!admin.apps.length) {
  try {
    // Initialize the Admin SDK.
    // This will use the GOOGLE_APPLICATION_CREDENTIALS environment variable
    // for authentication on your server.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      // Make sure to replace this with your actual databaseURL
      databaseURL: 'https://gdgoc-vtu.firebaseio.com'
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Export the initialized admin instance, specifically the firestore service.
export const adminDb = admin.firestore();
