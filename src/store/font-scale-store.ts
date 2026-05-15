import { create } from 'zustand'

export type FontScale = 'sm' | 'md' | 'lg'

const LS_KEY = 'font_scale'
const VALID: FontScale[] = ['sm', 'md', 'lg']

function loadScale(): FontScale {
  try {
    const v = localStorage.getItem(LS_KEY)
    if (v && VALID.includes(v as FontScale)) return v as FontScale
  } catch {
    // ignore
  }
  return 'md'
}

function applyScale(scale: FontScale) {
  document.documentElement.setAttribute('data-fscale', scale)
}

interface FontScaleState {
  scale: FontScale
  showBar: boolean
  setScale: (scale: FontScale) => void
  toggleBar: () => void
}

const initialScale = loadScale()
applyScale(initialScale)

export const useFontScaleStore = create<FontScaleState>((set) => ({
  scale: initialScale,
  showBar: false,

  setScale: (scale) => {
    try {
      localStorage.setItem(LS_KEY, scale)
    } catch {
      // ignore
    }
    applyScale(scale)
    set({ scale })
  },

  toggleBar: () => {
    set((s) => ({ showBar: !s.showBar }))
  },
}))
