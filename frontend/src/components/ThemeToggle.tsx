import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = document.documentElement.classList.contains('dark')
    setIsDark(savedTheme === 'dark' || (!savedTheme && prefersDark))
  }, [])

  const toggleTheme = () => {
    const html = document.documentElement
    const newIsDark = !html.classList.contains('dark')

    if (newIsDark) {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }

    setIsDark(newIsDark)
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-card text-card-foreground border border-border hover:bg-muted transition-colors"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  )
}

