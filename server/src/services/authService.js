import pool from "../config/db.js";

export const findUserByUsername = async (username) => {
  try {
    const query = `
        SELECT *
        FROM "user"
        WHERE username = $1
      `;
    const values = [username];

    const { rows } = await pool.query(query, values);

    if (!rows.length) return null;

    return rows[0];
  } catch (err) {
    console.error("DB query error:", err);
    throw err;
  }
};

export const saveRefreshToken = async (userId, token, expiresAt) => {
  const query = `
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
  `;

  const values = [userId, token, expiresAt];

  await pool.query(query, values);
};

export const deleteRefreshToken = async (token) => {
  const query = `
      DELETE FROM refresh_tokens
      WHERE token = $1
    `;

  const values = [token];

  await pool.query(query, values);
};
