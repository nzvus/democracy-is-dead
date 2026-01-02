import { z } from 'zod';

export type FactorType = 'numerical' | 'constant';
export type Trend = 'higher_better' | 'lower_better';
export type InputControl = 'slider' | 'stars' | 'number' | 'toggle';

export const FactorSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  weight: z.number().min(-10).max(10).default(1), // Allow negatives
  type: z.enum(['numerical', 'constant']).default('numerical'),
  input_control: z.enum(['slider', 'stars', 'number', 'toggle']).default('slider'),
  // [NEW] Decimals configuration
  step: z.number().default(1), 
  trend: z.enum(['higher_better', 'lower_better']).default('higher_better'),
  image_url: z.string().optional(),
  is_hidden: z.boolean().default(false),
});

export type Factor = z.infer<typeof FactorSchema>;