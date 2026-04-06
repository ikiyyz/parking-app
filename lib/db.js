import { Pool } from "pg";

let pool;

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
};

if (process.env.NODE_ENV === "development") {
  if (!global._pgPool) {
    global._pgPool = new Pool(config);
  }
  pool = global._pgPool;
} else {
  pool = new Pool(config);
}

export default pool;