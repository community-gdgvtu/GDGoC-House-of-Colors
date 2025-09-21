
'use server';

import { adminDb } from "@/lib/firebase-admin";
import { type User } from "@/lib/data";
import { FieldValue } from "firebase-admin/firestore";
import { type ChangeUserHouseInput } from "@/lib/types";


export async function changeUserHouse(input: ChangeUserHouseInput): Promise<User> {
    const { userId, newHouseId, oldHouseId } = input;

    if (newHouseId === oldHouseId) {
        // Nothing to do, but we should probably fetch and return the user.
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) throw new Error("User not found during no-op change.");
        return userDoc.data() as User;
    }

    try {
        await adminDb.runTransaction(async (transaction) => {
            const userRef = adminDb.collection("users").doc(userId);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error("User does not exist!");
            }
            const userData = userDoc.data() as User;
            const userPoints = userData.points || 0;

            // Define refs for new and old houses
            const newHouseRef = newHouseId ? adminDb.collection("houses").doc(newHouseId) : null;
            const oldHouseRef = oldHouseId ? adminDb.collection("houses").doc(oldHouseId) : null;
            
            // We need to read the old house to ensure it exists before trying to update it.
            if (oldHouseRef) {
                const oldHouseDoc = await transaction.get(oldHouseRef);
                 if (oldHouseDoc.exists) {
                    transaction.update(oldHouseRef, { points: FieldValue.increment(-userPoints) });
                }
            }
            
            // Now update the user and the new house.
            transaction.update(userRef, { houseId: newHouseId });

            if (newHouseRef) {
                transaction.update(newHouseRef, { points: FieldValue.increment(userPoints) });
            }
        });

        // After the transaction, get the final state of the user to return
        const updatedUserSnap = await adminDb.collection('users').doc(userId).get();
        if (!updatedUserSnap.exists) {
            throw new Error("User mysteriously disappeared after transaction.");
        }
        return updatedUserSnap.data() as User;

    } catch (error: any) {
        console.error("Transaction failed: ", error);
        throw new Error(`Failed to change user's house: ${error.message}`);
    }
}
