
import { z } from 'zod';

export const BulkCreateUsersInputSchema = z.object({
    emails: z.string().describe("A newline-separated list of user emails to create."),
});
export type BulkCreateUsersInput = z.infer<typeof BulkCreateUsersInputSchema>;

export const BulkCreateUsersOutputSchema = z.object({
    successful: z.array(z.string()).describe("A list of emails that were successfully created."),
    failed: z.array(z.object({
        email: z.string(),
        reason: z.string(),
    })).describe("A list of emails that failed to be created, along with the reason."),
});
export type BulkCreateUsersOutput = z.infer<typeof BulkCreateUsersOutputSchema>;


export const BulkManagePointsInputSchema = z.object({
    userCustomIds: z.string().describe("A newline-separated list of user custom IDs (e.g., GOOGE001)."),
    points: z.number().describe("The number of points to add (positive) or deduct (negative)."),
    remark: z.string().describe("The reason for the point adjustment."),
});
export type BulkManagePointsInput = z.infer<typeof BulkManagePointsInputSchema>;

export const BulkManagePointsOutputSchema = z.object({
    successful: z.array(z.string()).describe("A list of custom IDs that were successfully updated."),
    failed: z.array(z.object({
        customId: z.string(),
        reason: z.string(),
    })).describe("A list of custom IDs that failed to be updated, along with the reason."),
    updatedUsers: z.array(z.any()).describe("A list of the full user objects that were updated."),
});
export type BulkManagePointsOutput = z.infer<typeof BulkManagePointsOutputSchema>;
