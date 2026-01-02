import { useState } from 'react';
import { SmartEntity } from '@/shared/ui/smart-entity';
import { ChatMessage } from '@/features/chat/model/types';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2, Reply, X, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  isMe: boolean;
  onReply: (msg: ChatMessage) => void;
  onEdit: (id: string, newContent: string) => void;
  onDelete: (id: string) => void;
  showAvatar: boolean;
  avatarUrl?: string | null;
}

export const MessageBubble = ({ message, isMe, onReply, onEdit, onDelete, showAvatar, avatarUrl }: MessageBubbleProps) => {
  const t = useTranslations('Chat');
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSaveEdit = () => {
    if (editContent.trim() !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div 
      className={`flex gap-2 group ${isMe ? 'flex-row-reverse' : ''} ${!showAvatar ? 'mt-0' : 'mt-3'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-8 shrink-0 flex flex-col justify-end">
         {showAvatar && !isMe && (
            <SmartEntity 
                label="" 
                seed={message.user_id} 
                imageUrl={avatarUrl} 
                className="w-8 h-8"
            />
         )}
      </div>
      
      <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
        
        {/* Name Header */}
        {!isMe && showAvatar && !message.reply_to && (
            <div className="text-[10px] font-bold text-gray-400 mb-0.5 ml-1">{message.nickname}</div>
        )}

        {message.reply_to && (
          <div className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-1 rounded-t-md border-b-0 border border-gray-700 w-fit mb-[-4px] z-0 opacity-80">
            {/* [FIX] Defensive check for reply_to.content */}
            <span className="font-bold">@{message.reply_to.nickname}:</span> {(message.reply_to.content || "").substring(0, 20)}...
          </div>
        )}

        <div className={`
          relative rounded-2xl px-3 py-1.5 text-sm leading-snug shadow-sm z-10 min-w-[60px]
          ${isMe 
            ? 'bg-indigo-600 text-white rounded-tr-sm' 
            : 'bg-[#1f2937] text-gray-200 border border-gray-700/50 rounded-tl-sm'
          }
        `}>
          {isEditing ? (
            <div className="flex flex-col gap-2 min-w-[200px]">
              <input 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)}
                className="bg-black/20 rounded p-1 text-white outline-none w-full"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(false)} className="text-xs hover:text-red-300"><X size={14} /></button>
                <button onClick={handleSaveEdit} className="text-xs hover:text-green-300"><Check size={14} /></button>
              </div>
            </div>
          ) : (
            <p className="break-words">
              {message.content}
              {message.is_edited && <span className="text-[9px] opacity-60 ml-1 italic">{t('edited')}</span>}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`flex gap-1 mt-0.5 opacity-0 transition-opacity ${isHovered ? 'opacity-100' : ''}`}>
          <button onClick={() => onReply(message)} className="p-1 text-gray-500 hover:text-indigo-400" title={t('actions.reply')}>
            <Reply size={12} />
          </button>
          {isMe && (
            <>
              <button onClick={() => setIsEditing(true)} className="p-1 text-gray-500 hover:text-yellow-400" title={t('actions.edit')}>
                <Pencil size={12} />
              </button>
              <button onClick={() => onDelete(message.id)} className="p-1 text-gray-500 hover:text-red-400" title={t('actions.delete')}>
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};