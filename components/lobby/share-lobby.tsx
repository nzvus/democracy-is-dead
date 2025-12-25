'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { QRCodeSVG } from 'qrcode.react'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'

interface ShareLobbyProps {
  code: string
  className?: string
  compact?: boolean // Se true, mostra una versione ridotta (es. per header mobile)
}

export default function ShareLobby({ code, className = '', compact = false }: ShareLobbyProps) {
  const { t } = useLanguage()
  const [showQR, setShowQR] = useState(false)

  const lobbyUrl = typeof window !== 'undefined' ? `${window.location.origin}/lobby/${code}` : ''

  const copyLink = () => {
    navigator.clipboard.writeText(lobbyUrl)
    toast.success("Link copiato!")
  }

  return (
    <div className={`${className}`}>
      {/* TRIGGER BUTTONS */}
      <div className={`flex items-center gap-2 ${compact ? 'justify-end' : 'justify-center w-full'}`}>
        
        {/* Tasto Copia Codice/Link */}
        <button 
            onClick={copyLink}
            className={`flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 ${UI.LAYOUT.ROUNDED_MD} transition-all active:scale-95`}
            title="Copy Link"
        >
            <span className="font-mono font-bold tracking-widest text-lg">{code}</span>
            <span className="opacity-50 text-xs uppercase font-bold">📋</span>
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

      {/* QR CODE MODAL OVERLAY */}
      {showQR && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowQR(false)}
        >
            <div 
                className={`w-full max-w-sm bg-white text-black p-8 rounded-3xl flex flex-col items-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative`}
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => setShowQR(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors font-bold text-xl"
                >
                    ×
                </button>

                <h3 className="font-black text-2xl mb-6 tracking-tight text-center">Join Lobby</h3>
                
                <div className="p-4 bg-white rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.1)] mb-6">
                    <QRCodeSVG value={lobbyUrl} size={200} />
                </div>

                <div className="bg-gray-100 px-6 py-3 rounded-xl font-mono text-2xl font-bold tracking-[0.2em] mb-2">
                    {code}
                </div>
                
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wider text-center">
                    {t.lobby.voting.scan_to_join}
                </p>
                
                <button 
                    onClick={copyLink}
                    className="mt-6 w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                    Copy Link
                </button>
            </div>
        </div>
      )}
    </div>
  )
}