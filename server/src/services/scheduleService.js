import { supabase } from "../config/superbase.js";

export const getAll = async () => {
  const { data, error } = await supabase.from("iot_schedule").select(`
      id,
      booking_id,
      action,
      action_time,

      action_user:user (
        id,
        firstname,
        lastname
      ),

      room_booking (
        id,
        meeting_name,
        start_dateTime,
        end_dateTime,
        room (
          id,
          title,
          floor
        )
      ),

      room_device (
        id,
        device_id,
        device_type (
          id,
          type,
          key
        )
      )
    `);

  if (error) throw error;
  if (!data?.length) return [];

  const grouped = {};

  for (const item of data) {
    const bookingId = item.booking_id;

    if (!grouped[bookingId]) {
      grouped[bookingId] = {
        booking_id: bookingId,
        meeting_name: item.room_booking?.meeting_name,
        start_dateTime: item.room_booking?.start_dateTime,
        end_dateTime: item.room_booking?.end_dateTime,
        room: {
          id: item.room_booking?.room?.id,
          title: item.room_booking?.room?.title,
          floor: item.room_booking?.room?.floor,
        },
        schedules: [],
      };
    }

    grouped[bookingId].schedules.push({
      id: item.id,
      booking_id: bookingId,
      action: item.action,
      action_time: item.action_time,

      action_by: {
        id: item.action_user?.id,
        firstname: item.action_user?.firstname,
        lastname: item.action_user?.lastname,
        full_name:
          `${item.action_user?.firstname || ""} ${item.action_user?.lastname || ""}`.trim(),
      },

      device: {
        id: item.room_device?.id,
        device_code: item.room_device?.device_id,
        type: item.room_device?.device_type?.type,
        type_key: item.room_device?.device_type?.key,
      },
    });
  }

  return Object.values(grouped);
};

export const createSchedules = async ({
  booking_id,
  device_ids,
  action,
  action_time,
  action_by,
}) => {
  const rows = device_ids.map((device_id) => ({
    booking_id,
    device_id,
    action,
    action_time,
    action_by,
    record_status: "pending",
  }));

  const { data, error } = await supabase
    .from("iot_schedule")
    .insert(rows)
    .select();

  if (error) throw error;

  return data;
};

export const deleteScheduleById = async (bookingId) => {
  const { error } = await supabase
    .from("iot_schedule")
    .delete()
    .eq("booking_id", bookingId);

  if (error) throw error;

  return true;
};

export const getRooms = async () => {
  const { data, error } = await supabase
    .from("room")
    .select(
      `
      id,
      title,
      floor,
      is_bookable,
      building (
        id,
        name
      )
    `,
    )
    .order("floor", { ascending: true });

  if (error) throw error;

  const grouped = {};

  for (const room of data) {
    if (!grouped[room.floor]) {
      grouped[room.floor] = [];
    }
    grouped[room.floor].push(room);
  }

  return grouped;
};

export const getRoomById = async (roomId) => {
  const { data, error } = await supabase
    .from("room_device")
    .select(
      `
      id,
      device_id,
      room_id,
      device_type (
        id,
        type,
        key
      ),
      room (
        id,
        title,
        floor,
        building_id,
        is_bookable
      )
    `,
    )
    .eq("room_id", roomId);

  if (error) throw error;

  return data;
};

export const getAllRoomByBooking = async () => {
  const { data: bookings, error } = await supabase.from("room_booking").select(`
    id,
    meeting_name,
    start_dateTime,
    end_dateTime,
    status_id,
    room (
      id,
      title,
      floor,
      building (
        id,
        name
      )
    )
  `);
  // .eq("status_id", 2);

  if (error) throw error;
  if (!bookings?.length) return {};

  const { data: devices, error: deviceError } = await supabase.from(
    "room_device",
  ).select(`
      id,
      device_id,
      room_id,
      device_type (
        id,
        type,
        key
      )
    `);

  if (deviceError) throw deviceError;

  const grouped = {};

  for (const booking of bookings) {
    const floor = booking.room?.floor || 0;

    if (!grouped[floor]) {
      grouped[floor] = [];
    }

    const roomDevices = devices
      .filter((d) => d.room_id === booking.room?.id)
      .map((device) => ({
        id: device.id,
        device_code: device.device_id,
        type: device.device_type?.type,
        type_key: device.device_type?.key,
      }));

    grouped[floor].push({
      booking_id: booking.id,
      meeting_name: booking.meeting_name,
      start_dateTime: booking.start_dateTime,
      end_dateTime: booking.end_dateTime,
      room: booking.room,
      devices: roomDevices,
    });
  }

  return grouped;
};
