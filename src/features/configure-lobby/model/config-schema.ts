import { z } from 'zod';
import { FactorSchema } from '@/entities/factor/model/types';

// Relaxed Candidate Schema for the Form (Handles empty strings from inputs)
const FormCandidateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Candidate Name is required"),
  description: z.string().optional().or(z.literal('')),
  image_url: z.string().optional().or(z.literal('')), // [FIX] Allow empty string
  static_values: z.record(z.string(), z.number()).optional()
});

export const SetupWizardSchema = z.object({
  lobby_name: z.string().min(3, "Lobby Name must be at least 3 chars").default("My Lobby"),
  settings: z.object({
    privacy: z.enum(['public', 'anonymous']),
    voting_scale: z.object({ max: z.number() }),
    factors: z.array(FactorSchema).min(1, "Add at least 1 criteria"),
  }),
  candidates: z.array(FormCandidateSchema).min(2, "Add at least 2 candidates"),
});

export type SetupWizardValues = z.infer<typeof SetupWizardSchema>;