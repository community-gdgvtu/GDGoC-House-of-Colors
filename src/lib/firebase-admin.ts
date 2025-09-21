
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors during hot-reloads in development.
if (!admin.apps.length) {
  try {
    // Initialize the Admin SDK using Application Default Credentials.
    // This is the standard and recommended way for server-side environments like Cloud Functions, App Engine, or Cloud Workstations.
    // It will automatically find the credentials in the environment.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      // The databaseURL is not strictly necessary for Firestore but is good practice.
      databaseURL: 'https://gdgoc-vtu.firebaseio.com',
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Export the initialized admin instance, specifically the firestore service.
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
