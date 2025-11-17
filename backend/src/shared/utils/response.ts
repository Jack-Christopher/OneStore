function ok(res: Res, data: unknown) {
  return res.json({ success: true, data });
}

function fail(res: Res, message: string, code: string, status = 400) {
  return res.status(status).json({ success: false, message, code });
}

module.exports = { ok, fail };
