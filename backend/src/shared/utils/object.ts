function toSnakeCase(dto: any): any {
  // Handle arrays
  if (Array.isArray(dto)) {
    return dto.map(item => toSnakeCase(item));
  }

  // Handle objects
  if (typeof dto === 'object' && dto !== null) {
    const snakeCaseDto: any = {};
    for (const key in dto) {
      // Skip frontend-only fields like 'id' (UUIDs)
      if (key === 'id') continue;

      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeCaseDto[snakeKey] = toSnakeCase(dto[key]);
    }
    return snakeCaseDto;
  }

  // Return primitive values as-is
  return dto;
}

export { toSnakeCase };