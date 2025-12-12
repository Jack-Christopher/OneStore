/**
 * Limpia errores de precisión de punto flotante en JavaScript
 * Redondea a un número razonable de decimales solo si detecta errores de precisión
 * 
 * @param num - Número a limpiar
 * @param maxDecimals - Máximo de decimales a mantener (default: 10)
 * @returns Número limpio sin errores de precisión
 */
export function cleanFloat(num: number, maxDecimals: number = 10): number {
  if (!isFinite(num)) return num;
  
  // Convertir a string para detectar errores de precisión
  const str = num.toString();
  
  // Si no tiene punto decimal, retornar tal cual
  if (!str.includes('.')) return num;
  
  // Contar decimales
  const decimalPart = str.split('.')[1];
  if (!decimalPart) return num;
  
  // Si tiene muchos decimales (probable error de precisión), limpiar
  if (decimalPart.length > maxDecimals) {
    return parseFloat(num.toFixed(maxDecimals));
  }
  
  // Si tiene pocos decimales pero muestra error de precisión (como 8.120000000000001)
  // Buscar patrones como muchos ceros seguidos de un 1 al final
  const match = decimalPart.match(/^(\d*?)(0{5,}1|1{5,}0)$/);
  if (match) {
    // Redondear a los decimales significativos
    const significantDecimals = match[1].length || 2;
    return parseFloat(num.toFixed(Math.max(significantDecimals, 2)));
  }
  
  return num;
}

/**
 * Calcula multiplicación con limpieza de precisión
 */
export function multiply(a: number, b: number, maxDecimals: number = 10): number {
  return cleanFloat(a * b, maxDecimals);
}

/**
 * Calcula división con limpieza de precisión
 */
export function divide(a: number, b: number, maxDecimals: number = 10): number {
  if (b === 0) return 0;
  return cleanFloat(a / b, maxDecimals);
}

