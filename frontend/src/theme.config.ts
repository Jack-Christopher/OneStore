/**
 * Theme Configuration File
 * ========================
 * Theme is now managed via CSS variables in styles/index.css
 * This file provides utility functions for theme management
 */

export type ThemeName = 'light' | 'dark'

/**
 * Apply theme to document by toggling the 'dark' class
 * CSS variables are defined in styles/index.css and automatically switch
 */
export function applyTheme(themeName: ThemeName): void {
  const root = document.documentElement

  // Toggle dark class for Tailwind and CSS variables
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

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): ThemeName {
  const html = document.documentElement
  const isDark = html.classList.contains('dark')
  const newTheme: ThemeName = isDark ? 'light' : 'dark'
  applyTheme(newTheme)
  return newTheme
}



