/**
 * [LEGACY - ไม่มีผู้เรียกแล้ว]
 * ใช้ตอนที่ระบบจองฝั่ง user เป็นคนสั่งเปิดห้องเอง (กดเช็คอิน -> ยิง /add-queue + /set-active-room)
 * ตอนนี้ห้องเปิดอัตโนมัติตามเวลาจอง คิวถูกตั้งจากฝั่ง admin เองใน bookingScheduleService.js
 * เก็บไฟล์ไว้เผื่อมี service ภายนอกต้องสั่งคิวโดยตรง ถ้าแน่ใจว่าไม่ใช้แล้วค่อยลบทั้งไฟล์
 */
import express from "express";
import { protectAction } from "../middlewares/auth.js";
import * as IotQueueController from "../controllers/iotQueueController.js";

const router = express.Router();

router.post("/add-queue", protectAction, IotQueueController.AddIotQueue);
router.post(
  "/set-active-room",
  protectAction,
  IotQueueController.SetActiveRoom,
);

export default router;
