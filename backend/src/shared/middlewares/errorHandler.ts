module.exports = function (err: Error, req: Req, res: Res, next: Next) {
  console.error(err);
  const statusCode = (err as any).statusCode || 500;
  const message = (err as any).message + " with request: " + req.method + " " + req.originalUrl || "Internal server error";
  res.status(statusCode).json({ message });
};
