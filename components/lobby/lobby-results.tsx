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
import { calculateSchulze, calculateBorda } from '@/utils/voting-engine'
import { useLanguage } from '@/components/providers/language-provider'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

export default function LobbyResults({ lobby }: { lobby: any }) {
  const { t } = useLanguage()
  const supabase = createClient()
  const [results, setResults] = useState<any[]>([])
  const [schulzeWinner, setSchulzeWinner] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const calculateResults = async () => {
      const { data: candidates } = await supabase.from('candidates').select('*').eq('lobby_id', lobby.id)
      const { data: votes } = await supabase.from('votes').select('*').eq('lobby_id', lobby.id)

      if (!candidates || !votes || candidates.length === 0) return

      const factors = lobby.settings.factors || []

      const classicScores = candidates.map(candidate => {
        const candidateVotes = votes.filter(v => v.candidate_id === candidate.id)
        let totalScore = 0
        const factorScores: Record<string, number> = {}
        factors.forEach((f: any) => factorScores[f.id] = 0)

        candidateVotes.forEach(vote => {
          factors.forEach((factor: any) => {
             const val = vote.scores[factor.id] || 0
             factorScores[factor.id] += val
             totalScore += (val * factor.weight)
          })
        })

        const voteCount = candidateVotes.length || 1
        return {
          ...candidate,
          finalScore: totalScore / voteCount, 
          factorScores: factors.map((f: any) => factorScores[f.id] / voteCount)
        }
      }).sort((a, b) => b.finalScore - a.finalScore)

      const schulzeResults = calculateSchulze(candidates, votes, factors)
      const bordaResults = calculateBorda(candidates, votes, factors)

      setResults(classicScores)
      setSchulzeWinner(schulzeResults[0]) 
      setLoading(false)
    }

    calculateResults()
  }, [lobby, supabase])

  if (loading) return <div className="text-center text-white p-10 animate-pulse">🧮 Calcolo tensori sociali...</div>

  const chartData = {
    labels: lobby.settings.factors.map((f: any) => f.name),
    datasets: results.slice(0, 2).map((r, index) => ({
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
        ticks: { display: false, backdropColor: 'transparent' }
      }
    },
    plugins: { legend: { labels: { color: 'white' } } }
  }

  const paradoxDetected = schulzeWinner && results[0] && schulzeWinner.id !== results[0].id

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-12 pb-24">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            {t.results.winner_title}
          </h1>
        </header>

        {paradoxDetected && (
            <div className="bg-red-900/20 border border-red-500 p-6 rounded-2xl text-center animate-pulse">
                <h3 className="text-2xl font-bold text-red-400">⚠️ DEMOCRACY IS DEAD!</h3>
                <p className="text-gray-300 mt-2">
                    La media matematica ha scelto <strong>{results[0].name}</strong>, <br/>
                    ma il <strong>Metodo Schulze</strong> (scontri diretti) dice che il vero vincitore è:
                </p>
                <div className="text-4xl font-black text-white mt-4">{schulzeWinner.name} 👑</div>
                <p className="text-xs text-gray-500 mt-4">
                    Questo accade perché {results[0].name} è piaciuto "abbastanza" a tutti, 
                    ma {schulzeWinner.name} ha battuto tutti in 1vs1.
                </p>
            </div>
        )}

        {/* IL PODIO (Classico) */}
        {!paradoxDetected && (
             <div className="flex flex-col items-center z-10">
                <div className="w-32 h-32 rounded-full border-4 border-yellow-400 bg-yellow-900/20 flex items-center justify-center text-5xl mb-4 shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                    {results[0]?.image_url ? <img src={results[0].image_url} className="w-full h-full object-cover rounded-full"/> : '👑'}
                </div>
                <h2 className="text-3xl font-bold">{results[0]?.name}</h2>
                <p className="text-yellow-500 font-mono">Score: {results[0]?.finalScore.toFixed(2)}</p>
            </div>
        )}

        {/* GRAFICO RADAR */}
        <div className="bg-gray-900/50 p-4 md:p-8 rounded-3xl border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-center">{t.results.analysis_title}</h2>
            <div className="h-[300px] md:h-[400px] flex justify-center relative">
                 <Radar data={chartData} options={chartOptions} />
            </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                    <tr>
                        <th className="p-4">Candidato</th>
                        <th className="p-4">Media (0-10)</th>
                        <th className="p-4">Schulze (Wins)</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {results.map((r) => {
                        const sWin = schulzeWinner && schulzeWinner.id === r.id;
                        return (
                            <tr key={r.id} className="hover:bg-gray-800/50">
                                <td className="p-4 font-bold flex items-center gap-2">
                                    {r.name} {sWin && paradoxDetected && '👑'}
                                </td>
                                <td className="p-4 font-mono text-indigo-400">{r.finalScore.toFixed(2)}</td>
                                <td className="p-4 font-mono text-green-400">
\                                    {sWin ? 'VINCITORE' : '-'}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>

      </div>
    </div>
  )
}