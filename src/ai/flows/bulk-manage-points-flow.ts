
'use server';

import { adminDb } from "@/lib/firebase-admin";
import { BulkManagePointsInput, BulkManagePointsOutput } from "@/lib/types";
import { FieldValue, WriteBatch } from "firebase-admin/firestore";
import { User } from "@/lib/data";

const MAX_BATCH_SIZE = 500; // Firestore batch limit

export async function bulkManagePoints(input: BulkManagePointsInput): Promise<BulkManagePointsOutput> {
    const { userCustomIds, points, remark } = input;

    if (points === 0) {
        throw new Error("Points cannot be zero.");
    }
    if (!remark.trim()) {
        throw new Error("Remark cannot be empty.");
    }

    const customIds = userCustomIds.split('\n').map(id => id.trim()).filter(id => id);
    if (customIds.length === 0) {
        return { successful: [], failed: [], updatedUsers: [] };
    }

    const successful: string[] = [];
    const failed: { customId: string, reason: string }[] = [];
    const updatedUsers: User[] = [];

    const usersRef = adminDb.collection('users');

    try {
        const querySnapshot = await usersRef.where('customId', 'in', customIds).get();

        const idToUserMap = new Map<string, { id: string, data: User }>();
        querySnapshot.forEach(doc => {
            const userData = doc.data() as User;
            idToUserMap.set(userData.customId, { id: doc.id, data: userData });
        });

        // Check for IDs that were not found
        for (const customId of customIds) {
            if (!idToUserMap.has(customId)) {
                failed.push({ customId, reason: "User not found." });
            }
        }
        
        let batch = adminDb.batch();
        let writeCount = 0;

        for (const [customId, { id: userId, data: user }] of idToUserMap.entries()) {
            if (user.role === 'admin') {
                failed.push({ customId, reason: "Cannot manage points for admin users." });
                continue;
            }

            const userRef = usersRef.doc(userId);
            const historyRef = userRef.collection('point_history').doc();

            batch.update(userRef, { points: FieldValue.increment(points) });
            batch.set(historyRef, {
                pointsAdded: points,
                remark: remark,
                timestamp: FieldValue.serverTimestamp(),
            });

            writeCount += 2; // 2 writes per user

            // House points update
            if (user.houseId) {
                const houseRef = adminDb.collection('houses').doc(user.houseId);
                batch.update(houseRef, { points: FieldValue.increment(points) });
                writeCount++;
            }

            successful.push(customId);
            updatedUsers.push({ ...user, points: user.points + points });

            if (writeCount >= MAX_BATCH_SIZE - 2) {
                await batch.commit();
                batch = adminDb.batch();
                writeCount = 0;
            }
        }

        if (writeCount > 0) {
            await batch.commit();
        }

    } catch (error: any) {
        // This is a general catch block. Specific failures are already in the `failed` array.
        console.error("Error during bulk points management:", error);
        throw new Error(`An unexpected error occurred: ${error.message}`);
    }

    return { successful, failed, updatedUsers };
}
