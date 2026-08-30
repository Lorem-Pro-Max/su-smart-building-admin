import pool from "../config/db.js";
import { logSystemEvent } from "./dbService.js";
import {
  cancelBookingSchedules,
  createBookingOpenSchedules,
} from "./bookingScheduleService.js";

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

  /* INSERT อย่างเดียว ไม่แตะ IoT — ให้ bulk เรียกซ้ำได้โดยไม่ต้องรอตั้ง schedule ทีละใบ */
  async insertApprovedBookingRow(data) {
    const query = `
      INSERT INTO room_booking (
        meeting_name,
        room_id,
        requester_id,
        phone,
        booking_date,
        "start_dateTime",
        "end_dateTime",
        status_id,
        booking_type_id,
        purpose,
        created_at,
        action_by,
        action_date
      )
      SELECT
        $1, $2, $3, $4, $5, $6, $7, 2, $8, $9, NOW(), $10, NOW()
      WHERE NOT EXISTS (
        SELECT 1
        FROM room_booking
        WHERE room_id = $2
          AND status_id IN (2, 5)
          AND "start_dateTime" < $7
          AND "end_dateTime"   > $6
      )
      RETURNING *
    `;

    const { rows } = await pool.query(query, [
      data.meetingName,
      data.roomId,
      data.requesterId,
      data.phone ?? null,
      data.bookingDate,
      data.startDateTime,
      data.endDateTime,
      data.bookingTypeId,
      data.purpose ?? null,
      data.actionBy,
    ]);

    return rows[0] ?? null;
  }

  /**
   * สร้าง booking จากฝั่ง admin: อนุมัติทันที (status 2) ไม่ต้องผ่านหน้าอนุมัติ
   * INSERT ... SELECT ... WHERE NOT EXISTS ทำให้เช็คเวลาชนกับการเขียนเป็น statement เดียว
   * ยิงพร้อมกันสองใบในช่วงเวลาเดียวกันจึงเข้าได้ใบเดียว
   */
  async createApprovedBooking(data) {
    const row = await this.insertApprovedBookingRow(data);

    if (!row) {
      return null;
    }

    /* ใช้ตัวเดียวกับตอนกด approve: ห่อ try/catch + log ไว้แล้ว
       IoT ล่มจึงไม่ทำให้ booking ที่ commit ไปแล้วพัง */
    await this.syncRoomOpenSchedules(
      Number(row.id),
      STATUS_ID_MAP.approved,
      [],
      data.actionBy,
    );

    return this.mapRow(row);
  }

  /**
   * สร้างหลายใบจากรูปแบบจองต่อเนื่อง — แต่ละใบเป็นอิสระ ไม่ห่อ transaction
   * ใบที่ชนถูกข้าม ใบที่เหลือยังเข้า เพราะ preview ให้ admin อนุมัติรายการไว้แล้ว
   * (ห่อ transaction จะทำให้ใบที่ 7 ชนแล้วล้างใบดี 6 ใบทิ้ง ซึ่งขัดกับตัวฟีเจอร์)
   */
  async createApprovedBookingsBulk({ occurrences, ...shared }) {
    const created = [];
    const skipped = [];

    for (const occurrence of occurrences) {
      let row = null;

      try {
        row = await this.insertApprovedBookingRow({ ...shared, ...occurrence });
      } catch (error) {
        skipped.push({ ...occurrence, reason: "ERROR", message: error.message });
        continue;
      }

      if (!row) {
        skipped.push({ ...occurrence, reason: "CONFLICT" });
      } else {
        created.push(row);
      }
    }

    /* ตั้งคิวเปิดห้องหลัง insert ครบ และยิงขนานกัน
       ถ้าทำในลูป แต่ละใบต้องรอ IoT fan-out เสร็จก่อน INSERT ใบถัดไปจะเริ่ม ซึ่งช้าเกินไป
       syncRoomOpenSchedules ห่อ try/catch + logSystemEvent ไว้แล้ว จึง throw ออกมาไม่ได้ */
    await Promise.allSettled(
      created.map((row) =>
        this.syncRoomOpenSchedules(
          Number(row.id),
          STATUS_ID_MAP.approved,
          [],
          shared.actionBy,
        ),
      ),
    );

    return { created: created.map((row) => this.mapRow(row)), skipped };
  }

  /* booking ในช่วงวันที่ สำหรับเช็คเวลาชนของการจองต่อเนื่อง
     ใช้ SELECT ชุดเดียวกับ getBookingsOnDate เพื่อให้ row shape เหมือนกัน
     client จะได้ป้อนเข้า getConflictingApprovedBookings ได้โดยไม่ต้องมี adapter */
  async getBookingsInRange(from, to, roomId = null) {
    const values = [from, to];
    let roomFilter = "";

    if (roomId != null) {
      values.push(roomId);
      roomFilter = `AND rb.room_id = $${values.length}`;
    }

    const query = `
      SELECT
        rb.*,
        u.firstname,
        u.lastname,
        r.title AS room_title,
        r.floor AS floor,
        b.name  AS building_name,
        bs.status AS booking_status
      FROM room_booking rb
      JOIN "user" u ON rb.requester_id = u.id
      JOIN room  r  ON rb.room_id      = r.id
      LEFT JOIN building       b  ON r.building_id = b.id
      LEFT JOIN booking_status bs ON rb.status_id  = bs.id
      WHERE rb.booking_date BETWEEN $1 AND $2
        AND rb.status_id NOT IN (3, 4)
        ${roomFilter}
      ORDER BY rb."start_dateTime" ASC
    `;

    const { rows } = await pool.query(query, values);

    return rows;
  }

  async getBookingsOnDate(date) {
    const query = `
      SELECT
        rb.*,
        u.firstname,
        u.lastname,
        r.title AS room_title,
        r.floor AS floor,
        b.name  AS building_name,
        bs.status AS booking_status
      FROM room_booking rb
      JOIN "user" u ON rb.requester_id = u.id
      JOIN room  r  ON rb.room_id      = r.id
      LEFT JOIN building       b  ON r.building_id = b.id
      LEFT JOIN booking_status bs ON rb.status_id  = bs.id
      WHERE rb.booking_date = $1
      ORDER BY rb."start_dateTime" ASC
    `;

    const { rows } = await pool.query(query, [date]);

    return rows;
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
      LEFT JOIN room r ON rb.room_id = r.id
      LEFT JOIN booking_status bs ON rb.status_id = bs.id
      LEFT JOIN booking_type bt ON rb.booking_type_id = bt.id
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
      LEFT JOIN room r ON rb.room_id = r.id
      LEFT JOIN booking_status bs ON rb.status_id = bs.id
      LEFT JOIN booking_type bt ON rb.booking_type_id = bt.id
      LEFT JOIN "user" requester ON rb.requester_id = requester.id
      LEFT JOIN "user" action_user ON rb.action_by = action_user.id
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
      LEFT JOIN room r ON rb.room_id = r.id
      LEFT JOIN building b ON r.building_id = b.id
      LEFT JOIN booking_status bs ON rb.status_id = bs.id
      LEFT JOIN booking_type bt ON rb.booking_type_id = bt.id
      LEFT JOIN "user" u ON rb.requester_id = u.id
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
      LEFT JOIN room r ON rb.room_id = r.id
      LEFT JOIN building b ON r.building_id = b.id
      LEFT JOIN booking_status bs ON rb.status_id = bs.id
      LEFT JOIN booking_type bt ON rb.booking_type_id = bt.id
      LEFT JOIN "user" u ON rb.requester_id = u.id
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

      // Cancel booking ที่ชนทั้งหมด
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

      await this.syncRoomOpenSchedules(
        Number(id),
        statusId,
        normalizedCancelIds,
        actionBy,
      );

      return this.mapRow(rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");

      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * booking ที่อนุมัติแล้วจะเปิดห้องเองตามเวลาที่จอง
   * ถ้าโดนปฏิเสธ/ยกเลิกก็ต้องถอน job ที่ตั้งไว้ออกจากคิว
   * ไม่ให้ throw ออกไป เพราะ booking ถูก commit ไปแล้วและกู้เองได้ตอน cold start
   */
  async syncRoomOpenSchedules(bookingId, statusId, canceledIds, actionBy) {
    const canceledBookingIds = [...canceledIds];

    if (statusId === STATUS_ID_MAP.approved) {
      try {
        await createBookingOpenSchedules(bookingId, actionBy);
      } catch (error) {
        logSystemEvent(
          "schedule",
          "error",
          "BOOKING_SCHEDULE_CREATE_FAIL",
          `Failed to create open schedule for booking ${bookingId}: ${error.message}`,
          { bookingId },
        );
        console.error(
          `[Booking Schedule] Failed to create open schedule for ${bookingId}: ${error.message}`,
        );
      }
    } else if (
      statusId === STATUS_ID_MAP.rejectedByAdmin ||
      statusId === STATUS_ID_MAP.canceledByAdmin ||
      statusId === STATUS_ID_MAP.canceledByUser
    ) {
      canceledBookingIds.push(bookingId);
    }

    for (const canceledId of canceledBookingIds) {
      try {
        await cancelBookingSchedules(canceledId);
      } catch (error) {
        logSystemEvent(
          "schedule",
          "error",
          "BOOKING_SCHEDULE_CANCEL_FAIL",
          `Failed to cancel schedule for booking ${canceledId}: ${error.message}`,
          { bookingId: canceledId },
        );
        console.error(
          `[Booking Schedule] Failed to cancel schedule for ${canceledId}: ${error.message}`,
        );
      }
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

    /* iot_schedule ผูก FK แบบ CASCADE พอลบ booking แถว schedule จะหายไปด้วย
       ทำให้หา device/schedule id มาถอน job ใน Redis ทีหลังไม่ได้ จึงต้องถอนก่อนลบ */
    for (const bookingId of bookingIds) {
      try {
        await cancelBookingSchedules(bookingId);
      } catch (error) {
        logSystemEvent(
          "schedule",
          "error",
          "BOOKING_SCHEDULE_CANCEL_FAIL",
          `Failed to cancel schedule before deleting booking ${bookingId}: ${error.message}`,
          { bookingId },
        );
      }
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
