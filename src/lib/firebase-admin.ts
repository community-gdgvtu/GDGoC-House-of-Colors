
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'gdgvtu-b2d9e',
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
