CREATE OR REPLACE FUNCTION get_secure_participants(target_lobby_id UUID)
RETURNS TABLE (
  user_id UUID,
  nickname TEXT,
  avatar_url TEXT,
  has_voted BOOLEAN,
  badges JSONB
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  privacy_mode TEXT;
  viewer_id UUID;
BEGIN
  viewer_id := auth.uid();
  SELECT settings->>'privacy' INTO privacy_mode FROM lobbies WHERE id = target_lobby_id;

  RETURN QUERY
  SELECT 
    p.user_id,
    CASE 
      WHEN privacy_mode = 'anonymous' AND p.user_id != viewer_id THEN 'Anonymous Voter'
      ELSE p.nickname 
    END,
    CASE 
      WHEN privacy_mode = 'anonymous' AND p.user_id != viewer_id THEN NULL -- Hide Avatar
      ELSE p.avatar_url 
    END,
    p.has_voted,
    p.badges
  FROM lobby_participants p
  WHERE p.lobby_id = target_lobby_id;
END;
$$;