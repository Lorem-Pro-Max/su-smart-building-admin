import pool from "../config/db.js";


export const getAllowedRoomIds = async (userId) => {
  const query = `
    SELECT room_id
    FROM user_allowed_room_access
    WHERE user_id = $1
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows.map((row) => Number(row.room_id));
};

export const replaceAllowedRooms = async (userId, roomIds) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM user_allowed_room_access WHERE user_id = $1`,
      [userId],
    );

    if (roomIds.length > 0) {
      await client.query(
        `INSERT INTO user_allowed_room_access (user_id, room_id)
         SELECT $1, unnest($2::int8[])`,
        [userId, roomIds],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
