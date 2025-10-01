
import admin from 'firebase-admin';

// Prevent re-initialization on hot reloads
if (!admin.apps.length) {
  try {
    // When deployed, App Hosting provides GOOGLE_CLOUD_PROJECT.
    // For local dev, `gcloud auth application-default login` provides credentials.
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'gdgvtu-b2d9e', // Explicitly specify the project ID
    });
    console.log('[Firebase Admin] Initialized successfully.');
  } catch (error: any) {
    console.error('[Firebase Admin] Initialization error:', error.stack);
  }
}

// Export Firestore and optionally Auth or Storage if needed
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
