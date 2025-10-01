
import admin from 'firebase-admin';

// Prevent re-initialization on hot reloads
if (!admin.apps.length) {
  try {
    // When deployed, these environment variables are automatically provided.
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
       console.log('[Firebase Admin] Initializing with GOOGLE_APPLICATION_CREDENTIALS.');
       admin.initializeApp({
         credential: admin.credential.applicationDefault(),
         databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
       });
    } else {
       // For local development, it will fall back to Application Default Credentials.
       // Ensure you've run `gcloud auth application-default login` in your terminal.
       console.log('[Firebase Admin] Initializing with Application Default Credentials for local development.');
       admin.initializeApp({
         credential: admin.credential.applicationDefault(),
         databaseURL: 'https://gdgvtu-b2d9e.firebaseio.com',
       });
    }
  } catch (error: any) {
    console.error('[Firebase Admin] Initialization error:', error.stack);
  }
}

// Export Firestore and optionally Auth or Storage if needed
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
