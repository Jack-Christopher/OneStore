module.exports = function (err: Error, req: Req, res: Res, next: Next) {
  // Handle MongoDB validation errors with detailed logging
  if ((err as any).name === 'MongoServerError' && (err as any).code === 121) {
    const mongoError = err as any;
    console.error('=== MongoDB Validation Error ===');
    console.error('Error:', mongoError.message);
    console.error('Code:', mongoError.code);
    console.error('Failing Document ID:', mongoError.errInfo?.failingDocumentId);
    console.error('Error Details (JSON):');
    console.error(JSON.stringify(mongoError.errInfo?.details, null, 2));
    console.error('Full errInfo (JSON):');
    console.error(JSON.stringify(mongoError.errInfo, null, 2));
    console.error('Full errorResponse (JSON):');
    console.error(JSON.stringify(mongoError.errorResponse, null, 2));
    console.error('==============================');
  } else {
    // For other errors, log with JSON formatting for nested objects
    console.error('=== Error ===');
    console.error('Message:', err.message);
    if ((err as any).errInfo) {
      console.error('errInfo (JSON):');
      console.error(JSON.stringify((err as any).errInfo, null, 2));
    }
    if ((err as any).errorResponse) {
      console.error('errorResponse (JSON):');
      console.error(JSON.stringify((err as any).errorResponse, null, 2));
    }
    // Log full error object for debugging
    console.error('Full error (JSON):');
    try {
      console.error(JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    } catch (e) {
      console.error('Could not stringify error:', e);
      console.error(err);
    }
    console.error('================');
  }

  const statusCode = (err as any).statusCode || 500;
  const message = (err as any).message + " with request: " + req.method + " " + req.originalUrl || "Internal server error";
  res.status(statusCode).json({ message });
};
