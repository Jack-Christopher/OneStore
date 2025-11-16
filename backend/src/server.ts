const app = require("./app");
const { port } = require("./config/env");
const connect = require("./config/db");
connect();
app.listen(port, () => console.log(`Server running on port ${port}`));