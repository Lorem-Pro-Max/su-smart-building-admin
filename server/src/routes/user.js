import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.post("/users", async (req, res) => {
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

router.patch("/users/:id", async (req, res) => {
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

router.get("/users", async (req, res) => {
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

export default router;
