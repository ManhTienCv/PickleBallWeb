import { create } from 'zustand'

export type AuthModalView = 'login' | 'register' | 'forgot' | 'reset' | 'google_select' | 'google_complete'

interface AuthModalState {
  isOpen: boolean
  view: AuthModalView
  openLogin: () => void
  openRegister: () => void
  openForgot: () => void
  close: () => void
  setView: (view: AuthModalView) => void
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: 'login',
  openLogin: () => set({ isOpen: true, view: 'login' }),
  openRegister: () => set({ isOpen: true, view: 'register' }),
  openForgot: () => set({ isOpen: true, view: 'forgot' }),
  close: () => set({ isOpen: false }),
  setView: (view) => set({ view }),
}))
