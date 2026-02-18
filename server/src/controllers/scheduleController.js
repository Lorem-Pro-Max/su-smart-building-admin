import * as scheduleService from "../services/scheduleService.js";

export const getScheduleList = async (req, res) => {
  try {
    const list = await scheduleService.getAll();

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getScheduleBooking = async (req, res) => {
  try {
    const list = await scheduleService.getAllRoomByBooking();

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const createSchedulesController = async (req, res) => {
  try {
    const created = await scheduleService.createSchedules(req.body);

    return res.status(201).json({
      success: true,
      count: created.length,
      data: created,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteScheduleController = async (req, res) => {
  try {
    const { id } = req.params;

    await scheduleService.deleteScheduleById(id);

    return res.json({
      success: true,
      message: "Deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getRoomById = async (req, res) => {
  const { id } = req.params;

  try {
    const list = await scheduleService.getRoomById(id);

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getRoomDevices = async (req, res) => {
  try {
    const list = await scheduleService.getRoomDevices();

    return res.json({
      success: true,
      data: list,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
