
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

    for (const email of emails) {
        try {
            const password = generateRandomPassword();
            const userRecord = await adminAuth.createUser({
                email,
                password,
                emailVerified: false,
            });

            const newUser: User = {
                id: userRecord.uid,
                name: email.split('@')[0], // Default name from email
                email: email,
                points: 0,
                houseId: '',
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
