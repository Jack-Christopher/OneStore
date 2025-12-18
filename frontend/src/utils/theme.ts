/**
 * Theme utility functions for getting CSS variable values
 * Useful for libraries like Recharts that don't support CSS variables directly
 */

/**
 * Get a CSS variable value from the document root
 */
export function getCSSVariable(variableName: string): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
}

/**
 * Get theme colors for charts
 * Returns colors that work well with both light and dark themes
 */
export function getChartColors() {
  const isDark = document.documentElement.classList.contains('dark');
  
  if (isDark) {
    // Dark theme colors - using theme palette
    return {
      primary: getCSSVariable('--secondary') || '#3B9797',
      secondary: getCSSVariable('--accent') || '#BF092F',
      accent: getCSSVariable('--primary') || '#16476A',
      success: '#00C49F',
      warning: '#FFBB28',
      info: '#0088FE',
      grid: getCSSVariable('--border') || '#20395C',
      text: getCSSVariable('--foreground') || '#F0F4FF',
    };
  } else {
    // Light theme colors - using theme palette
    return {
      primary: getCSSVariable('--primary') || '#EFE9E3',
      secondary: getCSSVariable('--secondary') || '#D9CFC7',
      accent: getCSSVariable('--accent') || '#C9B59C',
      success: '#00C49F',
      warning: '#FFBB28',
      info: '#0088FE',
      grid: getCSSVariable('--border') || '#D7D5D2',
      text: getCSSVariable('--foreground') || '#1A1A1A',
    };
  }
}

/**
 * Get a palette of colors for charts (for pie charts, etc.)
 */
export function getChartPalette(): string[] {
  const colors = getChartColors();
  return [
    colors.info,
    colors.success,
    colors.warning,
    '#FF8042',
    colors.primary,
    colors.secondary,
    '#8884D8',
    '#82CA9D',
  ];
}

