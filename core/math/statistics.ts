
export const calculateMean = (values: number[]): number => {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
};


export const calculateStdDev = (values: number[], mean?: number): number => {
    if (values.length === 0) return 0;
    const m = mean ?? calculateMean(values);
    const squareDiffs = values.map(value => Math.pow(value - m, 2));
    const avgSquareDiff = calculateMean(squareDiffs);
    return Math.sqrt(avgSquareDiff);
};


export const calculateZScore = (value: number, mean: number, stdDev: number): number => {
    if (stdDev === 0) return 0; 
    return (value - mean) / stdDev;
};


export const normalizeZScoreToPercent = (zScore: number): number => {
    const MIN_Z = -3;
    const MAX_Z = 3;
    
    const clamped = Math.max(MIN_Z, Math.min(MAX_Z, zScore));
    
    return ((clamped - MIN_Z) / (MAX_Z - MIN_Z)) * 100;
}; 