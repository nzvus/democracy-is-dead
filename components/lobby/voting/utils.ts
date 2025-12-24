import { CSSProperties } from 'react'

// Definiamo cosa restituisce la funzione
type ColorResult = {
  style: CSSProperties;
  className: string;
}

export const getScoreColor = (score: number, max: number): ColorResult => {
  // Se il voto è 0 o nullo (non ancora votato), stile grigio spento
  if (!score || score === 0) {
    return {
      style: {}, // Nessuno stile inline specifico
      className: "bg-gray-800 text-gray-500 border-gray-700" 
    };
  }

  // Calcolo Percentuale (0 a 1)
  // Evitiamo divisione per zero se max è 0
  const safeMax = max > 0 ? max : 10;
  const percentage = Math.min(Math.max(score / safeMax, 0), 1);
  
  // Calcolo Tinta HSL: 
  // 0 (Rosso) -> 60 (Giallo) -> 120 (Verde)
  // Usiamo pow(percentage, 1.5) per spingere i colori verso il rosso/arancio 
  // finché il voto non è davvero alto, così il verde si merita solo con voti alti.
  const hue = Math.round(Math.pow(percentage, 1.2) * 120); 
  
  return {
    style: { 
      backgroundColor: `hsla(${hue}, 85%, 35%, 0.8)`, 
      borderColor: `hsla(${hue}, 85%, 45%, 1)` 
    },
    className: "text-white border shadow-[0_0_15px_-5px_rgba(0,0,0,0.5)] transition-all duration-300"
  };
};