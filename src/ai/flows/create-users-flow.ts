
'use server';

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { BulkCreateUsersInput, BulkCreateUsersOutput } from "@/lib/types";
import { User } from "@/lib/data";

function generateRandomPassword(length = 12) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

export async function bulkCreateUsers(input: BulkCreateUsersInput): Promise<BulkCreateUsersOutput> {
    const emails = input.emails.split('\n').map(e => e.trim()).filter(e => e);
    const successful: string[] = [];
    const failed: { email: string; reason: string }[] = [];
    const counterRef = adminDb.collection('metadata').doc('userCounter');

    for (const email of emails) {
        try {
            const userRecord = await adminAuth.createUser({
                email,
                password: generateRandomPassword(),
                emailVerified: false,
            });

            // Run a transaction to atomically get and increment the counter
            const newCustomId = await adminDb.runTransaction(async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                const currentCount = counterDoc.exists ? counterDoc.data()?.count || 0 : 0;
                const newCount = currentCount + 1;
                
                transaction.set(counterRef, { count: newCount }, { merge: true });

                return `GDGVTU${String(newCount).padStart(3, '0')}`;
            });

            const newUser: User = {
                id: userRecord.uid,
                customId: newCustomId,
                name: email.split('@')[0], // Default name from email
                email: email,
                points: 0,
                role: 'user',
                avatar: `https://i.pravatar.cc/150?u=${userRecord.uid}`,
            };

            await adminDb.collection('users').doc(userRecord.uid).set(newUser);
            successful.push(email);

        } catch (error: any) {
            failed.push({ email, reason: error.message });
        }
    }

    return { successful, failed };
}
