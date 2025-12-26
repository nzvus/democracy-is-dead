
export const getScoreColor = (score: number, max: number, isLowerBetter: boolean) => {
  let normalized = score / max
  
  
  
  if (isLowerBetter) normalized = 1 - normalized
  
  if (normalized < 0.3) return 'bg-red-500' 
  if (normalized < 0.7) return 'bg-yellow-500' 
  return 'bg-green-500' 
}