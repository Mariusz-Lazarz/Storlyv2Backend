import { Pool, PoolClient } from "pg";
import bcrypt from "bcrypt";
import { UserCredentials, LoginCredentials } from "../utils/definitions.js";
import CustomError from "../utils/customError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

class User {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  private async dbOperation(
    fn: (client: PoolClient) => Promise<any>
  ): Promise<any> {
    const client = await this.pool.connect();
    try {
      return await fn(client);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  private signToken(id: string, email: string): string {
    const token = jwt.sign({ id, email }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_COOKIE_EXPIRES_IN,
    });
    return token;
  }

  public async register(credentials: UserCredentials): Promise<any> {
    return this.dbOperation(async (client) => {
      const query =
        "INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *;";
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(
        credentials.password,
        saltRounds
      );
      const values = [credentials.name, credentials.email, hashedPassword];
      const result = await client.query(query, values);
      return result.rows[0];
    });
  }

  public async login(
    credentials: LoginCredentials
  ): Promise<{ token: string; user: { name: string; email: string } }> {
    return this.dbOperation(async (client) => {
      const query =
        "SELECT id, name, email, password FROM users WHERE email = $1;";
      const values = [credentials.email];
      const result = await client.query(query, values);

      if (
        result.rows.length === 0 ||
        !(await bcrypt.compare(credentials.password, result.rows[0].password))
      ) {
        throw new CustomError("Invalid credentials", 401);
      }

      const user = result.rows[0];
      const token = this.signToken(user.id, user.email);

      return {
        token: token,
        user: {
          name: user.name,
          email: user.email,
        },
      };
    });
  }
}

export default User;
