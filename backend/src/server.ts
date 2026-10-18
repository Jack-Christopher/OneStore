const app = require("./app");
const { port } = require("./config/env");
const connect = require("./config/db");
const { startScheduler } = require("./jobs/scheduler");

connect()
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
    startScheduler();
  })
  .catch((error: unknown) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });