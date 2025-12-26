'use client'

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { UI } from '@/lib/constants'
import { useLanguage } from '@/components/providers/language-provider' // <--- 1. Import Hook Lingua

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
  const { t } = useLanguage() // <--- 2. Usa Hook
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ title: '', description: '' })
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (resolveRef) resolveRef(true)
    setIsOpen(false)
  }, [resolveRef])

  const handleCancel = useCallback(() => {
    if (resolveRef) resolveRef(false)
    setIsOpen(false)
  }, [resolveRef])

  // 3. Gestione Tastiera (Enter / Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      if (e.key === 'Enter') {
        e.preventDefault() // Evita che l'invio triggeri altri form sotto
        handleConfirm()
      } else if (e.key === 'Escape') {
        handleCancel()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleConfirm, handleCancel])

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
                
                {/* Barra colorata top */}
                <div className={`absolute top-0 left-0 w-full h-1 ${options.variant === 'danger' ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gradient-to-r from-indigo-600 to-cyan-600'}`} />

                <h3 className="text-lg font-bold text-white mb-2">{options.title}</h3>
                {options.description && <p className="text-gray-400 text-sm mb-6 leading-relaxed">{options.description}</p>}

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        {/* 4. Usa traduzioni di default se non passate */}
                        {options.cancelText || t.common.cancel}
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className={`px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-transform active:scale-95 ${
                            options.variant === 'danger' 
                            ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
                            : `bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 shadow-indigo-900/20`
                        }`}
                    >
                        {options.confirmText || t.common.confirm}
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