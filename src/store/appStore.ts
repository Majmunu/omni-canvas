import { create } from 'zustand'

type AppStore = {
  counter: number
  inc: () => void
}

export const useAppStore = create<AppStore>((set) => ({
  counter: 0,
  inc: () => set((state) => ({ counter: state.counter + 1 })),
}))
