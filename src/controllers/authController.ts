import { RequestHandler } from "express";
import User from "../models/userModel.js";
import pool from "../utils/database.js";
import CustomError from "../utils/customError.js";
import dotenv from "dotenv";
dotenv.config();

const userModel = new User(pool);

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
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
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
    const { token, user } = await userModel.login({ email, password });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: Number(process.env.JWT_COOKIE_MAXAGE!),
      sameSite: "strict",
    });
    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    next(error);
  }
};
