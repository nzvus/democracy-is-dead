import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useChat } from '@/features/chat/model/useChat';
import { usePresence } from '@/features/chat/model/usePresence';
import { MessageBubble } from './MessageBubble';
import { Button } from '@/shared/ui/button';
import { MessageSquare, X, Send, CornerDownRight } from 'lucide-react';
import { ChatMessage } from '@/features/chat/model/types';

export const ChatWidget = ({ lobbyId, userId }: { lobbyId: string, userId: string }) => {
  const t = useTranslations('Chat');
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [replyTarget, setReplyTarget] = useState<ChatMessage | null>(null);
  
  const { messages, typingUsers, sendMessage, deleteMessage, editMessage, broadcastTyping } = useChat(lobbyId, userId, "User");
  const { onlineUsers } = usePresence(lobbyId, userId, "User");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-3 md:bottom-8">
      {onlineUsers.length > 0 && (
          <div className="bg-black/60 backdrop-blur border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-green-400 shadow-xl animate-in fade-in">
            {'\u25CF'} {t('online_count', { count: onlineUsers.length })}
          </div>
        )}
        <Button onClick={() => setIsOpen(true)} className="rounded-full w-14 h-14 shadow-2xl p-0 btn-primary">
          <MessageSquare />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop for click-outside dismissal */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[49]" 
        onClick={() => setIsOpen(false)} 
      />

      {/* Sidebar Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#0b0f19] border-l border-white/10 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 bg-gray-900/50 border-b border-gray-800 flex justify-between items-center backdrop-blur-md">
          <div>
            <h3 className="font-bold text-white">{t('title')}</h3>
            <span className="text-xs text-green-400 font-mono flex items-center gap-1">
              <span className="animate-pulse">{'\u25CF'}</span> {/* [FIX] Unicode bullet */}
              {t('online_count', { count: onlineUsers.length })}
            </span>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 opacity-50">
               <MessageSquare size={48} />
               <p>{t('empty')}</p>
            </div>
          )}
          
          {messages.map((m, index) => {
            // Grouping Logic: Hide header if previous msg was from same user within 5 mins
            const prevMsg = messages[index - 1];
            const isSequence = prevMsg && prevMsg.user_id === m.user_id && (new Date(m.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 300000);
            
            return (
              <div key={m.id} className={isSequence ? "mt-0.5" : "mt-4"}>
                {/* We pass a custom 'hideHeader' prop if you update MessageBubble to support it, 
                    or handle it via CSS/Structure here. 
                    For now, MessageBubble handles structure internally, so we might keep it simple or refactor MessageBubble.
                    Let's assume MessageBubble is smart enough or we wrap it. */}
                <MessageBubble 
                  message={m} 
                  isMe={m.user_id === userId}
                  onReply={setReplyTarget}
                  onEdit={editMessage}
                  onDelete={deleteMessage}
                  // You might need to add a prop to MessageBubble like 'compact={isSequence}' to hide avatar/name
                />
              </div>
            );
          })}
          
          {typingUsers.length > 0 && (
            <div className="text-xs text-indigo-400 italic ml-4 animate-pulse mt-2">
              {t('typing', { name: typingUsers.join(", ") })}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Reply Context Bar */}
        {replyTarget && (
          <div className="bg-gray-900/80 px-4 py-3 border-t border-gray-800 flex justify-between items-center backdrop-blur">
            <div className="text-xs text-gray-300 truncate max-w-[250px] border-l-2 border-indigo-500 pl-2">
              <span className="font-bold text-indigo-400 block">@{replyTarget.nickname}</span>
              <span className="opacity-70">{replyTarget.content}</span>
            </div>
            <button onClick={() => setReplyTarget(null)} className="p-1 hover:bg-white/10 rounded"><X size={14} /></button>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
          <input 
            className="flex-1 glass-input focus:ring-indigo-500"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              broadcastTyping(); 
            }}
            placeholder={t('placeholder')}
            autoFocus={isOpen}
          />
          <Button type="submit" variant="primary" className="px-4 rounded-xl h-full shadow-none">
            <Send size={18} />
          </Button>
        </form>
      </div>
    </>
  );
};