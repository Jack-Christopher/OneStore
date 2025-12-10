/**
 * Utility functions for form handling
 */

/**
 * Trims all string values in an object recursively
 * This ensures that duplicate validation works correctly by treating " Name " the same as "Name"
 */
export function trimStringValues<T extends Record<string, any>>(obj: T): T {
  const trimmed = { ...obj };
  
  for (const key in trimmed) {
    if (trimmed.hasOwnProperty(key)) {
      const value = trimmed[key];
      
      // Trim string values
      if (typeof value === 'string') {
        trimmed[key] = value.trim() as any;
      }
      // Recursively trim nested objects
      else if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        trimmed[key] = trimStringValues(value);
      }
      // Trim strings in arrays
      else if (Array.isArray(value)) {
        trimmed[key] = value.map((item) => {
          if (typeof item === 'string') {
            return item.trim();
          } else if (item !== null && typeof item === 'object' && !(item instanceof Date)) {
            return trimStringValues(item);
          }
          return item;
        }) as any;
      }
    }
  }
  
  return trimmed;
}

/**
 * Trims a single string value
 */
export function trimString(value: string | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

/**
 * Creates a trimmed onChange handler for string inputs
 * Trims the value on blur (when user leaves the field)
 */
export function createTrimmedStringHandler<T>(
  setForm: React.Dispatch<React.SetStateAction<T>>,
  field: keyof T
) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
}

/**
 * Creates a trimmed onBlur handler for string inputs
 * Trims the value when the user leaves the field
 */
export function createTrimmedBlurHandler<T>(
  setForm: React.Dispatch<React.SetStateAction<T>>,
  field: keyof T
) {
  return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const trimmedValue = trimString(e.target.value);
    setForm((prev) => ({
      ...prev,
      [field]: trimmedValue,
    }));
  };
}

