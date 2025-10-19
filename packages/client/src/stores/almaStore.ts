import { create } from 'zustand';

interface AlmaState {
  isAlmaActivated: boolean;
  setAlmaActivated: (activated: boolean) => void;
}

export const useAlmaStore = create<AlmaState>((set) => ({
  isAlmaActivated: false,
  
  setAlmaActivated: (activated: boolean) => {
    set({ isAlmaActivated: activated });
  }
}));
