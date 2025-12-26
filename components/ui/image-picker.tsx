'use client'
import { useState, useRef } from 'react'
import { useLanguage } from '@/components/providers/language-provider'
import { UI } from '@/lib/constants'
import { toast } from 'sonner'

interface ImagePickerProps {
    value: string | null
    onChange: (val: string | null) => void
    className?: string
}

export default function ImagePicker({ value, onChange, className = '' }: ImagePickerProps) {
    const { t } = useLanguage()
    const [mode, setMode] = useState<'url' | 'file'>('file')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        
        // Limite 1MB per evitare problemi col DB
        if (file.size > 1024 * 1024) { 
             toast.error(t.common.img_picker_too_large)
             return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            onChange(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    return (
        <div className={`space-y-3 ${className}`}>
             {value ? (
                 <div className="relative w-24 h-24 mx-auto group animate-in fade-in zoom-in-95">
                     <img src={value} className="w-full h-full object-cover rounded-xl border-2 border-gray-700 shadow-lg" />
                     <button 
                        onClick={() => onChange(null)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform z-10"
                        title={t.common.img_picker_remove}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                     </button>
                 </div>
             ) : (
                 <div className="bg-gray-900/50 p-1 rounded-xl border border-gray-800">
                     <div className="flex gap-1 mb-2 bg-gray-950/50 p-1 rounded-lg">
                         <button onClick={() => setMode('file')} className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-md transition-all ${mode === 'file' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                            {t.common.img_picker_tab_file}
                         </button>
                         <button onClick={() => setMode('url')} className={`flex-1 py-1.5 text-[10px] uppercase font-bold rounded-md transition-all ${mode === 'url' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}>
                            {t.common.img_picker_tab_url}
                         </button>
                     </div>

                     <div className="p-1">
                        {mode === 'url' ? (
                            <input 
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder={t.common.img_picker_ph}
                                className={`w-full ${UI.COLORS.BG_INPUT} px-3 py-3 rounded-lg text-xs outline-none focus:ring-1 focus:ring-${UI.COLORS.PRIMARY}-500 transition-all text-center placeholder:text-gray-600`}
                                autoFocus
                            />
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()} 
                                className="border-2 border-dashed border-gray-700 hover:border-indigo-500/50 hover:bg-gray-800/50 rounded-lg h-20 flex flex-col items-center justify-center cursor-pointer transition-all group"
                            >
                                <span className="text-2xl mb-1 opacity-50 group-hover:scale-110 transition-transform">📂</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{t.common.img_picker_drag}</span>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleFileChange}
                                />
                            </div>
                        )}
                     </div>
                 </div>
             )}
        </div>
    )
}