
'use client'

import { useState } from 'react'
import { UI } from '@/lib/constants'
import { Image as ImageIcon, Link as LinkIcon, X } from 'lucide-react'

interface ImagePickerProps {
    value: string
    onChange: (val: string) => void
    placeholder?: string
}

export default function ImagePicker({ value, onChange, placeholder = "https://..." }: ImagePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (isOpen || value) {
        return (
            <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-left-2 duration-200">
                <div className="relative flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <LinkIcon size={14} />
                    </div>
                    <input 
                        autoFocus
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`w-full ${UI.COLORS.BG_INPUT} pl-9 pr-3 py-2 rounded-lg text-xs border border-gray-700 focus:border-${UI.COLORS.PRIMARY}-500 outline-none transition-colors`}
                    />
                </div>
                {value && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-700 bg-black">
                        <img src={value} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
                <button 
                    onClick={() => { onChange(''); setIsOpen(false) }}
                    className="p-2 hover:bg-red-500/20 hover:text-red-400 text-gray-500 rounded-lg transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        )
    }

    return (
        <button 
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-400 hover:text-white transition-all border border-gray-700 hover:border-gray-600"
        >
            <ImageIcon size={14} /> 
            <span>Aggiungi Immagine</span>
        </button>
    )
}