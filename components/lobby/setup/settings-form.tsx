'use client'

import { UI } from '@/lib/constants'
import { useLanguage } from '@/components/providers/language-provider'

interface SettingsFormProps {
    scale: { min: number; max: number };
    setScale: (val: { min: number; max: number }) => void;
}

export default function SettingsForm({ scale, setScale }: SettingsFormProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
            <h3 className="font-bold text-gray-300 uppercase tracking-widest text-sm">{t.setup.settings.title}</h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.setup.settings.min}</label>
                    <input 
                        type="number"
                        value={scale.min}
                        disabled
                        className={`w-full ${UI.COLORS.BG_INPUT} p-3 rounded-lg border border-gray-700 opacity-50 cursor-not-allowed`}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.setup.settings.max}</label>
                    <input 
                        type="number"
                        min="5" max="100"
                        value={scale.max}
                        onChange={(e) => setScale({ ...scale, max: parseInt(e.target.value) })}
                        className={`w-full ${UI.COLORS.BG_INPUT} p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500`}
                    />
                </div>
            </div>
            <p className="text-xs text-gray-500">
                {t.setup.settings.desc}
            </p>
        </div>
    </div>
  )
}