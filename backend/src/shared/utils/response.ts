module.exports = {
  ok: (res, data) => res.json({ success: true, data }),
  fail: (res, message, status = 400) => res.status(status).json({ success: false, message })
};