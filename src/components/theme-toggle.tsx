'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'bright' | 'light'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'bright' | 'light' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    // Default to dark mode if no preference saved
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'dark')
    setTheme(currentTheme)
    
    // Apply theme classes
    document.documentElement.classList.remove('dark', 'bright', 'light')
    document.documentElement.classList.add(currentTheme)
  }, [])

  const toggleTheme = () => {
    const themes: Array<'dark' | 'bright' | 'light'> = ['dark', 'bright', 'light']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    const newTheme = themes[nextIndex]
    
    setTheme(newTheme)
    document.documentElement.classList.remove('dark', 'bright', 'light')
    document.documentElement.classList.add(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Sun className="h-5 w-5 text-warning" />
      case 'bright':
        return <Monitor className="h-5 w-5 text-blue-400" />
      case 'light':
        return <Moon className="h-5 w-5 text-primary" />
      default:
        return <Sun className="h-5 w-5 text-warning" />
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Dark'
      case 'bright':
        return 'Bright'
      case 'light':
        return 'Light'
      default:
        return 'Dark'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg glass hover-lift transition-all duration-300 border-white/20 flex items-center gap-2"
        aria-label={`Toggle theme (Current: ${getThemeLabel()})`}
      >
        {getThemeIcon()}
        <span className="text-xs text-gray-300 font-medium">
          {getThemeLabel()}
        </span>
      </button>
    </div>
  )
}
