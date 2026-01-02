import { z } from 'zod';

// Helper for loose string/null handling
const NullableString = z.string().nullable().optional().or(z.literal(''));

const FormFactorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Required"),
  description: NullableString,
  weight: z.number().default(1),
  type: z.enum(['numerical', 'constant']).default('numerical'),
  input_control: z.enum(['slider', 'stars', 'number', 'toggle']).default('slider'),
  step: z.number().default(1),
  trend: z.enum(['higher_better', 'lower_better']).default('higher_better'),
  image_url: NullableString, // [FIX] Allows null, undefined, or ""
  is_hidden: z.boolean().default(false),
  disabled_candidates: z.array(z.string()).default([]),
});

const FormCandidateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Candidate Name is required"),
  description: NullableString,
  image_url: NullableString, // [FIX] Allows null, undefined, or ""
  static_values: z.record(z.string(), z.number()).optional()
});

export const SetupWizardSchema = z.object({
  lobby_name: z.string().min(3, "Lobby Name too short").default("My Lobby"),
  settings: z.object({
    privacy: z.enum(['public', 'anonymous']),
    voting_scale: z.object({ max: z.number() }),
    factors: z.array(FormFactorSchema).min(1, "Add at least 1 criteria"),
  }),
  candidates: z.array(FormCandidateSchema).min(2, "Add at least 2 candidates"),
});

export type SetupWizardValues = z.infer<typeof SetupWizardSchema>;