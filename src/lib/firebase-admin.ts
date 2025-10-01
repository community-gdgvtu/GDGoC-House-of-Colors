
import admin from 'firebase-admin';

// Prevent re-initialization on hot reloads
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'gdgvtu-b2d9e',
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
