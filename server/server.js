import express from "express";
import axios from "axios";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { io as ioClient } from "socket.io-client";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const IOT_BASE_URL = "http://127.0.0.1:3000/api";
const iotSocket = ioClient("http://127.0.0.1:3000");

const broadcastUpdate = async () => {
  try {
    const doors = await axios.get(`${IOT_BASE_URL}/status/doors`);
    io.emit("door_update", doors.data.data);
    const valves = await axios.get(`${IOT_BASE_URL}/status/valves`);
    io.emit("valve_update", valves.data.data);

    console.log(">> Synced both Doors & Valves");
  } catch (err) {
    console.error("Broadcast failed:", err.message);
  }
};

iotSocket.on("connect", () => console.log("Connected to IoT (3000)"));
iotSocket.on("connect_error", (err) =>
  console.log("IoT Connection Error:", err.message)
);

iotSocket.onAny((eventName) => {
  console.log(`Event '${eventName}' received from IoT`);
  broadcastUpdate();
});

io.on("connection", (socket) => {
  console.log("Frontend connected:", socket.id);
});

app.post("/api/batch-control", async (req, res) => {
  const { deviceIds, action } = req.body;

  if (!deviceIds || !deviceIds.length)
    return res.status(400).json({ error: "No devices" });

  const isDoor = ["lock", "unlock"].includes(action);
  const endpointType = isDoor ? "door" : "valve";

  console.log(`Batch ${action} on ${endpointType}s:`, deviceIds);

  try {
    const results = await Promise.all(
      deviceIds.map((id) =>
        axios
          .post(`${IOT_BASE_URL}/control/${endpointType}/${id}`, { action })
          .then((r) => ({ id, status: "success" }))
          .catch((e) => ({ id, status: "failed", error: e.message }))
      )
    );

    res.json({ message: "Batch complete", results });
    await broadcastUpdate();
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

app.post("/api/control-all", async (req, res) => {
  const { action } = req.body;

  const isDoor = ["lock", "unlock"].includes(action);
  const endpointType = isDoor ? "doors" : "valves";

  try {
    console.log(`Global ${action} on ${endpointType}`);
    await axios.post(`${IOT_BASE_URL}/control/${endpointType}/all`, { action });
    res.json({ success: true });
    await broadcastUpdate();
  } catch (error) {
    res.status(500).json({ error: "Control all failed" });
  }
});

httpServer.listen(4000, () => console.log("Backend running on port 4000"));
