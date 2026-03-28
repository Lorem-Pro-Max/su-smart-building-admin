import * as roomService from "../services/roomService.js";

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

export const patchRoomTitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (title !== undefined && title !== null && typeof title !== "string") {
      return res.status(400).json({
        success: false,
        message: "title ต้องเป็นข้อความ",
      });
    }

    const row = await roomService.updateRoomTitle(id, title ?? "");

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบห้อง",
      });
    }

    return res.json({
      success: true,
      data: row,
    });
  } catch (err) {
    if (err.message === "รหัสห้องไม่ถูกต้อง") {
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
