function toSnakeCase(dto: any) {
  const snakeCaseDto: any = {};
  for (const key in dto) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeCaseDto[snakeKey] = dto[key];
  }
  return snakeCaseDto;
}

export { toSnakeCase };