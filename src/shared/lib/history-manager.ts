interface HistoryItem {
  code: string;
  name: string;
  lastVisited: string;
  role: 'host' | 'guest';
}

const KEY = 'did_history';

export const addToHistory = (item: Omit<HistoryItem, 'lastVisited'>) => {
  if (typeof window === 'undefined') return;
  
  const raw = localStorage.getItem(KEY);
  let history: HistoryItem[] = raw ? JSON.parse(raw) : [];
  
  // Remove duplicate if exists
  history = history.filter(h => h.code !== item.code);
  
  // Add to top
  history.unshift({ ...item, lastVisited: new Date().toISOString() });
  
  // Limit to 5
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, 5)));
};

export const getHistory = (): HistoryItem[] => {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
};

export const clearHistory = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(KEY);
};