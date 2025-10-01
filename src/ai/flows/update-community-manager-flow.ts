
'use server';

import { adminDb } from "@/lib/firebase-admin";
import { type UpdateCommunityManagerInput } from "@/lib/types";

export async function updateCommunityManager(input: UpdateCommunityManagerInput): Promise<void> {
    const { communityId, newManagerId, oldManagerId } = input;

    await adminDb.runTransaction(async (transaction) => {
        const communityRef = adminDb.collection('communities').doc(communityId);

        // 1. Update the community document with the new manager's ID
        if (newManagerId) {
            transaction.update(communityRef, { managerId: newManagerId });
        } else {
            // If newManagerId is empty, we are unassigning the manager
            transaction.update(communityRef, { managerId: null });
        }

        // 2. Set the new manager's role to 'manager'
        if (newManagerId) {
            const newManagerRef = adminDb.collection('users').doc(newManagerId);
            transaction.update(newManagerRef, { role: 'manager' });
        }

        // 3. If there was an old manager, set their role back to 'user'
        if (oldManagerId && oldManagerId !== newManagerId) {
            const oldManagerRef = adminDb.collection('users').doc(oldManagerId);
            const oldManagerDoc = await transaction.get(oldManagerRef);
            // Don't demote an organizer
            if (oldManagerDoc.exists && oldManagerDoc.data()?.role !== 'organizer') {
               transaction.update(oldManagerRef, { role: 'user' });
            }
        }
    });
}
