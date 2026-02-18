import { supabase } from "../config/superbase.js";

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
  pending: "1",
  approved: "2",
  rejectedByAdmin: "3",
  canceledByAdmin: "4",
  "checked-in": "5",
  completed: "6",
  canceledByUser: "7",
};

class BookingService {
  async createBooking(data) {
    const now = new Date().toISOString();

    const payload = {
      user_id: data.userId,
      resource_id: data.resourceId,
      start_time: data.startTime,
      end_time: data.endTime,
      status: data.status,
      meeting_name: data.meetingName,
      floor: data.floor,
      created_at: now,
      updated_at: now,
      action_by: data.actionBy,
      reason: data.reason,
      phone: data.phone,
      status_id: data.statusId,
    };

    const { data: result, error } = await supabase
      .from("room_booking")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return this.mapRow(result);
  }

  async getBooking(id) {
    const { data, error } = await supabase
      .from("room_booking")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;

    return this.mapRow(data);
  }

  async getAllBookings() {
    const { data, error } = await supabase
      .from("room_booking")
      .select(
        `
        *,
        room:room_booking_room_id_fkey (
          id,
          title,
          floor
        ),
        requester:room_booking_requester_id_fkey (
          id,
          firstname,
          lastname
        )
      `,
      )
      .neq("status_id", 7)
      .order("start_dateTime", { ascending: true });

    if (error) {
      throw error;
    }

    return data.map((row) => this.mapRow(row));
  }

  async getBookingWithDuplicate(bookingId) {
    const { data: bookingRow, error: bookingError } = await supabase
      .from("room_booking")
      .select(
        `
        *,
        room:room_booking_room_id_fkey (
          id,
          title,
          floor
        ),
        requester:room_booking_requester_id_fkey (
          id,
          firstname,
          lastname
        )
      `,
      )
      .eq("id", bookingId)
      .single();

    if (bookingError) {
      throw bookingError;
    }

    if (!bookingRow) return null;

    const { data: duplicateRows, error: duplicateError } = await supabase
      .from("room_booking")
      .select(
        `
        *,
        room:room_booking_room_id_fkey (
          id,
          title,
          floor
        ),
        requester:room_booking_requester_id_fkey (
          id,
          firstname,
          lastname
        )
      `,
      )
      .eq("room_id", bookingRow.room_id)
      .eq("status_id", 2)
      .neq("id", bookingRow.id)
      .lt("start_dateTime", bookingRow.end_dateTime)
      .gt("end_dateTime", bookingRow.start_dateTime);

    if (duplicateError) {
      throw duplicateError;
    }

    if (!duplicateRows || duplicateRows.length === 0) {
      return {
        duplicate: false,
        booking: this.mapRow(bookingRow),
      };
    }

    return {
      duplicate: true,
      booking: this.mapRow(bookingRow),
      conflicts: this.mapRow(duplicateRows[0]),
    };
  }

  async updateStatus(id, status, reason, cancelId) {
    const statusId = STATUS_ID_MAP[status];

    try {
      const { data, error } = await supabase
        .from("room_booking")
        .update({
          status_id: statusId,
          action_date: new Date(),
          reason: reason ?? null,
        })
        .eq("id", Number(id)).select(`
          *,
          room:room_booking_room_id_fkey (
            id,
            title,
            floor
          ),
          requester:room_booking_requester_id_fkey (
            id,
            firstname,
            lastname
          )
        `);

      if (error) throw error;
      if (!data || data.length === 0) return undefined;

      if (cancelId) {
        const { error: cancelError } = await supabase
          .from("room_booking")
          .update({
            status_id: 4,
            action_date: new Date(),
          })
          .eq("id", Number(cancelId));

        if (cancelError) throw cancelError;
      }

      return this.mapRow(data[0]);
    } catch (error) {
      throw error;
    }
  }

  mapRow(row) {
    const bookingBy =
      `${row.requester?.firstname ?? ""} ${row.requester?.lastname ?? ""}`.trim();

    return {
      id: row.id,
      userId: row.user_id,
      resourceId: row.resource_id,
      startTime: row.start_dateTime,
      endTime: row.end_dateTime,
      status: STATUS_MAP[row.status_id] || "pending",
      meetingName: row.meeting_name,
      floor: row.room?.floor,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      actionBy: row.action_by,
      reason: row.reason,
      phone: row.phone,
      statusId: row.status_id,
      title: row.room?.title,
      bookingBy,
      bookingDate: row.booking_date,
    };
  }
}

export const bookingService = new BookingService();
