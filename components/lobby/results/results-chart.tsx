'use client'

import { Candidate } from '@/types'

interface ResultsChartProps {
  results: Candidate[]
}

// Componente Placeholder per il Radar Chart (che richiederebbe dati aggregati complessi)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ResultsChart({ results }: ResultsChartProps) {
  return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm italic p-4 text-center">
          Dettagli Radar disponibili prossimamente.<br/>
          (I dati attuali non sono sufficienti per generare il grafico radar per fattore)
      </div>
  )
}