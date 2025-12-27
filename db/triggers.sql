-- 2. Aggiungi il riferimento per il REMIX alle lobby
ALTER TABLE lobbies 
ADD COLUMN remixed_from_id UUID REFERENCES lobbies(id) ON DELETE SET NULL;

-- 3. Trigger per assicurare un solo Jolly per utente per lobby (Opzionale ma consigliato)
CREATE OR REPLACE FUNCTION check_single_jolly()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_jolly = TRUE THEN
        IF EXISTS (
            SELECT 1 FROM votes 
            WHERE lobby_id = NEW.lobby_id 
            AND voter_id = NEW.voter_id 
            AND is_jolly = TRUE 
            AND id <> NEW.id -- Esclude se stesso in caso di update
        ) THEN
            RAISE EXCEPTION 'Un utente può usare un solo Jolly per lobby!';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_jolly
BEFORE INSERT OR UPDATE ON votes
FOR EACH ROW EXECUTE FUNCTION check_single_jolly();