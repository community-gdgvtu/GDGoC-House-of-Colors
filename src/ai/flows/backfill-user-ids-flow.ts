
'use server';

import { adminDb } from "@/lib/firebase-admin";
import { type User } from "@/lib/data";

type BackfillResult = {
    updatedCount: number;
    skippedCount: number;
}

export async function backfillCustomIds(): Promise<BackfillResult> {
    const usersRef = adminDb.collection('users');
    const usersSnapshot = await usersRef.get();
    
    const usersToUpdate: User[] = [];
    usersSnapshot.forEach(doc => {
        const user = { id: doc.id, ...doc.data() } as User;
        // Only backfill users who are missing a proper customId
        if (!user.customId || user.customId === 'pending') {
            usersToUpdate.push(user);
        }
    });

    if (usersToUpdate.length === 0) {
        return { updatedCount: 0, skippedCount: usersSnapshot.size };
    }

    const counterRef = adminDb.collection('metadata').doc('userCounter');
    
    let updatedCount = 0;

    // Use a transaction to ensure we get a consistent block of IDs
    await adminDb.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let currentCount = counterDoc.exists ? counterDoc.data()?.count || 0 : 0;

        for (const user of usersToUpdate) {
            currentCount++;
            const newCustomId = `GOOGE${String(currentCount).padStart(3, '0')}`;
            const userRef = usersRef.doc(user.id);
            transaction.update(userRef, { customId: newCustomId });
            updatedCount++;
        }

        // Set the new counter value. Use merge to create it if it doesn't exist.
        transaction.set(counterRef, { count: currentCount }, { merge: true });
    });

    return { 
        updatedCount,
        skippedCount: usersSnapshot.size - updatedCount,
    };
}
