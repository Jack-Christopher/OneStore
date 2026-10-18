export { };
const exchangeRates = require("../modules/exchangeRates/exchangeRates.service");

function msUntil(hour: number, minute: number) {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function scheduleDaily(hour: number, minute: number, task: () => Promise<unknown>) {
  const tick = async () => {
    try {
      await task();
    } catch (error) {
      console.error("Scheduled job failed:", error);
    }
    setTimeout(tick, msUntil(hour, minute));
  };
  setTimeout(tick, msUntil(hour, minute));
}

function startScheduler() {
  exchangeRates.syncLatest().catch((error: any) => {
    console.error("Initial exchange rate sync failed:", error.message);
  });

  // SUNAT publica el tipo de cambio del día en la mañana.
  scheduleDaily(8, 5, () => exchangeRates.syncLatest());
}

module.exports = { startScheduler };
