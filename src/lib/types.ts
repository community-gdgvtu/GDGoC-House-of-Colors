
import { z } from 'zod';

// Schema for the input of the bulkCreateUsers flow
export const BulkCreateUsersInputSchema = z.array(z.string().email());
export type BulkCreateUsersInput = z.infer<typeof BulkCreateUsersInputSchema>;

// Schema for the output of the bulkCreateUsers flow
export const BulkCreateUsersOutputSchema = z.object({
  successCount: z.number().describe('The number of users successfully created.'),
  failedCount: z.number().describe('The number of users that failed to be created.'),
  errors: z.array(z.string()).describe('A list of emails that failed and the reason.'),
});
export type BulkCreateUsersOutput = z.infer<typeof BulkCreateUsersOutputSchema>;
