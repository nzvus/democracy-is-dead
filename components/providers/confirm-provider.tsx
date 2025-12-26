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
  const { t } = useLanguage() // Hook lingua
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null)

  const confirm = (opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts)
      setResolveRef(() => resolve)
    })
  }

  const handleClose = (value: boolean) => {
    setOptions(null)
    if (resolveRef) resolveRef(value)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-2">{options.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{options.description}</p>
            </div>
            <div className="bg-gray-950 p-4 flex justify-end gap-3 border-t border-gray-800">
              <button
                onClick={() => handleClose(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                {/* Usa la prop se esiste, altrimenti usa la traduzione reattiva */}
                {options.cancelText || t.common.cancel}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`px-4 py-2 rounded-lg text-sm font-bold text-white shadow-lg transition-transform active:scale-95 ${
                  options.variant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/20'
                }`}
              >
                {/* Usa la prop se esiste, altrimenti usa la traduzione reattiva */}
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