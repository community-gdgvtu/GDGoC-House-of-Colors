
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Prevent re-initialization on hot reloads
if (!admin.apps.length) {
  try {
    // When deployed to Vercel, these environment variables will be available.
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL: 'https://gdgvtu-b2d9e.firebaseio.com',
      });
       console.log('[Firebase Admin] Initialized with Environment Variables.');
    } else {
       // For local development, it will fall back to Application Default Credentials.
       // Ensure you've run `gcloud auth application-default login` in your terminal.
       console.log('[Firebase Admin] Initializing with Application Default Credentials for local development.');
       admin.initializeApp({
         credential: admin.credential.applicationDefault(),
         databaseURL: 'https://gdgvtu-b2d9e.firebaseio.com',
       });
    }
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error);
  }
}

// Export Firestore and optionally Auth or Storage if needed
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
