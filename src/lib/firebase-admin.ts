
import admin from 'firebase-admin';

// Prevent re-initialization on hot reloads
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: 'gdgvtu-b2d9e',
    });
  } catch (error: any) {
    // In a server environment, it's better to let the error propagate
    // or use a proper logger rather than console.log at the module level.
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
