import { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@/shared/api/supabase';
import { ChatMessage } from './types';

export const useChat = (lobbyId: string, userId: string, nickname: string) => {
  // [FIX] Memoize Supabase client
  const supabase = useMemo(() => createClient(), []);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const channelRef = useRef<any>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('lobby_messages')
        .select(`*, reply_to:lobby_messages!reply_to_id(nickname, content)`)
        .eq('lobby_id', lobbyId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data as any);
    };
    fetchHistory();

    const channel = supabase.channel(`chat_logic:${lobbyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_messages', filter: `lobby_id=eq.${lobbyId}` }, 
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            let newMsg = payload.new as ChatMessage;
            if (newMsg.reply_to_id) {
               const { data } = await supabase.from('lobby_messages').select('nickname, content').eq('id', newMsg.reply_to_id).single();
               newMsg.reply_to = data as any;
            }
            setMessages(prev => [...prev, newMsg]);
          } 
          else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== payload.old.id));
          }
          else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new } : m));
          }
        }
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== userId) {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.add(payload.nickname);
            return next;
          });
          setTimeout(() => {
            setTypingUsers(prev => {
              const next = new Set(prev);
              next.delete(payload.nickname);
              return next;
            });
          }, 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => { supabase.removeChannel(channel); };
  }, [lobbyId, userId, supabase]); // [FIX] Added supabase dependency

  const sendMessage = async (content: string, replyToId?: string) => {
    if (!content.trim()) return;
    await supabase.from('lobby_messages').insert({
      lobby_id: lobbyId,
      user_id: userId,
      nickname,
      content,
      reply_to_id: replyToId || null
    });
  };

const deleteMessage = async (msgId: string) => {
    // Optimistic update
    setMessages(prev => prev.filter(m => m.id !== msgId));
    await supabase.from('lobby_messages').delete().eq('id', msgId);
  };

  const editMessage = async (msgId: string, newContent: string) => {
    await supabase.from('lobby_messages').update({ content: newContent, is_edited: true }).eq('id', msgId);
  };

  const broadcastTyping = () => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: userId, nickname }
      });
    }
  };

  return {
    messages,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    deleteMessage,
    editMessage,
    broadcastTyping
  };
};