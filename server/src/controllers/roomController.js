import * as roomService from "../services/roomService.js";
import { initDeviceMapping } from "../services/socketService.js";
import { handleRoomControlAll } from "../utils/controllerWrapper.js";

export const roomControlAll = handleRoomControlAll;

export const getClassroomRoomsByFloor = async (req, res) => {
  try {
    const { building_id: buildingId } = req.query;
    if (
      buildingId !== undefined &&
      buildingId !== "" &&
      Number.isNaN(Number(buildingId))
    ) {
      return res.status(400).json({
        success: false,
        message: "building_id ไม่ถูกต้อง",
      });
    }
    const data = await roomService.getRoomsByFloorForDirectory(buildingId);

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllRoomsForPicker = async (req, res) => {
  try {
    const data = await roomService.getAllRoomsForPicker();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const patchRoomTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, study_seats, exam_seats } = req.body;

    if (title !== undefined && title !== null && typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "title ต้องเป็นข้อความ",
      });
    }

    const fields = {};
    if (title !== undefined) fields.title = title;
    if (study_seats !== undefined) fields.study_seats = study_seats;
    if (exam_seats !== undefined) fields.exam_seats = exam_seats;

    const row = await roomService.updateRoom(id, fields);

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบห้อง",
      });
    }

    await initDeviceMapping();

    return res.json({
      success: true,
      data: row,
    });
  } catch (err) {
    const clientErrors = [
      "รหัสห้องไม่ถูกต้อง",
      "จำนวนที่นั่งไม่ถูกต้อง",
      "ไม่มีข้อมูลที่ต้องการแก้ไข",
    ];
    if (clientErrors.includes(err.message)) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
