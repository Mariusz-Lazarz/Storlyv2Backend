import { RequestHandler, Response } from "express";
import User from "../models/userModel.js";
import pool from "../utils/database.js";
import CustomError from "../utils/customError.js";
import { UserType } from "../utils/definitions.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const userModel = new User(pool);

const signToken = (id: string): string => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
  });
  return token;
};

const createSendToken = (user: UserType, statusCode: number, res: Response) => {
  const token = signToken(user.id);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: Number(process.env.JWT_COOKIE_MAXAGE!),
    sameSite: "strict",
  });
  user.password = undefined;
  res.status(statusCode).json({
    message: "Success",
    user,
  });
};

export const registerUser: RequestHandler = async (
  req,
  res,
  next
): Promise<any> => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return next(new CustomError("Please provide all credential", 400));
  }
  try {
    const user = await userModel.register({ name, email, password });
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const loginUser: RequestHandler = async (
  req,
  res,
  next
): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new CustomError("Please provide all credentials", 400));
  }
  try {
    const user = await userModel.login({ email, password });
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};
