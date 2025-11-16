const bcrypt = require("bcryptjs");
module.exports = {
  hash: async (str: string) => bcrypt.hash(str, 10),
  compare: async (str: string, hashed: string) => bcrypt.compare(str, hashed)
};