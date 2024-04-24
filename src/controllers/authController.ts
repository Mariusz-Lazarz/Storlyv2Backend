import { RequestHandler } from "express";
import User from "../models/userModel.js";
import pool from "../utils/database.js";
import CustomError from "../utils/customError.js";

const userModel = new User(pool);

export const registerUser: RequestHandler = async (
  req,
  res,
  next
): Promise<any> => {
  try {
    // 1. Get info about user from request.
    const { name, email, password } = req.body;
    // 2. Check if all data is being set
    if (!name || !email || !password) {
      return next(new CustomError("Please provide all credential", 400));
    }
    // 3. Save to Postgre
    const user = await userModel.insert(name, email, password);
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
