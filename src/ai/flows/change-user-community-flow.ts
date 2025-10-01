
'use server';

import { adminDb } from "@/lib/firebase-admin";
import { type User } from "@/lib/data";
import { type ChangeUserCommunityInput } from "@/lib/types";


export async function changeUserCommunity(input: ChangeUserCommunityInput): Promise<User> {
    const { userId, newCommunityId } = input;

    const userRef = adminDb.collection("users").doc(userId);
    
    await userRef.update({ communityId: newCommunityId || null });

    const updatedUserSnap = await userRef.get();
    if (!updatedUserSnap.exists) {
        throw new Error("User mysteriously disappeared after update.");
    }
    return updatedUserSnap.data() as User;
}
