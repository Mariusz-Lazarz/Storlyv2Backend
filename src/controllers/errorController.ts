import { ErrorRequestHandler, Response } from "express";
import CustomError from "../utils/customError.js";
import { PgError } from "../utils/definitions.js";
import dotenv from "dotenv";
dotenv.config();

const isOperationalError = (code: string): boolean => {
  const operationalCodes: Set<string> = new Set([
    "23505", // unique_violation
    "23503", // foreign_key_violation
    "23502", // not_null_violation
  ]);

  return operationalCodes.has(code);
};

const handlePgError = (err: PgError): CustomError => {
  if (err.code === "23505") {
    const fieldName = err.constraint.split("_")[1];
    return new CustomError(
      `Duplicated value of ${fieldName}. Please use a different ${fieldName}.`,
      409
    );
  }
  return new CustomError("Database error occurred", 500);
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (!("statusCode" in err) || err.statusCode === 500) {
    err.statusCode = 500;
  }

  if (err.code && isOperationalError(err.code)) {
    const customError = handlePgError(err);
    err.message = customError.message;
    err.statusCode = customError.statusCode;
  } else if (err.statusCode === 500) {
    err.message = "Something went wrong!";
  }

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      message: err.message,
      error: err,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).json({ message: err.message });
  }
};

export default errorHandler;
