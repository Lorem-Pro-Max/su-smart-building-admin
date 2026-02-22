import pool from "../config/db.js";

class UserService {
  async createUser(data) {
    const query = `
    INSERT INTO "user" (
      firstname,
      lastname,
      email,
      password,
      phone,
      role_id,
      status,
      username,
      created_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
    RETURNING *
  `;

    const values = [
      data.firstname,
      data.lastname,
      data.email,
      data.password,
      data.phone,
      data.role_id ?? 2,
      data.status ?? 1,
      data.username,
    ];

    const { rows } = await pool.query(query, values);
    if (!rows.length) return null;

    return this.mapRow(rows[0]);
  }
  async updateUser(id, data) {
    const query = `
    UPDATE "user"
    SET firstname = $1,
        lastname = $2,
        email = $3,
        phone = $4,
        role_id = $5
    WHERE id = $6
    RETURNING *
  `;

    const values = [
      data.firstname,
      data.lastname,
      data.email,
      data.phone,
      data.role_id,
      id,
    ];

    try {
      const { rows } = await pool.query(query, values);
      console.log("Rows:", rows);
      return this.mapRow(rows[0]);
    } catch (err) {
      console.error("DB Error:", err.message);
      console.error("Full Error:", err);
      throw err;
    }
  }

  async getAllUsers() {
    const query = `
    SELECT 
      u.*,
      r.name AS role_name
    FROM "user" u
    LEFT JOIN roles r
      ON u.role_id = r.id
    WHERE u.status = 1
    ORDER BY u.created_at DESC
  `;

    const { rows } = await pool.query(query);

    return rows.map((row) => this.mapRow(row));
  }

  async deleteUser(id) {
    const query = `
    UPDATE "user"
    SET status = 2
    WHERE id = $1
    RETURNING *
  `;

    const { rows } = await pool.query(query, [id]);

    if (!rows.length) return undefined;

    return this.mapRow(rows[0]);
  }

  async getUserById(id) {
    const query = `
      SELECT *
      FROM "user"
      WHERE id = $1
    `;

    const { rows } = await pool.query(query, [id]);
    if (!rows.length) return undefined;

    return this.mapRow(rows[0]);
  }

  mapRow(row) {
    return {
      id: row.id,
      firstname: row.firstname,
      lastname: row.lastname,
      email: row.email,
      roleId: row.role_id,
      role: row.role_name,
      status: row.status,
      createdAt: row.created_at,
      role_name: row.role_name,
      phone: row.phone,
      userName: row.username,
    };
  }
}

export const userService = new UserService();
