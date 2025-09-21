
'use server';
/**
 * @fileOverview A flow for bulk-creating users in Firebase.
 *
 * - bulkCreateUsers - A function that handles creating multiple users from a list of emails.
 */

import { ai } from '@/ai/genkit';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { 
  BulkCreateUsersInputSchema, 
  BulkCreateUsersOutputSchema, 
  type BulkCreateUsersInput, 
  type BulkCreateUsersOutput 
} from '@/lib/types';


export async function bulkCreateUsers(emails: BulkCreateUsersInput): Promise<BulkCreateUsersOutput> {
  return bulkCreateUsersFlow(emails);
}

function generateRandomPassword() {
  // Generates an 8-character random string.
  // Note: This is for initial setup only. Users are expected to reset it.
  return Math.random().toString(36).slice(-8);
}

const bulkCreateUsersFlow = ai.defineFlow(
  {
    name: 'bulkCreateUsersFlow',
    inputSchema: BulkCreateUsersInputSchema,
    outputSchema: BulkCreateUsersOutputSchema,
  },
  async (emails) => {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    const creationPromises = emails.map(async (email) => {
      try {
        // 1. Create user in Firebase Auth
        const password = generateRandomPassword();
        const userRecord = await adminAuth.createUser({
          email,
          password,
          emailVerified: false,
        });

        // 2. Create user document in Firestore
        const userRef = adminDb.collection('users').doc(userRecord.uid);
        await userRef.set({
          id: userRecord.uid,
          name: email.split('@')[0] || 'New User', // Default name from email
          email: email,
          points: 0,
          houseId: '',
          role: 'user',
          avatar: `https://i.pravatar.cc/150?u=${userRecord.uid}`,
        });

        successCount++;
      } catch (error: any) {
        failedCount++;
        const errorMessage = error.code === 'auth/email-already-exists'
          ? `Email ${email} already exists.`
          : `Failed to create ${email}: ${error.message}`;
        errors.push(errorMessage);
        console.error(errorMessage);
      }
    });

    // Wait for all user creation attempts to complete
    await Promise.all(creationPromises);

    return {
      successCount,
      failedCount,
      errors,
    };
  }
);
