export {}; // Empty export to force module scope

const service = require("./auth.service");
const { ok, fail } = require("../../shared/utils/response");

async function login(req: Req, res: Res) {
  const result = await service.login(req.body);
  if (!result) return fail(res, "Invalid credentials", 401);

  return ok(res, /** @type {ApiResponse<any>} */({
    user: {
      id: result.user._id,
      email: result.user.email,
      name: result.user.name
    },
    token: result.token
  }));
}

async function register(req: Req, res: Res) {
  const user = await service.register(req.body);

  if (!user) return fail(res, "Email already in use");

  return ok(res, {
    id: user._id,
    email: user.email,
    name: user.name
  });
}

module.exports = { login, register };
