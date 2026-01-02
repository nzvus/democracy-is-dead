import { create } from 'zustand';
import { ReactNode } from 'react';

interface ModalState {
  isOpen: boolean;
  title: string | null;
  content: ReactNode | null;
  type: 'info' | 'confirm' | 'alert';
  onConfirm?: () => void;
  onCancel?: () => void;
  
  openModal: (opts: { 
    title: string; 
    content: ReactNode; 
    type?: 'info' | 'confirm' | 'alert';
    onConfirm?: () => void;
    onCancel?: () => void;
  }) => void;
  
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  title: null,
  content: null,
  type: 'info',
  onConfirm: undefined,
  onCancel: undefined,

  openModal: (opts) => set({ 
    isOpen: true, 
    title: opts.title, 
    content: opts.content,
    type: opts.type || 'info',
    onConfirm: opts.onConfirm,
    onCancel: opts.onCancel
  }),

  closeModal: () => set({ isOpen: false, content: null, onConfirm: undefined })
}));