'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'

// Registriamo i componenti di Chart.js
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

export default function LobbyResults({ lobby }: { lobby: any }) {
  const supabase = createClient()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculateResults = async () => {
      // 1. Scarica Candidati e Voti
      const { data: candidates } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id)
      const { data: votes } = await supabase.from('votes').select('*').eq('lobby_id', lobby.id)

      if (!candidates || !votes) return

      // 2. Calcolo Semplice (Media Punteggi)
      // Nota: Qui in futuro integreremo l'algoritmo Schulze complesso.
      // Per ora facciamo una media pesata basata sui fattori.
      
      const scores = candidates.map(candidate => {
        // Filtra i voti per questo candidato
        const candidateVotes = votes.filter(v => v.candidate_id === candidate.id)
        
        let totalScore = 0
        const factorScores: Record<string, number> = {}

        // Inizializza i fattori a 0
        lobby.settings.factors.forEach((f: any) => factorScores[f.id] = 0)

        // Somma i voti
        candidateVotes.forEach(vote => {
          lobby.settings.factors.forEach((factor: any) => {
             const val = vote.scores[factor.id] || 0
             factorScores[factor.id] += val
             totalScore += (val * factor.weight) // Applica il peso
          })
        })

        // Calcola medie
        const voteCount = candidateVotes.length || 1
        const finalScore = totalScore / voteCount

        return {
          ...candidate,
          finalScore,
          factorScores: lobby.settings.factors.map((f: any) => factorScores[f.id] / voteCount) // Media per il grafico
        }
      })

      // Ordina dal vincitore allo sconfitto
      scores.sort((a, b) => b.finalScore - a.finalScore)
      setResults(scores)
      setLoading(false)
    }

    calculateResults()
  }, [lobby, supabase])

  if (loading) return <div className="text-center text-white p-10">🧮 Calcolo della democrazia in corso...</div>

  // Dati per il Grafico Radar (Il vincitore vs il secondo)
  const topTwo = results.slice(0, 2)
  const chartData = {
    labels: lobby.settings.factors.map((f: any) => f.name),
    datasets: topTwo.map((r, index) => ({
      label: r.name,
      data: r.factorScores,
      backgroundColor: index === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(239, 68, 68, 0.2)',
      borderColor: index === 0 ? '#6366f1' : '#ef4444',
      borderWidth: 2,
    })),
  }

  const chartOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: 'white', font: { size: 12 } },
        ticks: { display: false, backdropColor: 'transparent' } // Nasconde i numeri sull'asse
      }
    },
    plugins: {
      legend: { labels: { color: 'white' } }
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            🏆 IL VINCITORE È...
          </h1>
          <p className="text-gray-400">Analisi completata su {results.length} candidati.</p>
        </header>

        {/* IL PODIO */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8 pb-8">
            {/* 2° Posto */}
            {results[1] && (
                <div className="order-2 md:order-1 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-4 border-gray-400 bg-gray-800 flex items-center justify-center text-3xl mb-2">
                        🥈
                    </div>
                    <div className="h-32 w-32 bg-gray-800 rounded-t-lg flex items-center justify-center border-t border-gray-700">
                        <span className="font-bold text-gray-300">{results[1].name}</span>
                    </div>
                </div>
            )}

            {/* 1° Posto */}
            {results[0] && (
                <div className="order-1 md:order-2 flex flex-col items-center z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-yellow-400 bg-yellow-900/20 flex items-center justify-center text-5xl mb-4 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                        👑
                    </div>
                    <div className="h-48 w-40 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-t-xl flex flex-col items-center justify-center border-t border-yellow-400 shadow-2xl">
                        <span className="font-black text-xl text-white">{results[0].name}</span>
                        <span className="text-xs text-yellow-200 mt-1">Punteggio: {results[0].finalScore.toFixed(1)}</span>
                    </div>
                </div>
            )}

            {/* 3° Posto */}
            {results[2] && (
                <div className="order-3 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full border-4 border-orange-700 bg-gray-800 flex items-center justify-center text-2xl mb-2">
                        🥉
                    </div>
                    <div className="h-24 w-28 bg-gray-800 rounded-t-lg flex items-center justify-center border-t border-gray-700">
                        <span className="font-bold text-gray-400">{results[2].name}</span>
                    </div>
                </div>
            )}
        </div>

        {/* ANALISI GRAFICA (Radar) */}
        <div className="bg-gray-900/50 p-8 rounded-3xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-center">⚔️ Analisi Fattoriale</h2>
            <div className="h-[300px] md:h-[400px] flex justify-center">
                {lobby.settings.factors.length > 2 ? (
                    <Radar data={chartData} options={chartOptions} />
                ) : (
                    <p className="text-gray-500 flex items-center">
                        Servono almeno 3 fattori (es. Gusto, Prezzo, Aspetto) per generare il grafico Radar.
                    </p>
                )}
            </div>
        </div>

        {/* LISTA COMPLETA */}
        <div className="space-y-2">
            <h3 className="font-bold text-gray-500 uppercase text-sm tracking-wider">Classifica Completa</h3>
            {results.map((r, i) => (
                <div key={r.id} className="flex justify-between p-4 bg-gray-900 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-gray-500">#{i + 1}</span>
                        <span className="font-bold">{r.name}</span>
                    </div>
                    <span className="font-mono text-indigo-400">{r.finalScore.toFixed(2)} pts</span>
                </div>
            ))}
        </div>

      </div>
    </div>
  )
}