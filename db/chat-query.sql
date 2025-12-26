CREATE POLICY "Users can update their own messages"
ON lobby_messages
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON lobby_messages
FOR DELETE
USING (auth.uid() = user_id);