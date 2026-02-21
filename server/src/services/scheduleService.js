import { supabase } from "../config/superbase.js";
import { addIotJob } from "../services/deviceQueueService.js";

export const getAll = async () => {
  const { data, error } = await supabase.from("iot_schedule").select(`
      id,
      action,
      action_time,

      action_user:user (
        id,
        firstname,
        lastname
      ),
room_device (
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
    floor
  )
)
    `);

  if (error) throw error;
  if (!data?.length) return [];

  const grouped = {};

  for (const item of data) {
    const bookingId = item.booking_id;

    if (!grouped[item.room_device.room_id]) {
      grouped[item.room_device.room_id] = {
        booking_id: bookingId,
        meeting_name: item.room_device?.room?.title,
        start_dateTime: item.room_booking?.start_dateTime,
        end_dateTime: item.room_booking?.end_dateTime,
        room: {
          id: item.room_device?.room?.id,
          title: item.room_device?.room?.title,
          floor: item.room_device?.room?.floor,
        },
        schedules: [],
      };
    }

    grouped[item.room_device.room_id].schedules.push({
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
  device_ids,
  action,
  action_time,
  action_by,
}) => {
  const rows = device_ids.map((device_id) => ({
    booking_id: null,
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

  await Promise.all(
    data.map((item) =>
      addIotJob(
        item.device_id,
        item.action,
        item.action_time,
        item.booking_id ?? null,
        item.id,
      ),
    ),
  );
  if (error) throw error;

  return data;
};

export const deleteScheduleById = async (idList) => {
  const { data: schedules, error: fetchError } = await supabase
    .from("iot_schedule")
    .select("id, device_id, action, booking_id")
    .in("id", idList);

  if (fetchError) throw fetchError;

  if (!schedules?.length) return true;
  const { error: deleteError } = await supabase
    .from("iot_schedule")
    .delete()
    .in("id", idList);

  if (error) throw error;

  if (deleteError) throw deleteError;

  await Promise.all(
    schedules.map((item) =>
      removeIotJob(
        item.device_id,
        item.action,
        item.booking_id ?? "manual",
        item.id,
      ),
    ),
  );

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
  const { data: rooms, error } = await supabase.from("room").select(`
    id,
    title,
    floor,
    building (
      id,
      name
    )
  `);

  if (error) throw error;
  if (!rooms?.length) return {};

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

  for (const room of rooms) {
    const floor = room.floor ?? 0;

    if (!grouped[floor]) grouped[floor] = [];

    const roomDevices = devices
      ?.filter((d) => d.room_id === room.id)
      .map((device) => ({
        id: device.id,
        device_code: device.device_id,
        type: device.device_type?.type,
        type_key: device.device_type?.key,
      }));

    grouped[floor].push({
      ...room,
      devices: roomDevices || [],
    });
  }

  return grouped;
};
