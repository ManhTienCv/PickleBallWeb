import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('demopick_theme') as Theme
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved
      }
    } catch {}
    return 'light'
  })

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = (currentTheme: Theme) => {
      let isDark = false
      if (currentTheme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      } else {
        isDark = currentTheme === 'dark'
      }

      setResolvedTheme(isDark ? 'dark' : 'light')

      if (isDark) {
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
      } else {
        root.classList.remove('dark')
        root.style.colorScheme = 'light'
      }
    }

    applyTheme(theme)

    // Listen to system theme changes if set to 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('demopick_theme', newTheme)
    } catch {}
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
