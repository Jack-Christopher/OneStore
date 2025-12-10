import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

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

  const handleClick = () => {
    setIsPressed(true)
    toggleTheme()
    setTimeout(() => setIsPressed(false), 200)
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-lg bg-card text-card-foreground border border-border hover:bg-muted transition-all duration-200 ${
        isPressed ? 'scale-90 rotate-12' : 'scale-100 rotate-0'
      }`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <span className={`inline-block transition-transform duration-300 ${isPressed ? 'rotate-180' : 'rotate-0'}`}>
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </span>
    </button>
  )
}

