import { create } from 'zustand';

interface UserState {
  notifications: number;
  setNotifications: (count: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  notifications: 0,
  setNotifications: (count) => set({ notifications: count }),
}));
