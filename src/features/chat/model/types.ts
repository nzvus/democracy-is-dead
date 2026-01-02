export interface ChatMessage {
  id: string;
  user_id: string;
  nickname: string;
  content: string;
  created_at: string;
  is_edited?: boolean;
  reply_to_id?: string | null;
  // Join fields (if you fetch them via Supabase join, optional for now)
  reply_to?: {
    nickname: string;
    content: string;
  };
}

export interface PresenceState {
  user_id: string;
  nickname: string;
  online_at: string;
}