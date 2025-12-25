// Funzione condivisa per colorare le barre di voto
export const getScoreColor = (score: number, max: number, isLowerBetter: boolean) => {
  let normalized = score / max
  
  // Se "Basso è meglio" (es. prezzo), invertiamo la logica:
  // 0 diventa 1 (verde), 10 diventa 0 (rosso)
  if (isLowerBetter) normalized = 1 - normalized
  
  if (normalized < 0.3) return 'bg-red-500' // Punteggio basso
  if (normalized < 0.7) return 'bg-yellow-500' // Medio
  return 'bg-green-500' // Alto
}