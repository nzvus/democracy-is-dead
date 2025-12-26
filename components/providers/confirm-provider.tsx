'use client'

import { createContext, useContext, useState, ReactNode, useRef } from 'react'
import { UI } from '@/lib/constants'

interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'info'
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ title: '', description: '' })
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve)
    })
  }

  const handleConfirm = () => {
    if (resolveRef) resolveRef(true)
    setIsOpen(false)
  }

  const handleCancel = () => {
    if (resolveRef) resolveRef(false)
    setIsOpen(false)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {/* MODALE DI CONFERMA UNIFICATO */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                
                {/* Effetto luce in background */}
                <div className={`absolute top-0 left-0 w-full h-1 ${options.variant === 'danger' ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-indigo-600 to-cyan-600'}`} />

                <h3 className="text-lg font-bold text-white mb-2">{options.title}</h3>
                {options.description && <p className="text-gray-400 text-sm mb-6 leading-relaxed">{options.description}</p>}

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        {options.cancelText || 'Annulla'}
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className={`px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-transform active:scale-95 ${
                            options.variant === 'danger' 
                            ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
                            : `bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 shadow-indigo-900/20`
                        }`}
                    >
                        {options.confirmText || 'Conferma'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error("useConfirm must be used within a ConfirmProvider")
  return context
}