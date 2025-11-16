module.exports = {
  log: (...args: unknown[]) => console.log("[LOG]", ...args),
  error: (...args: unknown[]) => console.error("[ERROR]", ...args)
};