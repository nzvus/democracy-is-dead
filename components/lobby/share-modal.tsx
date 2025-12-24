'use client'

import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'

export default function ShareModal({ code, onClose }: { code: string, onClose: () => void }) {
  const { t } = useLanguage()
  
  // Costruiamo il link completo corrente (funziona sia su localhost che su Vercel)
  const fullLink = typeof window !== 'undefined' ? window.location.href : `https://democracy-is-dead.vercel.app/lobby/${code}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullLink)
    toast.success(t.lobby.link_copied)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Container Modale */}
      <div className="bg-white text-black rounded-3xl p-8 max-w-sm w-full relative shadow-2xl space-y-6 text-center">
        
        {/* Tasto Chiudi */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
            ✖️
        </button>

        <div>
            <h2 className="text-2xl font-black mb-1">{t.lobby.invite_title}</h2>
            <p className="text-gray-500 font-mono text-lg tracking-widest">CODE: {code}</p>
        </div>

        {/* QR CODE */}
        <div className="bg-white p-2 rounded-xl mx-auto w-fit border-2 border-gray-100">
            <QRCode 
                value={fullLink} 
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
            />
        </div>
        
        <p className="text-sm text-gray-500">{t.lobby.scan_qr}</p>

        {/* Bottone Copia */}
        <button 
            onClick={copyToClipboard}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
            🔗 {t.lobby.copy_link}
        </button>

      </div>
    </div>
  )
}