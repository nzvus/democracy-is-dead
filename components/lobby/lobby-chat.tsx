'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/client'
import { useLanguage } from '@/components/providers/language-provider'
import Avatar from '@/components/ui/avatar' 
import { toast } from 'sonner'
import { UI } from '@/lib/constants'
import { Participant } from '@/types'
import { useConfirm } from '@/components/providers/confirm-provider'

type Message = {
  id: string; user_id: string; nickname: string; content: string; created_at: string
}

export default function LobbyChat({ lobbyId, userId }: { lobbyId: string, userId: string }) {
  const { t } = useLanguage()
  const supabase = createClient()
  const { confirm } = useConfirm()
  
  const [isOpen, setIsOpen] = useState(false) 
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [myNickname, setMyNickname] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }

  // Gestione apertura/chiusura
  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
        const newState = !prev;
        if (!newState) { 
            setUnreadCount(0); 
            setTimeout(scrollToBottom, 200) 
        }
        return newState;
    })
  }, [])

  // Chiusura con tasto ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
            toggleChat()
        }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, toggleChat])

  useEffect(() => {
    const init = async () => {
        const { data: userData } = await supabase.from('lobby_participants').select('nickname').eq('lobby_id', lobbyId).eq('user_id', userId).maybeSingle()
        if (userData) setMyNickname(userData.nickname)

        const { data: parts } = await supabase.from('lobby_participants').select('*').eq('lobby_id', lobbyId)
        if (parts) setParticipants(parts)

        const { data: msgs } = await supabase.from('lobby_messages').select('*').eq('lobby_id', lobbyId).order('created_at', { ascending: true })
        if (msgs) setMessages(msgs)
        scrollToBottom()
    }
    init()

    const chatChannel = supabase.channel('chat_room_msgs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_messages', filter: `lobby_id=eq.${lobbyId}` }, 
          (payload) => {
             if (payload.eventType === 'INSERT') {
                 const newMsg = payload.new as Message
                 setMessages((prev) => { if (prev.find(m => m.id === newMsg.id)) return prev; return [...prev, newMsg] })
                 if (!isOpen && newMsg.user_id !== userId) setUnreadCount(prev => prev + 1)
                 setTimeout(scrollToBottom, 100)
             } 
             else if (payload.eventType === 'DELETE') {
                 setMessages((prev) => prev.filter(m => m.id !== payload.old.id))
             }
             else if (payload.eventType === 'UPDATE') {
                 setMessages((prev) => prev.map(m => m.id === payload.new.id ? { ...m, ...payload.new as Message } : m))
             }
          })
      .subscribe()

    const partsChannel = supabase.channel('chat_room_parts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lobby_participants', filter: `lobby_id=eq.${lobbyId}` },
        (payload) => {
             if (payload.eventType === 'INSERT') setParticipants(prev => [...prev, payload.new as Participant])
             else if (payload.eventType === 'UPDATE') setParticipants(prev => prev.map(p => p.id === payload.new.id ? payload.new as Participant : p))
        })
      .subscribe()
    
    return () => { supabase.removeChannel(chatChannel); supabase.removeChannel(partsChannel) }
  }, [lobbyId, isOpen, userId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const senderName = myNickname || t.lobby.anon_user
    const { error } = await supabase.from('lobby_messages').insert({ lobby_id: lobbyId, user_id: userId, nickname: senderName, content: newMessage })
    if (error) toast.error(t.common.error)
    else setNewMessage('')
  }

  const deleteMessage = async (msgId: string) => {
      const isConfirmed = await confirm({
          title: t.common.delete_msg_title, // [FIX] Ora usa i18n
          description: t.common.delete_msg_desc, // [FIX] Ora usa i18n
          confirmText: t.common.delete,
          variant: 'danger'
      })
      if (!isConfirmed) return
      setMessages(prev => prev.filter(m => m.id !== msgId)) 
      await supabase.from('lobby_messages').delete().eq('id', msgId)
  }

  const saveEdit = async (msgId: string) => {
      if (!editText.trim()) return
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: editText } : m)) 
      setEditingId(null)
      await supabase.from('lobby_messages').update({ content: editText }).eq('id', msgId)
  }

  return (
    <>
      {/* Floating Button */}
      <button onClick={toggleChat} className={`fixed bottom-28 md:bottom-8 right-4 z-[60] p-4 bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 rounded-full shadow-2xl transition-all hover:scale-110 group border-2 border-white/10`}>
        <span className="text-2xl">💬</span>
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">{unreadCount}</span>}
      </button>

      {/* Slide-over Panel */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-[70] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-950 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                 <h2 className="font-bold text-lg flex items-center gap-2">{t.lobby.hub_title}</h2> {/* [FIX] Ora usa i18n */}
                 <button 
                    onClick={toggleChat} 
                    className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                    title={t.common.close}
                 >
                    ✖️
                 </button>
            </div>
            {/* Tabs */}
            <div className="flex bg-gray-800 rounded-lg p-1">
                <button onClick={() => setActiveTab('chat')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'chat' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}>{t.lobby.chat_tab}</button>
                <button onClick={() => setActiveTab('participants')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'participants' ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}`}>{t.lobby.participants_tab} ({participants.length})</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-900/50">
            {activeTab === 'chat' && (
                <div className="p-4 space-y-1 min-h-full flex flex-col justify-end">
                    {messages.length === 0 && <div className="text-center text-gray-500 mb-auto mt-10 italic text-sm">{t.lobby.chat_empty}</div>}
                    {messages.map((msg, index) => {
                        const isMe = msg.user_id === userId
                        const isSequence = index > 0 && messages[index - 1].user_id === msg.user_id
                        const isEditing = editingId === msg.id
                        return (
                            <div key={msg.id} className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''} ${isSequence ? 'mt-0.5' : 'mt-4'}`}>
                                <div className="w-8 shrink-0 flex flex-col items-center">
                                    {!isSequence && <Avatar src={participants.find(p=>p.user_id === msg.user_id)?.avatar_url} seed={msg.user_id} className="w-8 h-8" />}
                                </div>
                                <div className={`max-w-[85%] relative ${isMe ? `bg-${UI.COLORS.PRIMARY}-600 text-white rounded-2xl ${isSequence ? 'rounded-tr-md' : 'rounded-tr-none'}` : `bg-gray-800 text-gray-200 rounded-2xl border border-gray-700 ${isSequence ? 'rounded-tl-md' : 'rounded-tl-none'}`}`}>
                                    <div className="px-4 py-2">
                                        {!isMe && !isSequence && <div className="text-[10px] font-bold mb-1 opacity-50 text-indigo-300">{msg.nickname}</div>}
                                        {isEditing ? (
                                            <div className="flex flex-col gap-2 min-w-[200px]">
                                                <input value={editText} onChange={(e) => setEditText(e.target.value)} className="bg-black/20 rounded p-1 text-sm outline-none w-full" autoFocus />
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setEditingId(null)} className="text-[10px] uppercase opacity-70 hover:opacity-100">{t.common.cancel}</button>
                                                    <button onClick={() => saveEdit(msg.id)} className="text-[10px] uppercase font-bold hover:text-green-300">{t.common.save}</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="break-words leading-relaxed text-sm">{msg.content}</p>
                                        )}
                                    </div>
                                    {isMe && !isEditing && (
                                        <div className="absolute -top-3 left-0 -translate-x-full hidden group-hover:flex gap-1 pr-2">
                                            <button onClick={() => { setEditingId(msg.id); setEditText(msg.content); }} className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center hover:bg-white hover:text-black text-xs transition-colors">✎</button>
                                            <button onClick={() => deleteMessage(msg.id)} className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white text-xs transition-colors">🗑</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>
            )}
            {activeTab === 'participants' && (
                <div className="p-4 space-y-2">
                    {participants.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-xl border border-gray-700">
                             <div className="flex items-center gap-3">
                                 <Avatar src={p.avatar_url} seed={p.user_id} className="w-10 h-10" />
                                 <div>
                                     <p className="font-bold text-sm text-white">{p.nickname}</p>
                                     <p className="text-[10px] text-gray-500 uppercase font-bold">
                                        {p.user_id === userId ? t.results.my_vote : t.lobby.participant_role} {/* [FIX] Ora usa i18n */}
                                     </p>
                                 </div>
                             </div>
                             {p.has_voted && <span className="text-green-400 bg-green-900/20 px-2 py-1 rounded text-[10px] font-bold border border-green-500/30">{t.lobby.voted_badge}</span>} {/* [FIX] Ora usa i18n */}
                        </div>
                    ))}
                </div>
            )}
        </div>
        
        {/* Input Area */}
        {activeTab === 'chat' && (
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900 pb-8 md:pb-4">
                <div className="flex gap-2">
                    <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={t.lobby.chat_placeholder} className={`flex-1 ${UI.COLORS.BG_INPUT} rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500 outline-none transition-all`} />
                    <button type="submit" disabled={!newMessage.trim()} className={`bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 disabled:opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all shadow-lg`}>➤</button>
                </div>
            </form>
        )}
      </div>

      {/* Backdrop (Click to close) */}
      {isOpen && <div onClick={toggleChat} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden" />}
    </>
  )
}