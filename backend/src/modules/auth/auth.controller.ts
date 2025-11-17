export { }; // Empty export to force module scope

const service = require("./auth.service");
const { ok, fail } = require("../../shared/utils/response");

async function login(req: Req, res: Res) {
  const result = await service.login(req.body);
  if (!result.ok) return fail(res, result.code.message, result.code.name, result.status);

  const { id, email, name, token } = result.data;

  return ok(res, ({
    user: {
      id: id,
      email: email,
      name: name
    },
    token: token
  }));
}

async function register(req: Req, res: Res) {
  const result = await service.register(req.body);

  if (!result.ok) return fail(res, result.code.message, result.code.name, result.status);

  const { id, email, name } = result.data;

  return ok(res, {
    id: id,
    email: email,
    name: name
  });
}

module.exports = { login, register }; 
