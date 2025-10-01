
'use server';

import { adminDb } from "@/lib/firebase-admin";

export async function createCommunity(name: string): Promise<void> {
    if (!name || !name.trim()) {
        throw new Error("Community name cannot be empty.");
    }
    
    const communityRef = adminDb.collection('communities').doc();
    await communityRef.set({
        name: name.trim(),
    });
}
