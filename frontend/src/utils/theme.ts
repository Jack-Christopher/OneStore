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

