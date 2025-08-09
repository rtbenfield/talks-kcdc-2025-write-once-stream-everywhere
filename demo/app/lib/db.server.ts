import postgres from "postgres";

// Connect to the PostgreSQL database
export const sql = postgres({
  host: "localhost",
  port: 5432,
  database: "database",
  username: "user",
  password: "password",
});
