import { z } from 'zod';
import { FactorSchema } from '@/entities/factor/model/types';

export const VotingScaleSchema = z.object({
  max: z.number().min(5).max(100).default(10),
});

export const LobbySettingsSchema = z.object({
  privacy: z.enum(['public', 'anonymous', 'blind']).default('public'),
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
  // [FIX] Added name property
  name: string;
  status: LobbyStatus;
  settings: LobbySettings;
  created_at: string;
}