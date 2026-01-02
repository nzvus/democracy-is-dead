import { create } from 'zustand';
import { Lobby } from './types';
import { Candidate } from '@/entities/candidate/model/types';
import { Factor } from '@/entities/factor/model/types';

interface LobbyState {
  lobby: Lobby | null;
  candidates: Candidate[];
  factors: Factor[];
  
  setLobby: (lobby: Lobby) => void;
  setCandidates: (candidates: Candidate[]) => void;
  updateStatus: (status: Lobby['status']) => void;
}

// [FIX] Added <LobbyState> generic to create()
export const useLobbyStore = create<LobbyState>((set) => ({
  lobby: null,
  candidates: [],
  factors: [],

  setLobby: (lobby: Lobby) => set({ 
    lobby, 
    factors: lobby.settings.factors || [] 
  }),

  setCandidates: (candidates: Candidate[]) => set({ candidates }),

  updateStatus: (status: Lobby['status']) => set((state) => ({
    lobby: state.lobby ? { ...state.lobby, status } : null
  })),
}));