import { LobbyStatus } from '../model/types';

export const isLobbyActive = (status: LobbyStatus) => status === 'voting';
export const isLobbySetup = (status: LobbyStatus) => status === 'setup';
export const isLobbyEnded = (status: LobbyStatus) => status === 'ended';
export const isLobbyWaiting = (status: LobbyStatus) => status === 'waiting';

export const getStatusLabelKey = (status: LobbyStatus) => {
  switch (status) {
    case 'waiting': return 'status_waiting';
    case 'setup': return 'status_setup';
    case 'voting': return 'status_voting';
    case 'ended': return 'status_ended';
    default: return 'status_waiting';
  }
};

export const getStatusColor = (status: LobbyStatus) => {
  switch (status) {
    case 'voting': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'setup': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'ended': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    default: return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
  }
};