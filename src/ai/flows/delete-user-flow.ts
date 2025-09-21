
'use server';

import { adminAuth, adminDb } from "@/lib/firebase-admin";

/**
 * Deletes a user from Firebase Authentication and their corresponding document from Firestore.
 * @param userId The UID of the user to delete.
 * @returns A promise that resolves when the user is deleted.
 */
export async function deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    if (!userId) {
        throw new Error("User ID is required.");
    }

    try {
        // First, delete the user from Firebase Authentication
        await adminAuth.deleteUser(userId);

        // Then, delete the user's document from Firestore
        const userRef = adminDb.collection('users').doc(userId);
        await userRef.delete();

        // We can also delete subcollections if necessary, but we'll skip for now.

        return { success: true, message: "User successfully deleted." };

    } catch (error: any) {
        console.error("Error deleting user:", error);
        
        // If the user is already deleted from Auth but not Firestore,
        // we might want to proceed with Firestore deletion.
        if (error.code === 'auth/user-not-found') {
            const userRef = adminDb.collection('users').doc(userId);
            const doc = await userRef.get();
            if (doc.exists) {
                await userRef.delete();
                return { success: true, message: "User was not in Firebase Auth, but was removed from Firestore." };
            }
        }
        
        throw new Error(`Failed to delete user: ${error.message}`);
    }
}
