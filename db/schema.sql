-- =================================================================
-- 1. RESET TOTALE (CANCELLAZIONE)
-- =================================================================
-- Elimina le tabelle esistenti in ordine di dipendenza per evitare conflitti
DROP TABLE IF EXISTS lobby_messages CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;
DROP TABLE IF EXISTS lobby_participants CASCADE;
DROP TABLE IF EXISTS lobbies CASCADE;

-- =================================================================
-- 2. CREAZIONE TABELLE
-- =================================================================

-- A. Lobbies
CREATE TABLE lobbies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    host_id UUID NOT NULL,
    status TEXT DEFAULT 'setup', -- 'setup', 'voting', 'ended'
    settings JSONB DEFAULT '{
        "privacy": "private", 
        "voting_scale": {"max": 10}, 
        "factors": []
    }'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Partecipanti (Utenti nella lobby)
CREATE TABLE lobby_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    nickname TEXT,
    avatar_url TEXT, -- URL dell'avatar (uploadato o generato)
    has_voted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lobby_id, user_id) -- Un utente non può entrare due volte nella stessa lobby
);

-- C. Candidati (Le opzioni da votare)
CREATE TABLE candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT, -- Foto del candidato
    static_values JSONB DEFAULT '{}'::jsonb, -- Dati oggettivi (es. Prezzo: 10)
    created_at TIMESTAMPTZ DEFAULT NOW() -- Importante per l'ordinamento
);

-- D. Voti
CREATE TABLE votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL,
    scores JSONB DEFAULT '{}'::jsonb, -- Mappa { "factor_id": voto_numerico }
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_id, voter_id) -- Un utente vota un candidato una sola volta
);

-- E. Chat
CREATE TABLE lobby_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    nickname TEXT,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =================================================================
-- 3. SICUREZZA (ROW LEVEL SECURITY - RLS)
-- =================================================================
-- Abilita RLS su tutte le tabelle
ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_messages ENABLE ROW LEVEL SECURITY;

-- Policy PERMISSIVE (Ideali per MVP/Demo, evita errori 403/406)
-- In produzione dovresti restringere queste policy (es. solo l'host può modificare candidates)

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

-- =================================================================
-- 4. STORAGE (BUCKETS PER IMMAGINI)
-- =================================================================

-- Crea i bucket se non esistono (Avatars, Candidates, Factors)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('candidates', 'candidates', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('factors', 'factors', true) ON CONFLICT DO NOTHING;

-- Rimuovi vecchie policy storage per evitare duplicati/errori
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Candidates" ON storage.objects;
DROP POLICY IF EXISTS "Public Access Factors" ON storage.objects;

-- Crea policy per permettere upload e visualizzazione pubblica
CREATE POLICY "Public Access Avatars" ON storage.objects FOR ALL USING (bucket_id = 'avatars');
CREATE POLICY "Public Access Candidates" ON storage.objects FOR ALL USING (bucket_id = 'candidates');
CREATE POLICY "Public Access Factors" ON storage.objects FOR ALL USING (bucket_id = 'factors');

-- =================================================================
-- 5. ABILITAZIONE REALTIME
-- =================================================================
-- Aggiunge le tabelle alla pubblicazione realtime di Supabase
-- Nota: Se fallisce, fallo manualmente da Dashboard: Database -> Publications
alter publication supabase_realtime add table lobbies;
alter publication supabase_realtime add table lobby_participants;
alter publication supabase_realtime add table candidates;
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table lobby_messages;