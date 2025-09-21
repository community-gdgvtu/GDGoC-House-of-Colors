
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
export type BulkCreateUsersOutput = z`infer`<typeof BulkCreateUsersOutputSchema>;
