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
