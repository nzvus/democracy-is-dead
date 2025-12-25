'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'

interface ShareLobbyProps {
  code: string
  className?: string
  compact?: boolean
}

export default function ShareLobby({ code, className = '', compact = false }: ShareLobbyProps) {
  const { t } = useLanguage()
  const [showQR, setShowQR] = useState(false)

  // Calcolo URL sicuro (lato client)
  const lobbyUrl = typeof window !== 'undefined' ? `${window.location.origin}/lobby/${code}` : ''

  const copyLink = () => {
    if (!lobbyUrl) return
    navigator.clipboard.writeText(lobbyUrl)
    toast.success("Link copiato!") // Puoi aggiungere questa chiave a common.ts se vuoi
  }

  return (
    <div className={`${className}`}>
      {/* BOTTONI TRIGGER */}
      <div className={`flex items-center gap-2 ${compact ? 'justify-end' : 'justify-center w-full'}`}>
        
        {/* Tasto Copia Codice */}
        <button 
            onClick={copyLink}
            className={`flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 ${UI.LAYOUT.ROUNDED_MD} transition-all active:scale-95 group`}
            title="Copia Link"
        >
            <span className="font-mono font-bold tracking-widest text-lg group-hover:text-yellow-400 transition-colors">{code}</span>
            <span className="opacity-50 text-xs uppercase font-bold border-l border-gray-600 pl-3">📋</span>
        </button>

        {/* Tasto QR */}
        <button 
            onClick={() => setShowQR(true)}
            className={`bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white p-2.5 ${UI.LAYOUT.ROUNDED_MD} transition-all active:scale-95`}
            title={t.lobby.voting.scan_to_join}
        >
            📱
        </button>
      </div>

      {/* MODALE QR CODE */}
      {showQR && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowQR(false)}
        >
            <div 
                className={`w-full max-w-sm bg-white text-black p-8 rounded-3xl flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200 relative`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Tasto Chiudi */}
                <button 
                    onClick={() => setShowQR(false)} 
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 hover:text-black font-bold text-lg transition-colors"
                >
                    ×
                </button>

                <h3 className="font-black text-2xl mb-2 tracking-tight text-center">Join Lobby</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">{t.lobby.voting.scan_to_join}</p>
                
                {/* QR Container */}
                <div className="p-4 bg-white rounded-xl shadow-lg mb-6 border border-gray-100">
                    <QRCodeSVG value={lobbyUrl} size={220} />
                </div>

                {/* Codice Display */}
                <div 
                    onClick={copyLink}
                    className="bg-gray-100 hover:bg-gray-200 cursor-pointer px-8 py-4 rounded-2xl font-mono text-3xl font-black tracking-[0.2em] mb-2 border border-gray-200 transition-colors active:scale-95 text-center w-full"
                >
                    {code}
                </div>
                
                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider text-center mt-2">
                    {t.lobby.voting.click_details}
                </p>
            </div>
        </div>
      )}
    </div>
  )
}