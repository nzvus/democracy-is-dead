'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/client'
import { useLanguage } from '@/components/providers/language-provider'
import Avatar from '@/components/ui/avatar' // <--- Componente Avatar aggiornato
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
  
  // Dati utente corrente
  const [myNickname, setMyNickname] = useState('')
  
  // Mappa avatar degli altri partecipanti (userId -> avatarUrl)
  const [avatarsMap, setAvatarsMap] = useState<Record<string, string | null>>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const init = async () => {
        // 1. Fetch Nickname corrente
        const { data: userData } = await supabase
            .from('lobby_participants')
            .select('nickname')
            .eq('lobby_id', lobbyId)
            .eq('user_id', userId)
            .single()
        if (userData) setMyNickname(userData.nickname)

        // 2. Fetch Mappa Avatar (per mostrare le foto degli altri)
        const { data: participants } = await supabase
            .from('lobby_participants')
            .select('user_id, avatar_url')
            .eq('lobby_id', lobbyId)
        
        if (participants) {
            const map: Record<string, string | null> = {}
            participants.forEach(p => { map[p.user_id] = p.avatar_url })
            setAvatarsMap(map)
        }

        // 3. Fetch Messaggi storici
        const { data } = await supabase
            .from('lobby_messages')
            .select('*')
            .eq('lobby_id', lobbyId)
            .order('created_at', { ascending: true })
        
        if (data) setMessages(data)
        scrollToBottom()
    }
    init()

    // 4. Subscription Messaggi
    const channel = supabase.channel('chat_room')
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'lobby_messages', filter: `lobby_id=eq.${lobbyId}` }, 
          (payload) => {
             const newMsg = payload.new as Message
             setMessages((prev) => [...prev, newMsg])
             
             if (!isOpen && newMsg.user_id !== userId) {
                setUnreadCount(prev => prev + 1)
             }
             setTimeout(scrollToBottom, 100)
          }
      )
      .subscribe()
    
    // 5. Subscription Nuovi Avatar (se qualcuno entra o cambia foto)
    const pChannel = supabase.channel('chat_avatars')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lobby_participants', filter: `lobby_id=eq.${lobbyId}` },
        (payload) => {
             const newP = payload.new
             setAvatarsMap(prev => ({ ...prev, [newP.user_id]: newP.avatar_url }))
        })
        .subscribe()

    return () => { 
        supabase.removeChannel(channel)
        supabase.removeChannel(pChannel)
    }
  }, [lobbyId, isOpen, userId, supabase])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const senderName = myNickname || t.lobby.anon_user

    const { error } = await supabase.from('lobby_messages').insert({
      lobby_id: lobbyId,
      user_id: userId,
      nickname: senderName, 
      content: newMessage
    })

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
      {/* FAB Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-28 right-4 z-40 p-4 bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 rounded-full shadow-2xl transition-all hover:scale-110 group`}
      >
        <span className="text-2xl">💬</span>
        {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
                {unreadCount}
            </span>
        )}
      </button>

      {/* PANNELLO CHAT */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
            <h2 className="font-bold text-lg flex items-center gap-2">
                💬 {t.lobby.chat_title}
            </h2>
            <button onClick={toggleChat} className="p-2 hover:bg-gray-800 rounded-full text-gray-400">✖️</button>
        </div>

        {/* Messaggi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10 italic text-sm">
                    {t.lobby.chat_empty}
                </div>
            )}
            
            {messages.map((msg) => {
                const isMe = msg.user_id === userId
                // Usa l'avatar dalla mappa o genera un seed
                const avatarUrl = avatarsMap[msg.user_id]
                
                return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <Avatar 
                            src={avatarUrl} 
                            seed={msg.user_id} 
                            className="w-8 h-8 shrink-0 mt-1" 
                        />
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${isMe ? `bg-${UI.COLORS.PRIMARY}-600 text-white rounded-tr-none` : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'}`}>
                            {!isMe && (
                                <div className="text-[10px] font-bold mb-1 opacity-50 text-indigo-300">
                                    {msg.nickname}
                                </div>
                            )}
                            <p className="break-words leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-800 bg-gray-900 pb-8 md:pb-4">
            <div className="flex gap-2">
                <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={t.lobby.chat_placeholder}
                    className={`flex-1 ${UI.COLORS.BG_INPUT} rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500 outline-none transition-all`}
                />
                <button 
                    type="submit"
                    disabled={!newMessage.trim()} 
                    className={`bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 disabled:opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all shadow-lg`}
                >
                    ➤
                </button>
            </div>
        </form>
      </div>

      {isOpen && (
        <div onClick={toggleChat} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" />
      )}
    </>
  )
}