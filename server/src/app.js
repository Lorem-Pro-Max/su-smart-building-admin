import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import doorRoutes from "./routes/doorRoutes.js";
import valveRoutes from "./routes/valveRoutes.js";
import acRoutes from "./routes/acRoutes.js";
import exhaustFanRoutes from "./routes/exhaustFanRoutes.js";
import lightRoutes from "./routes/lightRoutes.js";
import electricityRoutes from "./routes/electricityRoutes.js";
import airQualityRoutes from "./routes/airQualityRoutes.js";
import scheduleRoute from "./routes/scheduleRoute.js";
import userRoute from "./routes/user.js";
import roomBookingRoutes from "./routes/roomBookingRoutes.js";
import iotQueueRoute from "./routes/IotQueueRoute.js";
import iotLogsRoute from "./routes/iotLogRoutes.js";
import authRoute from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/doors", doorRoutes);
app.use("/api/valves", valveRoutes);
app.use("/api/electricity", electricityRoutes);
app.use("/api/ac", acRoutes);
app.use("/api/lights", lightRoutes);
app.use("/api/exhaustfans", exhaustFanRoutes);
app.use("/api/air-quality", airQualityRoutes);
app.use("/api/schedule", scheduleRoute);
/**
 * เส้นเดิมสมัยที่ฝั่ง booking (user) ยิงเข้ามาตั้งคิวเปิดห้องเองตอนกดเช็คอิน
 * ตอนนี้ไม่มีผู้เรียกแล้ว เพราะย้ายไปตั้งคิวใน process ตอน admin กด approve
 * (bookingScheduleService.createBookingOpenSchedules) — คงไว้เป็น API สำรอง ยังไม่ลบ
 */
app.use("/api/iot-queue", iotQueueRoute);
app.use("/api", roomBookingRoutes);
app.use("/api", userRoute);
app.use("/api/logs", iotLogsRoute);
app.use("/api/auth", authRoute);
app.use("/api/classroom-rooms", roomRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: "Route not found" });
});

export default app;
