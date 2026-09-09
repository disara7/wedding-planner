import { pool } from "./db.js";

/**
 * Idempotent schema setup. Runs on every server start; CREATE TABLE IF NOT
 * EXISTS makes it a no-op once the tables are there.
 */
export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            CHAR(36)     NOT NULL PRIMARY KEY,
      email         VARCHAR(255) NOT NULL,
      name          VARCHAR(120) NOT NULL DEFAULT '',
      password_hash VARCHAR(255) NULL,
      google_id     VARCHAR(64)  NULL,
      avatar_url    VARCHAR(512) NULL,
      created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      UNIQUE KEY uq_users_email (email),
      UNIQUE KEY uq_users_google (google_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS planning_items (
      id          CHAR(36)              NOT NULL PRIMARY KEY,
      user_id     CHAR(36)              NOT NULL,
      category    VARCHAR(64)           NOT NULL,
      type        ENUM('link','image')  NOT NULL,
      url         TEXT                  NULL,
      title       TEXT                  NULL,
      description TEXT                  NULL,
      image       LONGTEXT              NULL,
      favicon     TEXT                  NULL,
      domain      VARCHAR(255)          NULL,
      note        TEXT                  NULL,
      pinned      TINYINT(1)            NOT NULL DEFAULT 0,
      created_at  DATETIME(3)           NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      CONSTRAINT fk_items_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE,
      KEY idx_items_user_cat (user_id, category),
      KEY idx_items_user_created (user_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log("✓ database schema ready");
}
