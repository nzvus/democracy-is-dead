import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useChat } from '@/features/chat/model/useChat';
import { usePresence } from '@/features/chat/model/usePresence';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/shared/ui/button';
import { MessageCircle, X, Send, ChevronRight } from 'lucide-react';
import { ChatMessage } from '@/features/chat/model/types';
import { createClient } from '@/shared/api/supabase';

export const ChatWidget = ({ lobbyId, userId }: { lobbyId: string, userId: string }) => {
  const t = useTranslations('Chat');
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  
  // [FIX] Fetch real participant data for avatars
  const [participantsMap, setParticipantsMap] = useState<Record<string, { nickname: string; avatar_url: string | null }>>({});
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.from('lobby_participants').select('user_id, nickname, avatar_url').eq('lobby_id', lobbyId)
      .then(({ data }) => {
        if (data) {
          const map: any = {};
          data.forEach(p => map[p.user_id] = p);
          setParticipantsMap(map);
        }
      });
  }, [lobbyId, supabase]);

  const currentUser = participantsMap[userId] || { nickname: "User", avatar_url: null };
  
  const { messages, typingUsers, sendMessage, deleteMessage, editMessage, broadcastTyping } = useChat(lobbyId, userId, currentUser.nickname);
  const { onlineUsers } = usePresence(lobbyId, userId, currentUser.nickname);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input, replyTarget?.id);
    setInput("");
    setReplyTarget(null);
  };

  return (
    <>
      {/* Floating Action Button - [FIX] Raised higher for Mobile */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 group flex items-center gap-2 pl-4 pr-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:block">{t('title')}</span>
          <div className="bg-white/20 p-2 rounded-full relative">
            <MessageCircle size={20} />
            {onlineUsers.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-indigo-600 animate-pulse" />
            )}
          </div>
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[85vw] sm:w-[400px] bg-[#0b0f19] border-l border-white/10 shadow-2xl z-[100] flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-4 bg-gray-900/80 border-b border-white/10 flex justify-between items-center backdrop-blur-md">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
                <MessageCircle size={18} className="text-indigo-400" /> 
                {t('title')}
            </h3>
            <span className="text-[10px] text-green-400 font-mono tracking-wider ml-6 block">
              {'\u25CF'} {t('online_count', { count: onlineUsers.length })}
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 bg-gradient-to-b from-[#0b0f19] to-[#111827] scrollbar-thin scrollbar-thumb-gray-800">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
               <MessageCircle size={48} />
               <p className="text-sm">{t('empty')}</p>
            </div>
          )}
          
          <div className="flex flex-col gap-0.5"> {/* [FIX] Tighter gap */}
            {messages.map((m, index) => {
                const prevMsg = messages[index - 1];
                // Strict sequence check: same user, < 2 mins, and prev message wasn't a system msg
                const isSequence = prevMsg && prevMsg.user_id === m.user_id && (new Date(m.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 120000);
                
                // Get real user data from map
                const senderData = participantsMap[m.user_id] || { nickname: m.nickname, avatar_url: null };

                return (
                <MessageBubble 
                    key={m.id} 
                    message={{ ...m, nickname: senderData.nickname }} // Use latest nickname
                    avatarUrl={senderData.avatar_url} // [FIX] Pass real avatar
                    isMe={m.user_id === userId}
                    onReply={setReplyTarget}
                    onEdit={editMessage}
                    onDelete={deleteMessage}
                    showAvatar={!isSequence}
                />
                );
            })}
          </div>
          <div ref={bottomRef} />
        </div>

        {/* Input & Reply (Same as before) */}
        {replyTarget && (
          <div className="bg-gray-800/50 px-4 py-2 border-t border-white/5 flex justify-between items-center backdrop-blur">
            <div className="text-xs text-gray-300 truncate max-w-[250px] border-l-2 border-indigo-500 pl-2">
              <span className="font-bold text-indigo-400 block">@{replyTarget.nickname}</span>
              <span className="opacity-70 line-clamp-1">{replyTarget.content}</span>
            </div>
            <button onClick={() => setReplyTarget(null)}><X size={14} className="text-gray-500 hover:text-white" /></button>
          </div>
        )}

        <form onSubmit={handleSend} className="p-3 bg-gray-900 border-t border-white/10 flex gap-2">
          <input 
            className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-gray-600 transition-colors"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              broadcastTyping(); 
            }}
            placeholder={t('placeholder')}
            autoFocus={isOpen}
          />
          <Button type="submit" variant="primary" className="px-3 rounded-xl h-full shadow-none bg-indigo-600 hover:bg-indigo-500">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </>
  );
};