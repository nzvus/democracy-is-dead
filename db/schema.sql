
DROP TABLE IF EXISTS lobby_messages CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS lobby_participants CASCADE;
DROP TABLE IF EXISTS lobbies CASCADE;

CREATE TABLE lobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    host_id UUID NOT NULL,
    status TEXT DEFAULT 'setup',
    settings JSONB DEFAULT '{
        "privacy": "private", 
        "voting_scale": {"max": 10}, 
        "factors": []
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lobby_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    nickname TEXT,
    avatar_url TEXT, 
    has_voted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lobby_id, user_id)
);

CREATE TABLE candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    static_values JSONB DEFAULT '{}'::jsonb, 
    created_at TIMESTAMPTZ DEFAULT NOW() 
);

CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL,
    scores JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, voter_id) 
);

CREATE TABLE lobby_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    nickname TEXT,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_messages ENABLE ROW LEVEL SECURITY;


-- Lobbies
CREATE POLICY "Public access lobbies" ON lobbies FOR ALL USING (true);

-- Partecipanti
CREATE POLICY "Public access participants" ON lobby_participants FOR ALL USING (true);

-- Candidati
CREATE POLICY "Public access candidates" ON candidates FOR ALL USING (true);

-- Voti
CREATE POLICY "Public access votes" ON votes FOR ALL USING (true);

-- Chat
CREATE POLICY "Public access messages" ON lobby_messages FOR ALL USING (true);

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('candidates', 'candidates', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('factors', 'factors', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Candidates" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Factors" ON storage.objects;

CREATE POLICY "Public Access Avatars" ON storage.objects FOR ALL USING (bucket_id = 'avatars');
CREATE POLICY "Public Access Candidates" ON storage.objects FOR ALL USING (bucket_id = 'candidates');
CREATE POLICY "Public Access Factors" ON storage.objects FOR ALL USING (bucket_id = 'factors');

alter publication supabase_realtime add table lobbies;
alter publication supabase_realtime add table lobby_participants;
alter publication supabase_realtime add table candidates;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table lobby_messages;