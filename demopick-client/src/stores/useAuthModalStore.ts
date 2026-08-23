import { create } from 'zustand'

interface AuthModalState {
  isOpen: boolean
  view: 'login' | 'register'
  openLogin: () => void
  openRegister: () => void
  close: () => void
  setView: (view: 'login' | 'register') => void
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: 'login',
  openLogin: () => set({ isOpen: true, view: 'login' }),
  openRegister: () => set({ isOpen: true, view: 'register' }),
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}))
