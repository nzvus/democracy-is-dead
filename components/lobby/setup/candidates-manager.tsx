'use client'

import { useState } from 'react'
import { Candidate } from '@/types'
import { Trash2, Edit2 } from 'lucide-react'
import Avatar from '@/components/ui/avatar'
import ImagePicker from '@/components/ui/image-picker' 
import { UI } from '@/lib/constants'
import { useLanguage } from '@/components/providers/language-provider'

interface CandidatesManagerProps {
  candidates: Candidate[]
  setCandidates: (c: Candidate[]) => void
} 

export default function CandidatesManager({ candidates, setCandidates }: CandidatesManagerProps) {
  const { t } = useLanguage()
  const [isEditing, setIsEditing] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [img, setImg] = useState('') 

  const handleAdd = () => {
    if (!name.trim()) return
    const newCand: Candidate = {
        id: crypto.randomUUID(),
        name,
        description: desc,
        image_url: img || null,
        lobby_id: '' 
    }
    setCandidates([...candidates, newCand])
    resetForm()
  }

  const handleUpdate = () => {
    if (!name.trim() || !isEditing) return
    setCandidates(candidates.map(c => c.id === isEditing ? { ...c, name, description: desc, image_url: img || null } : c))
    resetForm()
    setIsEditing(null)
  }

  const resetForm = () => {
      setName('')
      setDesc('')
      setImg('')
  }

  const startEdit = (c: Candidate) => {
      setIsEditing(c.id)
      setName(c.name)
      setDesc(c.description || '')
      setImg(c.image_url || '')
  }

  return (
    <div className="space-y-6">
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-4">
             <div className="flex gap-4">
                 <div className="w-16 h-16 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-700 shadow-xl">
                     <Avatar seed={name || "?"} src={img} className="w-full h-full text-2xl" />
                 </div>
                 <div className="flex-1 space-y-3">
                     <input 
                        value={name} onChange={e => setName(e.target.value)}
                        placeholder={t.setup.candidates.placeholder_name}
                        className={`w-full ${UI.COLORS.BG_INPUT} p-2 rounded-lg border border-gray-700 font-bold focus:border-${UI.COLORS.PRIMARY}-500 outline-none`}
                     />
                     <input 
                        value={desc} onChange={e => setDesc(e.target.value)}
                        placeholder={t.setup.candidates.placeholder_desc}
                        className={`w-full ${UI.COLORS.BG_INPUT} p-2 rounded-lg border border-gray-700 text-sm focus:border-${UI.COLORS.PRIMARY}-500 outline-none`}
                     />
                     {}
                     <ImagePicker value={img} onChange={setImg} placeholder={t.setup.candidates.placeholder_url} />
                 </div>
             </div>

             <div className="flex justify-end gap-2 pt-2">
                 {isEditing && <button onClick={() => { setIsEditing(null); resetForm() }} className="text-sm text-gray-500 hover:text-white px-3">{t.setup.candidates.cancel_btn}</button>}
                 <button 
                    onClick={isEditing ? handleUpdate : handleAdd}
                    disabled={!name.trim()}
                    className={`px-6 py-2 bg-${UI.COLORS.PRIMARY}-600 text-white rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg`}
                 >
                    {isEditing ? t.setup.candidates.update_btn : t.setup.candidates.add_btn}
                 </button>
             </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {candidates.map(c => (
                <div key={c.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center justify-between group hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar seed={c.name} src={c.image_url} className="w-10 h-10 flex-shrink-0 shadow-sm" />
                        <div className="min-w-0">
                            <p className="font-bold truncate text-gray-200">{c.name}</p>
                            <p className="text-xs text-gray-500 truncate">{c.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(c)} className="p-2 text-indigo-400 hover:bg-gray-700 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => setCandidates(candidates.filter(x => x.id !== c.id))} className="p-2 text-red-400 hover:bg-gray-700 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                </div>
            ))}
            {candidates.length === 0 && <p className="col-span-full text-center text-gray-500 py-8 italic">{t.setup.candidates.empty_list}</p>}
        </div>
    </div>
  )
}