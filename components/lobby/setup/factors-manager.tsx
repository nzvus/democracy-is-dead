'use client'

import { useState } from 'react'
import { Factor } from '@/types'
import { Plus, Trash2, Info } from 'lucide-react'
import DescriptionTooltip from '@/components/ui/description-tooltip'
import { UI } from '@/lib/constants'
import { useLanguage } from '@/components/providers/language-provider'

interface FactorsManagerProps {
  factors: Factor[]
  setFactors: (f: Factor[]) => void
}

export default function FactorsManager({ factors, setFactors }: FactorsManagerProps) {
  const { t } = useLanguage()
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newImage, setNewImage] = useState('')

  const handleAddFactor = () => {
     if (!newName.trim()) return
     
     const newFactor: Factor = {
         id: crypto.randomUUID(), 
         name: newName,
         description: newDesc,
         image_url: newImage,
         weight: 1, 
         trend: 'higher_better',
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         type: 'numerical' as any
     }

     setFactors([...factors, newFactor])
     setNewName('')
     setNewDesc('')
     setNewImage('')
  }

  const removeFactor = (id: string) => {
      setFactors(factors.filter(f => f.id !== id))
  }

  const updateFactor = (id: string, field: keyof Factor, value: string | number) => {
      setFactors(factors.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Form Aggiunta */}
             <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-3">
                 <h3 className="font-bold text-sm text-gray-400 uppercase">{t.setup.factors.new_title}</h3>
                 <input 
                    placeholder={t.setup.factors.placeholder_name} 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className={`w-full ${UI.COLORS.BG_INPUT} p-2 rounded border border-gray-700`}
                 />
                 <input 
                    placeholder={t.setup.factors.placeholder_desc} 
                    value={newDesc} 
                    onChange={e => setNewDesc(e.target.value)}
                    className={`w-full ${UI.COLORS.BG_INPUT} p-2 rounded border border-gray-700 text-sm`}
                 />
                 <input 
                    placeholder={t.setup.factors.placeholder_url} 
                    value={newImage} 
                    onChange={e => setNewImage(e.target.value)}
                    className={`w-full ${UI.COLORS.BG_INPUT} p-2 rounded border border-gray-700 text-xs font-mono`}
                 />
                 <button 
                    onClick={handleAddFactor}
                    disabled={!newName.trim()}
                    className={`w-full py-2 bg-${UI.COLORS.PRIMARY}-600 rounded font-bold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2`}
                 >
                    <Plus size={16} /> {t.setup.factors.add_btn}
                 </button>
             </div>

             {/* Lista Fattori */}
             <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {factors.map(factor => (
                     <div key={factor.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex flex-col gap-2">
                         <div className="flex justify-between items-start">
                             <div className="flex items-center gap-2">
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 {factor.image_url && <img src={factor.image_url} alt="" className="w-6 h-6 object-cover rounded" />}
                                 <span className="font-bold">{factor.name}</span>
                                 {factor.description && (
                                     <DescriptionTooltip title={factor.name} description={factor.description}>
                                         <Info size={14} className="text-gray-500" />
                                     </DescriptionTooltip>
                                 )}
                             </div>
                             <button onClick={() => removeFactor(factor.id)} className="text-red-400 hover:text-red-300">
                                 <Trash2 size={16} />
                             </button>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-2 text-xs">
                             <div>
                                 <label className="text-gray-500 block">{t.setup.factors.label_weight}</label>
                                 <input 
                                    type="number" 
                                    min="1" max="10"
                                    value={factor.weight}
                                    onChange={e => updateFactor(factor.id, 'weight', parseInt(e.target.value))}
                                    className="bg-gray-900 w-full p-1 rounded border border-gray-700"
                                 />
                             </div>
                             <div>
                                 <label className="text-gray-500 block">{t.setup.factors.label_trend}</label>
                                 <select 
                                    value={factor.trend}
                                    onChange={e => updateFactor(factor.id, 'trend', e.target.value)}
                                    className="bg-gray-900 w-full p-1 rounded border border-gray-700"
                                 >
                                     <option value="higher_better">{t.setup.factors.trend_high}</option>
                                     <option value="lower_better">{t.setup.factors.trend_low}</option>
                                 </select>
                             </div>
                         </div>
                     </div>
                 ))}
                 {factors.length === 0 && <p className="text-gray-500 text-center text-sm py-4">{t.setup.factors.empty_list}</p>}
             </div>
        </div>
    </div>
  )
}