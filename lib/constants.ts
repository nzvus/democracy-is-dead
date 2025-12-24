export const UI = {
  // Layout & Spacing
  LAYOUT: {
    MAX_WIDTH_CONTAINER: "max-w-xl", // Larghezza uniforme per mobile/desktop
    PADDING_X: "px-6",
    PADDING_Y: "py-8",
    GAP_DEFAULT: "gap-4",
    ROUNDED_LG: "rounded-3xl",
    ROUNDED_MD: "rounded-xl",
  },
  
  // Colors & Themes (Classi Tailwind)
  COLORS: {
    PRIMARY: "indigo", 
    // Stile per trend "Alto è meglio" (Gusto, Estetica)
    TREND_HIGH: "text-green-400 border-green-500/30 bg-green-900/10", 
    // Stile per trend "Basso è meglio" (Prezzo, Calorie, Noia)
    TREND_LOW: "text-amber-400 border-amber-500/30 bg-amber-900/10", 
    
    WARNING: "text-red-400",
    TEXT_MUTED: "text-gray-400",
    
    // Sfondo standard per le card
    BG_CARD: "bg-gray-900/50 border border-gray-800",
    BG_INPUT: "bg-gray-900 border border-gray-700",
  },

  // Configuration Limits
  LIMITS: {
    MAX_SCALE_DEFAULT: 10,
    MIN_CANDIDATES: 2,
    IMAGE_SIZE_UPLOAD_MB: 2,
  }
}