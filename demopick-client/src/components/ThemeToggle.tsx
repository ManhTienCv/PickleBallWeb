import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemeToggleProps {
  className?: string
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      title={isDark ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
      aria-label="Toggle theme"
      className={`relative p-2.5 rounded-full transition-colors flex items-center justify-center border ${
        isDark
          ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-700/80 shadow-md shadow-black/30'
          : 'bg-white/80 border-slate-200/90 text-slate-700 hover:bg-slate-100 shadow-sm'
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Moon className="w-5 h-5 text-amber-300 fill-amber-300/20" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Sun className="w-5 h-5 text-amber-500 fill-amber-500/20" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
