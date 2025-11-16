const svc = require("./auth.service");
const response = require("../../shared/utils/response");
module.exports = {
  register: async (req, res) => {
    try {
      const user = await svc.register(req.body);
      response.ok(res, user);
    } catch (e) {
      response.fail(res, e.message);
    }
  },
  login: async (req, res) => {
    try {
      const token = await svc.login(req.body);
      response.ok(res, { token });
    } catch (e) {
      response.fail(res, e.message);
    }
  }
};