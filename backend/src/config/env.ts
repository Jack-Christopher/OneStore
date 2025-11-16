const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  port: process.env.PORT || 4000,
  dbUrl: process.env.MONGO_URI || "mongodb://localhost:27017/onestore",
  jwtSecret: process.env.JWT_SECRET || "default_secret"
};