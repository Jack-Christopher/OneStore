/**
 * Theme Configuration File
 * ========================
 * Edit colors here to quickly change the app's appearance.
 * Changes require a rebuild to take effect.
 */

export const themes = {
  light: {
    background: '#F9F8F6',
    primary: '#EFE9E3',
    secondary: '#D9CFC7',
    accent: '#C9B59C',
    textMain: '#132440',
    textSecondary: '#4a5568',
    textInverted: '#F9F8F6',
  },
  dark: {
    background: '#132440',
    primary: '#16476A',
    secondary: '#3B9797',
    accent: '#BF092F',
    textMain: '#F9F8F6',
    textSecondary: '#cbd5e0',
    textInverted: '#132440',
  },
} as const

export type ThemeName = keyof typeof themes
export type ThemeColors = typeof themes.light

/**
 * Apply theme to document
 * This function updates CSS variables and the dark class
 */
export function applyTheme(themeName: ThemeName): void {
  const theme = themes[themeName]
  const root = document.documentElement

  // Set CSS variables
  root.style.setProperty('--background', theme.background)
  root.style.setProperty('--primary', theme.primary)
  root.style.setProperty('--secondary', theme.secondary)
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--text-main', theme.textMain)
  root.style.setProperty('--text-secondary', theme.textSecondary)
  root.style.setProperty('--text-inverted', theme.textInverted)

  // Toggle dark class for Tailwind
  if (themeName === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }

  // Store preference in localStorage for persistence
  localStorage.setItem('theme', themeName)
}

/**
 * Get saved theme from localStorage or default to 'light'
 */
export function getSavedTheme(): ThemeName {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') {
    return saved
  }
  return 'light'
}

/**
 * Initialize theme on app load
 * Call this early to prevent flash of wrong theme
 */
export function initializeTheme(): void {
  const savedTheme = getSavedTheme()
  applyTheme(savedTheme)
}



