import { userService } from "../services/userService.js";

export const createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

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

    const result = await userService.updateUser(Number(id), req.body);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

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
