const User = require("../../database/models/User");
module.exports = {
findByEmail: (email) => User.findOne({ email }),
create: (data) => User.create(data)
};