export const CONSTANTS = {
  limits: {
    MAX_VOTE_SCALE: 100,
    MIN_VOTE_SCALE: 5,
    MAX_FILE_SIZE_MB: 2,
    LOBBY_CODE_LENGTH: 6,
  },
  colors: {
    primary: "indigo",
    success: "green",
    warning: "amber",
    danger: "red",
    background: "gray-950",
  },
  defaults: {
    LOCALE: 'en',
    AVATAR_API: "https://api.dicebear.com/9.x/avataaars/svg?seed=",
  }
} as const;