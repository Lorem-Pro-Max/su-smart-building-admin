import pool from "../config/db.js";

const STATUS_MAP = {
  1: "pending",
  2: "approved",
  3: "rejectedByAdmin",
  4: "canceledByAdmin",
  5: "checked-in",
  6: "completed",
  7: "canceledByUser",
};

const STATUS_ID_MAP = {
  pending: 1,
  approved: 2,
  rejectedByAdmin: 3,
  canceledByAdmin: 4,
  "checked-in": 5,
  completed: 6,
  canceledByUser: 7,
};

class BookingService {
  async createBooking(data) {
    const query = `
      INSERT INTO room_booking (
        requester_id,
        room_id,
        "start_dateTime",
        "end_dateTime",
        meeting_name,
        floor,
        created_at,
        action_by,
        reason,
        phone,
        status_id
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,NOW(),$7,$8,$9,$10
      )
      RETURNING *
    `;

    const values = [
      data.userId,
      data.resourceId,
      data.startTime,
      data.endTime,
      data.meetingName,
      data.floor,
      data.actionBy,
      data.reason ?? null,
      data.phone,
      data.statusId ?? 1,
    ];

    const { rows } = await pool.query(query, values);

    if (!rows.length) {
      return null;
    }

    return this.mapRow(rows[0]);
  }

  async getBooking(id) {
    const query = `
      SELECT
        rb.*,
        r.title,
        r.floor,
        u.firstname,
        u.lastname
      FROM room_booking rb
      LEFT JOIN room r
        ON rb.room_id = r.id
      LEFT JOIN "user" u
        ON rb.requester_id = u.id
      WHERE rb.id = $1
    `;

    const { rows } = await pool.query(query, [id]);

    if (!rows.length) {
      return undefined;
    }

    return this.mapRow(rows[0]);
  }

  async getAllBookings({
    page = 1,
    limit = 10,
    bookingTypes = [],
    floors = [],
    statuses = [],
  } = {}) {
    const conditions = [`rb.created_at >= NOW() - INTERVAL '6 months'`];

    const values = [];

    if (bookingTypes.length > 0) {
      values.push(bookingTypes);

      conditions.push(`rb.booking_type_id = ANY($${values.length}::bigint[])`);
    }

    if (floors.length > 0) {
      values.push(floors);

      conditions.push(`r.floor = ANY($${values.length}::integer[])`);
    }

    if (statuses.length > 0) {
      values.push(statuses);

      conditions.push(`bs.status = ANY($${values.length}::text[])`);
    }

    const whereClause = conditions.join(" AND ");

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM room_booking rb

      LEFT JOIN room r
        ON rb.room_id = r.id

      LEFT JOIN booking_status bs
        ON rb.status_id = bs.id

      LEFT JOIN booking_type bt
        ON rb.booking_type_id = bt.id

      WHERE ${whereClause}
    `;

    const offset = (page - 1) * limit;

    const dataValues = [...values, limit, offset];

    const limitIndex = dataValues.length - 1;
    const offsetIndex = dataValues.length;

    const dataQuery = `
      SELECT
        rb.*,

        r.title,
        r.floor,

        bs.status AS status_name,

        bt.name AS booking_type,

        requester.firstname AS requester_firstname,
        requester.lastname AS requester_lastname,

        action_user.firstname AS action_firstname,
        action_user.lastname AS action_lastname

      FROM room_booking rb

      LEFT JOIN room r
        ON rb.room_id = r.id

      LEFT JOIN booking_status bs
        ON rb.status_id = bs.id

      LEFT JOIN booking_type bt
        ON rb.booking_type_id = bt.id

      LEFT JOIN "user" requester
        ON rb.requester_id = requester.id

      LEFT JOIN "user" action_user
        ON rb.action_by = action_user.id

      WHERE ${whereClause}

      ORDER BY rb.created_at DESC

      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataValues),
      pool.query(countQuery, values),
    ]);

    const data = dataResult.rows.map((row) => ({
      id: row.id,

      requesterId: row.requester_id,

      roomId: row.room_id,

      startTime: row.start_dateTime,

      endTime: row.end_dateTime,

      statusId: row.status_id,

      status: row.status_name,

      meetingName: row.meeting_name,

      phone: row.phone,

      createdAt: row.created_at,

      actionDate: row.action_date,

      approvalReason: row.approval_reason,

      bookingType: row.booking_type,

      bookingDate: row.booking_date,

      isNotified: row.is_notified,

      title: row.title,

      floor: row.floor,

      bookingBy:
        `${row.requester_firstname ?? ""} ${row.requester_lastname ?? ""}`.trim(),

      actionBy:
        `${row.action_firstname ?? ""} ${row.action_lastname ?? ""}`.trim(),
    }));

    return {
      data,
      total: countResult.rows[0]?.total ?? 0,
      page,
      limit,
    };
  }

  async getBookingWithDuplicate(bookingId) {
    const bookingQuery = `
      SELECT
        rb.*,

        r.title,
        r.floor,

        b.name AS building_name,

        bs.status AS status_name,

        bt.name AS booking_type,

        u.firstname,
        u.lastname

      FROM room_booking rb

      LEFT JOIN room r
        ON rb.room_id = r.id

      LEFT JOIN building b
        ON r.building_id = b.id

      LEFT JOIN booking_status bs
        ON rb.status_id = bs.id

      LEFT JOIN booking_type bt
        ON rb.booking_type_id = bt.id

      LEFT JOIN "user" u
        ON rb.requester_id = u.id

      WHERE rb.id = $1
    `;

    const { rows: bookingRows } = await pool.query(bookingQuery, [bookingId]);

    if (!bookingRows.length) {
      return null;
    }

    const bookingRow = bookingRows[0];

    const duplicateQuery = `
      SELECT
        rb.*,

        r.title,
        r.floor,

        b.name AS building_name,

        bs.status AS status_name,

        bt.name AS booking_type,

        u.firstname,
        u.lastname

      FROM room_booking rb

      LEFT JOIN room r
        ON rb.room_id = r.id

      LEFT JOIN building b
        ON r.building_id = b.id

      LEFT JOIN booking_status bs
        ON rb.status_id = bs.id

      LEFT JOIN booking_type bt
        ON rb.booking_type_id = bt.id

      LEFT JOIN "user" u
        ON rb.requester_id = u.id

      WHERE rb.room_id = $1

        AND rb.status_id = 2

        AND rb.id != $2

        AND rb."start_dateTime" < $3

        AND rb."end_dateTime" > $4

      ORDER BY rb."start_dateTime" ASC
    `;

    const { rows: duplicateRows } = await pool.query(duplicateQuery, [
      bookingRow.room_id,
      bookingRow.id,
      bookingRow.end_dateTime,
      bookingRow.start_dateTime,
    ]);

    const map = (row) => ({
      id: row.id,

      meetingName: row.meeting_name,

      roomId: row.room_id,

      title: row.title,

      floor: row.floor,

      buildingName: row.building_name,

      startTime: row.start_dateTime,

      endTime: row.end_dateTime,

      statusId: row.status_id,

      status: row.status_name,

      bookingTypeId: row.booking_type_id,

      bookingType: row.booking_type,

      purpose: row.purpose,

      phone: row.phone,

      bookingBy: `${row.firstname ?? ""} ${row.lastname ?? ""}`.trim(),

      createdAt: row.created_at,

      bookingDate: row.booking_date,
    });

    return {
      duplicate: duplicateRows.length > 0,

      booking: map(bookingRow),

      // สำคัญ: เป็น Array เสมอ
      conflicts: duplicateRows.map(map),
    };
  }

  async updateStatus(id, status, reason, cancelIds = [], actionBy) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const statusId = STATUS_ID_MAP[status];

      if (!statusId) {
        throw new Error("Invalid booking status");
      }

      if (!actionBy) {
        throw new Error("Action user is required");
      }

      /*
       * ป้องกัน duplicate id
       * และไม่ให้ id ที่กำลัง approve
       * ถูกใส่อยู่ใน cancelIds
       */
      const normalizedCancelIds = Array.from(
        new Set(
          (Array.isArray(cancelIds) ? cancelIds : [])
            .map(Number)
            .filter(Number.isFinite)
            .filter((cancelId) => cancelId !== Number(id)),
        ),
      );

      // Update booking หลัก
      const { rows } = await client.query(
        `
            UPDATE room_booking
            SET status_id = $1,
                action_by = $2,
                action_date = NOW(),
                approval_reason = $3
            WHERE id = $4
            RETURNING *
          `,
        [statusId, actionBy, reason || null, id],
      );

      if (!rows.length) {
        await client.query("ROLLBACK");

        return undefined;
      }

      /*
       * Cancel booking ที่ชนทั้งหมด
       */
      if (normalizedCancelIds.length > 0) {
        await client.query(
          `
            UPDATE room_booking
            SET status_id = 4,
                action_by = $1,
                action_date = NOW()
            WHERE id = ANY($2::bigint[])
          `,
          [actionBy, normalizedCancelIds],
        );
      }

      await client.query("COMMIT");

      return this.mapRow(rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");

      throw error;
    } finally {
      client.release();
    }
  }

  async deleteBookings(ids = []) {
    const bookingIds = [
      ...new Set(
        ids.map(Number).filter((id) => Number.isInteger(id) && id > 0),
      ),
    ];

    if (bookingIds.length === 0) {
      throw new Error("Invalid booking ids");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const { rows } = await client.query(
        `
          DELETE FROM room_booking
          WHERE id = ANY($1::bigint[])
          RETURNING id
        `,
        [bookingIds],
      );

      await client.query("COMMIT");

      return {
        deletedCount: rows.length,
        deletedIds: rows.map((row) => row.id),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getApproveBookingFilters() {
    const floorQuery = `
      SELECT DISTINCT
        r.floor

      FROM room r

      WHERE r.floor IS NOT NULL

      ORDER BY r.floor ASC
    `;

    const bookingTypeQuery = `
      SELECT
        bt.*

      FROM booking_type bt

      ORDER BY bt.id ASC
    `;

    const bookingStatusQuery = `
      SELECT
        bs.*

      FROM booking_status bs

      ORDER BY bs.id ASC
    `;

    const [floorResult, bookingTypeResult, bookingStatusResult] =
      await Promise.all([
        pool.query(floorQuery),
        pool.query(bookingTypeQuery),
        pool.query(bookingStatusQuery),
      ]);

    return {
      floors: floorResult.rows.map((row) => row.floor),

      bookingTypes: bookingTypeResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
      })),

      bookingStatuses: bookingStatusResult.rows.map((row) => ({
        id: row.id,
        status: row.status,
      })),
    };
  }

  mapRow(row) {
    const bookingBy = `${row.firstname ?? ""} ${row.lastname ?? ""}`.trim();

    return {
      id: row.id,

      userId: row.requester_id,

      resourceId: row.room_id,

      startTime: row.start_dateTime,

      endTime: row.end_dateTime,

      status: STATUS_MAP[row.status_id] || "pending",

      meetingName: row.meeting_name,

      floor: row.floor,

      createdAt: row.created_at,

      actionBy: row.action_by,

      reason: row.reason,

      approvalReason: row.approval_reason,

      phone: row.phone,

      statusId: row.status_id,

      title: row.title,

      bookingBy,

      bookingDate: row.booking_date,
    };
  }
}

export const bookingService = new BookingService();
