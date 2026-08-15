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
        updated_at,
        action_by,
        reason,
        phone,
        status_id
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,NOW(),NOW(),$7,$8,$9,$10
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
    if (!rows.length) return null;

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
      LEFT JOIN room r ON rb.room_id = r.id
      LEFT JOIN "user" u ON rb.requester_id = u.id
      WHERE rb.id = $1
    `;

    const { rows } = await pool.query(query, [id]);
    if (!rows.length) return undefined;

    return this.mapRow(rows[0]);
  }

  async getAllBookings() {
    const query = `
    SELECT 
      rb.*,
      r.title,
      r.floor,
      bs.status AS status_name,
      bt.name AS booking_type,

      requester.firstname AS requester_firstname,
      requester.lastname  AS requester_lastname,

      action_user.firstname AS action_firstname,
      action_user.lastname  AS action_lastname

    FROM room_booking rb

    LEFT JOIN room r
      ON rb.room_id = r.id

    LEFT JOIN booking_status bs
      ON rb.status_id = bs.id

    LEFT JOIN "booking_type" bt
      ON rb.booking_type_id = bt.id

    LEFT JOIN "user" requester
      ON rb.requester_id = requester.id

    LEFT JOIN "user" action_user
      ON rb.action_by = action_user.id
    WHERE rb.created_at >= NOW() - INTERVAL '6 months'
    ORDER BY rb."created_at" DESC
  `;

    const { rows } = await pool.query(query);

    return rows.map((row) => ({
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
  }

  async getBookingWithDuplicate(bookingId) {
    const bookingQuery = `
    SELECT 
      rb.*,
      r.title,
      r.floor,
      bs.status AS status_name,
      u.firstname,
      u.lastname

    FROM room_booking rb

    LEFT JOIN room r
      ON rb.room_id = r.id

    LEFT JOIN booking_status bs
      ON rb.status_id = bs.id

    LEFT JOIN "user" u
      ON rb.requester_id = u.id

    WHERE rb.id = $1
  `;

    const { rows: bookingRows } = await pool.query(bookingQuery, [bookingId]);
    if (!bookingRows.length) return null;

    const bookingRow = bookingRows[0];

    const duplicateQuery = `
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

    WHERE rb.room_id = $1
      AND rb.status_id = 2
      AND rb.id != $2
      AND rb."start_dateTime" < $3
      AND rb."end_dateTime" > $4
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
      startTime: row.start_dateTime,
      endTime: row.end_dateTime,
      statusId: row.status_id,
      status: row.status_name,
      bookingBy: `${row.firstname ?? ""} ${row.lastname ?? ""}`.trim(),
      createdAt: row.created_at,
    });

    if (!duplicateRows.length) {
      return {
        duplicate: false,
        booking: map(bookingRow),
      };
    }

    return {
      duplicate: true,
      booking: map(bookingRow),
      conflicts: map(duplicateRows[0]),
    };
  }

  async updateStatus(id, status, reason, cancelId, actionBy) {
    const statusId = STATUS_ID_MAP[status];

    const query = `
      UPDATE room_booking
      SET status_id = $1,
          action_by = $2,
          action_date = NOW(),
          reason = $3
      WHERE id = $4
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      statusId,
      actionBy ?? null,
      reason ?? null,
      id,
    ]);

    if (!rows.length) return undefined;

    if (cancelId) {
      await pool.query(
        `
        UPDATE room_booking
        SET status_id = 4,
            action_by = $1,
            action_date = NOW()
        WHERE id = $2
      `,
        [actionBy ?? null, cancelId],
      );
    }

    return this.mapRow(rows[0]);
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

    const [floorResult, bookingTypeResult, bookingStatusResult] = await Promise.all([
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
      updatedAt: row.updated_at,
      actionBy: row.action_by,
      reason: row.reason,
      phone: row.phone,
      statusId: row.status_id,
      title: row.title,
      bookingBy,
      bookingDate: row.booking_date,
    };
  }
}

export const bookingService = new BookingService();
