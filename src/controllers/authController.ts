import { RequestHandler } from "express";
import User from "../models/userModel.js";
import pool from "../utils/database.js";

const userModel = new User(pool);

export const registerUser: RequestHandler = async (req, res, next): Promise<any> => {
  try {
    // 1. Get info about user from request.
    const { name, email, password } = req.body;
    // 2. Check if all data is being set
    if (!name || !email || !password) {
      throw new Error(`Please provide all credentials...`);
    }
    // 3. Save to Postgre
    const data = await userModel.insert(name, email, password);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

