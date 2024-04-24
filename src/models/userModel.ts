import { Pool, PoolClient } from "pg";
import bcrypt from "bcrypt";

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

  public async insert(
    name: string,
    email: string,
    password: string
  ): Promise<any> {
    return this.dbOperation(async (client) => {
      const query =
        "INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *;";
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const values = [name, email, hashedPassword];
      const result = await client.query(query, values);
      return result.rows[0];
    });
  }
}

export default User;
