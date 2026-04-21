// middlewares/errorMiddleware.js

// Handles requests to routes that don't exist
export const notFoundMiddleware = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global Error Handler catches all errors and formats them
export const errorHandler = (err, req, res, next) => {
  // If the status code is still 200, force it to 500 (Server Error)
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Handle Mongoose Bad ObjectId Error
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    err.message = 'Resource not found';
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errorCode: statusCode
  });
};