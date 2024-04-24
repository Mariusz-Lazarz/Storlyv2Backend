import { ErrorRequestHandler } from "express";
import dotenv from "dotenv";
dotenv.config();

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? "Internal Server Error" : err.message;

  if (process.env.NODE_ENV === "development") {
    res.status(statusCode).json({
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else if (process.env.NODE_ENV === 'production') {
    res.status(statusCode).json({ message });
  }
};

export default errorHandler;
