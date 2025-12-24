'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useLanguage } from '@/components/providers/language-provider'
import Avatar from '@/components/ui/avatar'
import { toast } from 'sonner'

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
  const [myNickname, setMyNickname] = useState('') // NICK REALE

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch messaggi e nickname
  useEffect(() => {
    const init = async () => {
        // 1. Fetch Nickname
        const { data: userData } = await supabase
            .from('lobby_participants')
            .select('nickname')
            .eq('lobby_id', lobbyId)
            .eq('user_id', userId)
            .single()
        
        if (userData) setMyNickname(userData.nickname)

        // 2. Fetch Messaggi
        const { data } = await supabase
            .from('lobby_messages')
            .select('*')
            .eq('lobby_id', lobbyId)
            .order('created_at', { ascending: true })
        
        if (data) setMessages(data)
        scrollToBottom()
    }
    init()

    // 3. Subscription
    const channel = supabase
      .channel('chat_room')
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

    return () => { supabase.removeChannel(channel) }
  }, [lobbyId, isOpen, userId, supabase])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // Fallback se il nickname non è ancora caricato
    const senderName = myNickname || `Anon ${userId.substring(0, 4)}`

    const { error } = await supabase.from('lobby_messages').insert({
      lobby_id: lobbyId,
      user_id: userId,
      nickname: senderName, 
      content: newMessage
    })

    if (error) toast.error("Errore invio")
    else setNewMessage('')
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) setUnreadCount(0)
    setTimeout(scrollToBottom, 200)
  }

  // Render uguale a prima, ma logica sendMessage aggiornata
  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-28 right-4 z-40 p-4 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-2xl transition-all hover:scale-110 group"
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
                <span className="text-xs font-normal text-gray-500 bg-gray-800 px-2 py-1 rounded-full border border-gray-700">
                    {myNickname}
                </span>
            </h2>
            <button onClick={toggleChat} className="p-2 hover:bg-gray-800 rounded-full text-gray-400">✖️</button>
        </div>

        {/* Messaggi */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-10 italic">
                    {t.lobby.chat_empty}
                </div>
            )}
            
            {messages.map((msg) => {
                const isMe = msg.user_id === userId
                return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                        <Avatar seed={msg.user_id} className="w-8 h-8 shrink-0 mt-1" />
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'}`}>
                            <div className={`text-[10px] font-bold mb-1 opacity-50 ${isMe ? 'text-right' : ''}`}>
                                {msg.nickname}
                            </div>
                            <p className="break-words">{msg.content}</p>
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
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button 
                    type="submit"
                    disabled={!newMessage.trim()} 
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-all"
                >
                    ➤
                </button>
            </div>
        </form>

      </div>

      {isOpen && (
        <div 
            onClick={toggleChat}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </>
  )
}