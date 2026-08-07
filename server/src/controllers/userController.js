import { userService } from "../services/userService.js";
import { replaceAllowedRooms } from "../services/roomAccessService.js";
import bcrypt from "bcryptjs";

const normalizeRoomIds = (roomIds) => {
  if (!Array.isArray(roomIds)) return null;
  return roomIds.map(Number).filter((id) => Number.isInteger(id) && id > 0);
};

export const createUser = async (req, res) => {
  try {
    const { password, allowedRoomIds, ...userData } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userService.createUser({
      ...userData,
      password: hashedPassword,
    });

    const rooms = normalizeRoomIds(allowedRoomIds);
    if (rooms) await replaceAllowedRooms(user.id, rooms);

    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "create user failed",
    });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const user = await userService.deleteUser(id);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.json({
    success: true,
    message: "User deleted successfully",
    data: user,
  });
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { allowedRoomIds, ...userData } = req.body;

    const result = await userService.updateUser(Number(id), userData);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const rooms = normalizeRoomIds(allowedRoomIds);
    if (rooms) await replaceAllowedRooms(Number(id), rooms);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "update failed",
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};
