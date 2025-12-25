'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/client'
import { useLanguage } from '@/components/providers/language-provider'
import Avatar from '@/components/ui/avatar' 
import { toast } from 'sonner'
import { UI } from '@/lib/constants'

type Message = {
  id: string
  user_id: string
  nickname: string
  content: string
  created_at: string
}

export default function LobbyChat({ lobbyId, userId }: { lobbyId: string, userId: string }) {
  const { t } = useLanguage()
  const supabase = createClient()
  
  const [isOpen, setIsOpen] = useState(false) 
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [myNickname, setMyNickname] = useState('')
  const [avatarsMap, setAvatarsMap] = useState<Record<string, string | null>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const init = async () => {
        const { data: userData } = await supabase.from('lobby_participants').select('nickname').eq('lobby_id', lobbyId).eq('user_id', userId).maybeSingle()
        if (userData) setMyNickname(userData.nickname)

        const { data: participants } = await supabase.from('lobby_participants').select('user_id, avatar_url').eq('lobby_id', lobbyId)
        if (participants) {
            const map: Record<string, string | null> = {}
            participants.forEach(p => { map[p.user_id] = p.avatar_url })
            setAvatarsMap(map)
        }

        const { data } = await supabase.from('lobby_messages').select('*').eq('lobby_id', lobbyId).order('created_at', { ascending: true })
        if (data) setMessages(data)
        scrollToBottom()
    }
    init()

    const channel = supabase.channel('chat_room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lobby_messages', filter: `lobby_id=eq.${lobbyId}` }, 
          (payload) => {
             const newMsg = payload.new as Message
             setMessages((prev) => [...prev, newMsg])
             if (!isOpen && newMsg.user_id !== userId) setUnreadCount(prev => prev + 1)
             setTimeout(scrollToBottom, 100)
          }
      )
      .subscribe()
    
    return () => { supabase.removeChannel(channel) }
  }, [lobbyId, isOpen, userId])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const senderName = myNickname || t.lobby.anon_user
    const { error } = await supabase.from('lobby_messages').insert({ lobby_id: lobbyId, user_id: userId, nickname: senderName, content: newMessage })
    if (error) toast.error(t.common.error)
    else setNewMessage('')
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) setUnreadCount(0)
    setTimeout(scrollToBottom, 200)
  }

  return (
    <>
      <button onClick={toggleChat} className={`fixed bottom-28 right-4 z-40 p-4 bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 rounded-full shadow-2xl transition-all hover:scale-110 group`}>
        <span className="text-2xl">💬</span>
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">{unreadCount}</span>}
      </button>

      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
            <h2 className="font-bold text-lg flex items-center gap-2">💬 {t.lobby.chat_title}</h2>
            <button onClick={toggleChat} className="p-2 hover:bg-gray-800 rounded-full text-gray-400">✖️</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {messages.length === 0 && <div className="text-center text-gray-500 mt-10 italic text-sm">{t.lobby.chat_empty}</div>}
            
            {messages.map((msg, index) => {
                const isMe = msg.user_id === userId
                const isSequence = index > 0 && messages[index - 1].user_id === msg.user_id
                
                return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} ${isSequence ? 'mt-0.5' : 'mt-4'}`}>
                        <div className="w-8 shrink-0 flex flex-col items-center">
                            {!isSequence && <Avatar src={avatarsMap[msg.user_id]} seed={msg.user_id} className="w-8 h-8" />}
                        </div>
                        
                        <div className={`max-w-[80%] px-4 py-2 text-sm ${
                            isMe 
                            ? `bg-${UI.COLORS.PRIMARY}-600 text-white rounded-2xl ${isSequence ? 'rounded-tr-md' : 'rounded-tr-none'}` 
                            : `bg-gray-800 text-gray-200 rounded-2xl border border-gray-700 ${isSequence ? 'rounded-tl-md' : 'rounded-tl-none'}`
                        }`}>
                            {!isMe && !isSequence && <div className="text-[10px] font-bold mb-1 opacity-50 text-indigo-300">{msg.nickname}</div>}
                            <p className="break-words leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900 pb-8 md:pb-4">
            <div className="flex gap-2">
                <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={t.lobby.chat_placeholder} className={`flex-1 ${UI.COLORS.BG_INPUT} rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500 outline-none transition-all`} />
                <button type="submit" disabled={!newMessage.trim()} className={`bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 disabled:opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all shadow-lg`}>➤</button>
            </div>
        </form>
      </div>
      {isOpen && <div onClick={toggleChat} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" />}
    </>
  )
}