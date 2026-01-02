import { z } from 'zod';
import { FactorSchema } from '@/entities/factor/model/types';

export const VotingScaleSchema = z.object({
  max: z.number().min(5).max(100).default(10),
});

// [FIX] Updated Privacy Schema to allow Granular Object
export const PrivacySchema = z.union([
  z.enum(['public', 'anonymous']),
  z.object({
    users: z.enum(['visible', 'hidden']).optional(),
    candidates: z.enum(['visible', 'hidden']).optional(),
    factors: z.enum(['visible', 'hidden']).optional(),
  })
]);

export const LobbySettingsSchema = z.object({
  privacy: PrivacySchema.default('public'),
  voting_scale: VotingScaleSchema,
  allow_decimals: z.boolean().default(false),
  factors: z.array(FactorSchema).default([]),
});

export type LobbySettings = z.infer<typeof LobbySettingsSchema>;

export type LobbyStatus = 'waiting' | 'setup' | 'voting' | 'ended';

export interface Lobby {
  id: string;
  code: string;
  host_id: string;
  name: string;
  status: LobbyStatus;
  settings: LobbySettings;
  created_at: string;
}