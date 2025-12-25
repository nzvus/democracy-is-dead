-- 1. Abilita la modifica (UPDATE) per i propri messaggi
CREATE POLICY "Users can update their own messages"
ON lobby_messages
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Abilita la cancellazione (DELETE) per i propri messaggi
CREATE POLICY "Users can delete their own messages"
ON lobby_messages
FOR DELETE
USING (auth.uid() = user_id);