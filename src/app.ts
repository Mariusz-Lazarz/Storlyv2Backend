import express, { NextFunction, Request, Response } from "express";
import { authRouter } from "./routes/authRouter.js";
import errorHandler from "./controllers/errorController.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());

// routes
app.use("/api/v1/", authRouter);

app.use("*", errorHandler);

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
