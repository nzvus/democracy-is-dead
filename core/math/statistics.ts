/**
 * Calcola la media aritmetica
 */
export const calculateMean = (values: number[]): number => {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
};

/**
 * Calcola la Deviazione Standard (Popolazione)
 */
export const calculateStdDev = (values: number[], mean?: number): number => {
    if (values.length === 0) return 0;
    const m = mean ?? calculateMean(values);
    const squareDiffs = values.map(value => Math.pow(value - m, 2));
    const avgSquareDiff = calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
};

/**
 * Calcola lo Z-Score: (Valore - Media) / DeviazioneStandard
 * Indica quante deviazioni standard un valore si discosta dalla media.
 */
export const calculateZScore = (value: number, mean: number, stdDev: number): number => {
    if (stdDev === 0) return 0; // Evita divisione per zero se tutti i voti sono uguali
    return (value - mean) / stdDev;
};

/**
 * Normalizza un valore Z-Score in un range 0-100 (Min-Max Scaling)
 * Utile per visualizzare i grafici.
 * Assumiamo un range ragionevole di Z tra -3 e +3.
 */
export const normalizeZScoreToPercent = (zScore: number): number => {
    const MIN_Z = -3;
    const MAX_Z = 3;
    // Clamping
    const clamped = Math.max(MIN_Z, Math.min(MAX_Z, zScore));
    // Formula: (x - min) / (max - min) * 100
    return ((clamped - MIN_Z) / (MAX_Z - MIN_Z)) * 100;
};