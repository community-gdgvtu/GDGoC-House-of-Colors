
'use server';

import { adminDb } from "@/lib/firebase-admin";
import { BulkManagePointsInput, BulkManagePointsOutput } from "@/lib/types";
import { FieldValue, WriteBatch } from "firebase-admin/firestore";
import { User } from "@/lib/data";

const MAX_BATCH_SIZE = 500; // Firestore batch limit

export async function bulkManagePoints(input: BulkManagePointsInput): Promise<BulkManagePointsOutput> {
    const { userCustomIds, points, remark, awardedById } = input;

    if (points === 0) {
        throw new Error("Points cannot be zero.");
    }
    if (!remark.trim()) {
        throw new Error("Remark cannot be empty.");
    }
    if (!awardedById) {
        throw new Error("AwardedBy ID is missing.");
    }

    const awardingUserDoc = await adminDb.collection('users').doc(awardedById).get();
    if (!awardingUserDoc.exists) {
        throw new Error("The user awarding points does not exist.");
    }
    const awardingUser = awardingUserDoc.data() as User;

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
             // Role-based validation
            if (awardingUser.role === 'manager' && user.role !== 'user') {
                failed.push({ customId, reason: "Managers can only award points to users." });
                continue;
            }
            if (awardingUser.role === 'manager' && user.communityId !== awardingUser.communityId) {
                failed.push({ customId, reason: "Manager can only award points to users in their own community."});
                continue;
            }
            if (user.role === 'organizer') {
                failed.push({ customId, reason: "Cannot manage points for organizers." });
                continue;
            }

            const userRef = usersRef.doc(userId);
            const historyRef = userRef.collection('point_history').doc();

            batch.update(userRef, { points: FieldValue.increment(points) });
            batch.set(historyRef, {
                pointsAdded: points,
                remark: remark,
                timestamp: FieldValue.serverTimestamp(),
                awardedById: awardingUser.id,
                awardedByName: awardingUser.name,
                awardedToId: user.id,
                awardedToName: user.name,
            });

            writeCount += 2;

            successful.push(customId);
            updatedUsers.push({ ...user, points: (user.points || 0) + points });

            if (writeCount >= MAX_BATCH_SIZE - 1) {
                await batch.commit();
                batch = adminDb.batch();
                writeCount = 0;
            }
        }

        if (writeCount > 0) {
            await batch.commit();
        }

    } catch (error: any) {
        console.error("Error during bulk points management:", error);
        if (failed.length === 0 && successful.length === 0) {
            customIds.forEach(customId => {
                failed.push({ customId, reason: `An unexpected error occurred: ${error.message}` });
            });
        }
    }

    return { successful, failed, updatedUsers };
}
