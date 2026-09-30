import express from "express";
import * as userController from "../controllers/userController.js";
import { protectAction } from "../middlewares/auth.js";

const router = express.Router();

router.post("/users", protectAction, async (req, res) => {
  try {
    await userController.createUser(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message || "Unknown server error",
    });
  }
});

router.patch("/users/:id", protectAction, async (req, res) => {
  try {
    await userController.updateUser(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message || "Unknown server error",
    });
  }
});

router.get("/users", protectAction, async (req, res) => {
  try {
    await userController.getUsers(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error.message || "Unknown server error",
    });
  }
});

router.delete("/users/:id", userController.deleteUser);

export default router;
