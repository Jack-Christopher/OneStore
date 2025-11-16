function requireFields(fields: Record<string, unknown>): string | null {
  for (const key in fields) {
    if (!fields[key]) return `${key} is required`;
  }
  return null;
}

module.exports = { requireFields };