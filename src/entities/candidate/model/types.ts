import { z } from 'zod';

export const CandidateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(300).optional(),
  image_url: z.string().url().nullable().optional(),
  // Static values for "Constant" factors (e.g. Price: 100)
  static_values: z.record(z.string(), z.number()).optional(),
});

export type Candidate = z.infer<typeof CandidateSchema> & {
  id: string; // ID is required in the application type
  lobby_id: string;
};