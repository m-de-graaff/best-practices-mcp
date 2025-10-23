/**
 * Input validation schemas using Zod
 */

import { z } from 'zod';
import { VALID_TOPICS } from './types';

/**
 * Schema for get_best_practice tool input
 */
export const getPracticeSchema = z.object({
  topic: z
    .string()
    .min(1, 'Topic cannot be empty')
    .max(50, 'Topic too long')
    .toLowerCase()
    .refine(
      (val) => VALID_TOPICS.includes(val as any),
      {
        message: `Invalid topic. Must be one of: ${VALID_TOPICS.join(', ')}`,
      }
    )
    .describe(
      `Topic to fetch best practices for (${VALID_TOPICS.join(', ')})`
    ),
});

export type GetPracticeInput = z.infer<typeof getPracticeSchema>;

