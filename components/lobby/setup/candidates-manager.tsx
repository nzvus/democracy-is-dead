'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/client'
import { toast } from 'sonner'
import { useLanguage } from '@/components/providers/language-provider'
import { Candidate } from '@/types'
import { UI } from '@/lib/constants'
import CandidateTooltip from '@/components/ui/candidate-tooltip'
import { useConfirm } from '@/components/providers/confirm-provider'

export default function CandidatesManager({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()
  const { confirm } = useConfirm()
  
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCandidates = async () => {
        const { data } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id).order('created_at', { ascending: true })
        if (data) setCandidates(data)
    }
    fetchCandidates()
    const channel = supabase.channel('candidates_setup')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates', filter: `lobby_id=eq.${lobby.id}` }, 
        (payload) => {
            if (payload.eventType === 'INSERT') setCandidates(prev => [...prev, payload.new as Candidate])
            else if (payload.eventType === 'DELETE') setCandidates(prev => prev.filter(c => c.id !== payload.old.id))
            else if (payload.eventType === 'UPDATE') setCandidates(prev => prev.map(c => c.id === payload.new.id ? payload.new as Candidate : c))
        })
        .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [lobby.id, supabase])

  const addCandidate = async () => {
    if (!newName.trim()) return
    setLoading(true)
    const { error } = await supabase.from('candidates').insert({ lobby_id: lobby.id, name: newName, description: newDesc })
    if (error) toast.error(t.common.error)
    else { toast.success(t.common.saved); setNewName(''); setNewDesc('') }
    setLoading(false)
  }

  const removeCandidate = async (id: string) => {
    const isConfirmed = await confirm({
        title: t.setup.remove_candidate_title,
        description: t.setup.remove_candidate_confirm,
        // NON passo confirmText così usa il default reattivo (t.common.confirm) del provider, o puoi forzare:
        confirmText: t.common.delete, 
        variant: 'danger'
    })
    if (!isConfirmed) return
    const { error } = await supabase.from('candidates').delete().eq('id', id)
    if (error) toast.error(t.common.error)
    else toast.success(t.setup.candidate_removed)
  }

  return (
    <div className={`space-y-8 animate-in fade-in mx-auto ${UI.LAYOUT.MAX_WIDTH_CONTAINER}`}>
        <div className={`${UI.COLORS.BG_CARD} ${UI.LAYOUT.PADDING_X} ${UI.LAYOUT.PADDING_Y} ${UI.LAYOUT.ROUNDED_LG} space-y-4 border border-gray-800`}>
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest text-center">{t.setup.add_candidate_title}</h3>
            <div className="space-y-3">
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t.setup.candidate_name_ph} className={`w-full ${UI.COLORS.BG_INPUT} ${UI.LAYOUT.ROUNDED_MD} p-3 outline-none focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500 transition-all font-bold`} onKeyDown={(e) => e.key === 'Enter' && addCandidate()} />
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder={t.setup.candidate_desc_ph} className={`w-full ${UI.COLORS.BG_INPUT} ${UI.LAYOUT.ROUNDED_MD} p-3 outline-none focus:ring-2 focus:ring-${UI.COLORS.PRIMARY}-500 transition-all min-h-[80px] resize-none text-sm`} />
            </div>
            <button onClick={addCandidate} disabled={loading || !newName} className={`w-full bg-${UI.COLORS.PRIMARY}-600 hover:bg-${UI.COLORS.PRIMARY}-500 disabled:opacity-50 text-white font-bold py-3 ${UI.LAYOUT.ROUNDED_MD} transition-all shadow-lg active:scale-[0.98]`}>{loading ? t.common.loading : '+ ' + t.common.save}</button>
        </div>

        <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest pl-1">{t.setup.list_candidates} ({candidates.length})</h3>
{candidates.length === 0 ? (
    <div className="text-center py-10 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
        <p className="text-gray-400 italic">{t.setup.no_candidates_msg}</p> 
    </div>
) : 
           candidates.map((c) => (
                <div key={c.id} className={`${UI.COLORS.BG_CARD} p-4 ${UI.LAYOUT.ROUNDED_MD} flex justify-between items-center border border-gray-800 hover:border-gray-700 transition-colors group`}>
                    <div className="flex items-center gap-4 overflow-hidden">
                        <CandidateTooltip candidate={c}>
                            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xl overflow-hidden border border-gray-700 cursor-help group-hover:border-indigo-500 transition-colors shrink-0">
                                {c.image_url ? <img src={c.image_url} className="w-full h-full object-cover"/> : <span>👤</span>}
                            </div>
                        </CandidateTooltip>
                        <div className="min-w-0">
                            <p className="font-bold truncate text-white">{c.name}</p>
                            {c.description ? <p className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-md">{c.description}</p> : <p className="text-[10px] text-gray-600 italic">{t.setup.no_description}</p>}
                        </div>
                    </div>
                    <button onClick={() => removeCandidate(c.id)} className="text-gray-600 hover:text-red-400 p-2 rounded-full hover:bg-gray-800 transition-all" title={t.common.delete}>🗑</button>
                </div>
            ))}
        </div>
    </div>
  )
}