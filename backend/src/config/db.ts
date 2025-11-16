const mongoose = require("mongoose");
const { dbUrl } = require("./env");
module.exports = async function connectDB() {
  await mongoose.connect(dbUrl);
};