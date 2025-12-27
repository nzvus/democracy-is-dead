/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'
import { UI } from '@/lib/constants'

export default function ImagePicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const [showInput, setShowInput] = useState(false)

    if (showInput) {
        return (
            <input 
                autoFocus
                placeholder="https://..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={() => { if(!value) setShowInput(false) }}
                className={`w-full ${UI.COLORS.BG_INPUT} p-2 rounded text-xs`}
            />
        )
    }

    return (
        <button 
            type="button"
            onClick={() => setShowInput(true)}
            className="w-full h-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 transition-colors"
        >
            {value ? (
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <span className="text-2xl text-gray-600">+</span>
            )}
        </button>
    )
}