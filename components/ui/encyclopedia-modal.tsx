'use client'

import Modal from './modal'
import { useLanguage } from '@/components/providers/language-provider'
import { BookOpen, History, Cog, ThumbsUp, AlertTriangle } from 'lucide-react'

// Rimossa EncyclopediaKey inutilizzata

interface EncyclopediaModalProps {
    topicKey: string
    isOpen: boolean
    onClose: () => void
}

export default function EncyclopediaModal({ topicKey, isOpen, onClose }: EncyclopediaModalProps) {
    const { t } = useLanguage()
    
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const data = t.encyclopedia?.[topicKey]

    if (!data) return null

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={data.title}>
            <div className="space-y-8">
                <div className="bg-indigo-900/20 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                    <p className="text-indigo-200 font-medium italic text-lg">
                        &quot;{data.subtitle}&quot;
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-yellow-500 font-bold uppercase text-xs tracking-widest">
                            <History size={16} /> Storia
                        </div>
                        <p className="text-sm md:text-base">{data.history}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-cyan-500 font-bold uppercase text-xs tracking-widest">
                            <Cog size={16} /> Come Funziona
                        </div>
                        <p className="text-sm md:text-base">{data.mechanism}</p>
                    </div>
                </div>

                <hr className="border-gray-800" />

                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-green-900/10 border border-green-900/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
                            <ThumbsUp size={16} /> Vantaggi
                        </div>
                        <p className="text-xs text-gray-400">{data.pros}</p>
                    </div>

                    <div className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                            <AlertTriangle size={16} /> Limiti
                        </div>
                        <p className="text-xs text-gray-400">{data.cons}</p>
                    </div>
                </div>

                <div className="flex justify-center pt-4 opacity-30">
                     <BookOpen size={48} />
                </div>
            </div>
        </Modal>
    )
}