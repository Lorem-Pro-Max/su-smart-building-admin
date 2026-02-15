import express from "express";
import cors from "cors";

import doorRoutes from "./routes/doorRoutes.js";
import valveRoutes from "./routes/valveRoutes.js";
import acRoutes from "./routes/acRoutes.js";
import exhaustFanRoutes from "./routes/exhaustFanRoutes.js";
import lightRoutes from "./routes/lightRoutes.js";
import electricityRoutes from "./routes/electricityRoutes.js";
import airQualityRoutes from "./routes/airQualityRoutes.js";

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:7185");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());

app.use("/api/doors", doorRoutes);
app.use("/api/valves", valveRoutes);
app.use("/api/electricity", electricityRoutes);
app.use("/api/ac", acRoutes);
app.use("/api/lights", lightRoutes);
app.use("/api/exhaustfans", exhaustFanRoutes);
app.use("/api/air-quality", airQualityRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default app;
