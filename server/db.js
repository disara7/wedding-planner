// import mysql from "mysql2/promise";

// const {
//   DB_HOST = "127.0.0.1",
//   DB_PORT = "3306",
//   DB_NAME = "wedding_planner",
//   DB_USER = "wedding",
//   DB_PASSWORD = "weddingpass",
// } = process.env;

// export const pool = mysql.createPool({
//   host: DB_HOST,
//   port: Number(DB_PORT),
//   database: DB_NAME,
//   user: DB_USER,
//   password: DB_PASSWORD,
//   waitForConnections: true,
//   connectionLimit: 10,
//   charset: "utf8mb4",
// });

// /** Wait for MySQL to accept connections (the container needs a moment on boot). */
// export async function waitForDatabase({ retries = 30, delayMs = 2000 } = {}) {
//   for (let attempt = 1; attempt <= retries; attempt++) {
//     try {
//       const conn = await pool.getConnection();
//       conn.release();
//       return;
//     } catch (err) {
//       if (attempt === retries) throw err;
//       console.log(
//         `⏳ waiting for MySQL at ${DB_HOST}:${DB_PORT} (${attempt}/${retries})…`
//       );
//       await new Promise((r) => setTimeout(r, delayMs));
//     }
//   }
// }


import mysql from "mysql2/promise";

const {
  DB_HOST = "127.0.0.1",
  DB_PORT = "3306",
  DB_NAME = "wedding_planner",
  DB_USER = "wedding",
  DB_PASSWORD = "weddingpass",
} = process.env;

const isTiDB = DB_HOST.includes("tidbcloud.com");

export const pool = mysql.createPool({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,

  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",

  ...(isTiDB
    ? {
        ssl: {
          rejectUnauthorized: true,
        },
      }
    : {}),
});

/** Wait for MySQL/TiDB to accept connections. */
export async function waitForDatabase({
  retries = 30,
  delayMs = 2000,
} = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      conn.release();
      return;
    } catch (err) {
      if (attempt === retries) throw err;

      console.log(
        `⏳ waiting for database at ${DB_HOST}:${DB_PORT} (${attempt}/${retries})…`
      );

      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}