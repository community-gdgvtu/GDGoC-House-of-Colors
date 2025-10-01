
'use server';

import { adminDb } from "@/lib/firebase-admin";

export async function deleteCommunity(communityId: string): Promise<void> {
    if (!communityId) {
        throw new Error("Community ID is required.");
    }

    const communityRef = adminDb.collection('communities').doc(communityId);
    
    await adminDb.runTransaction(async (transaction) => {
        const communityDoc = await transaction.get(communityRef);
        if (!communityDoc.exists) {
            throw new Error("Community not found.");
        }

        // Find all users in this community and unassign them
        const usersQuery = adminDb.collection('users').where('communityId', '==', communityId);
        const usersSnapshot = await transaction.get(usersQuery);

        usersSnapshot.forEach(userDoc => {
            transaction.update(userDoc.ref, { communityId: null });
        });

        // Delete the community document
        transaction.delete(communityRef);
    });
}
