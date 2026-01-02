import { createClient } from '@/shared/api/supabase';

export interface SubmitVotePayload {
  lobby_id: string;
  voter_id: string;
  candidate_id: string;
  scores: Record<string, number>;
}

export const submitVote = async (payload: SubmitVotePayload) => {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('votes')
    .upsert({
      lobby_id: payload.lobby_id,
      voter_id: payload.voter_id,
      candidate_id: payload.candidate_id,
      scores: payload.scores,
      updated_at: new Date().toISOString()
    }, { onConflict: 'voter_id,candidate_id' });

  if (error) throw error;
  return true;
};