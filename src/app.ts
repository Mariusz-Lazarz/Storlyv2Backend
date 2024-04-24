import express, { NextFunction, Request, Response } from "express";
import { authRouter } from "./routes/authRouter.js";

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(express.json());

// routes
app.use("/api/v1/", authRouter);

app.use("*", (err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
