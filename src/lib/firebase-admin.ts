import admin from 'firebase-admin';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Prevent re-initialization on hot reloads
if (!admin.apps.length) {
  try {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!serviceAccountPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
    }

    if (!fs.existsSync(serviceAccountPath)) {
      console.error('[Firebase Admin] Service account file not found at path:', serviceAccountPath);
      console.error('[Firebase Admin] Please download your service account key from the Firebase console and place it in the root directory as \'service-account.json\'');
      // Use ADC as a fallback for cloud environments where the file might not be present but ADC is configured.
      console.log('[Firebase Admin] Attempting to initialize with Application Default Credentials as a fallback.');
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: 'https://gdgoc-vtu.firebaseio.com',
      });
    } else {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://gdgoc-vtu.firebaseio.com',
      });
      console.log('[Firebase Admin] Initialized with Service Account file.');
    }

  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error);
    // If all else fails, try ADC.
    if (!admin.apps.length) {
       try {
         admin.initializeApp({
           credential: admin.credential.applicationDefault(),
           databaseURL: 'https://gdgoc-vtu.firebaseio.com',
         });
         console.log('[Firebase Admin] Initialized with ADC as a final fallback.');
       } catch (adcError) {
         console.error('[Firebase Admin] ADC Fallback Initialization error:', adcError);
       }
    }
  }
}

// Export Firestore and optionally Auth or Storage if needed
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
