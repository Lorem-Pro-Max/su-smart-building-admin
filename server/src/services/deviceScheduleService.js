import { Queue, Worker } from "bullmq"
import redisConnection from "../config/redis"

export const iotQueue = new Queue("iot-scheduling", {
    connection: redisConnection
})

const iotWorker = new Worker(
    "iot-scheduling",
    async (job) => {
        const { deviceId, action, bookingId } = job.data
        console.log(`[IoT Queue] ID: ${bookingId} > Processing ${action} for device ${deviceId}`);

        //Execution area
    }
)

export const addIotJob = async (deviceId, action, delay, bookingId) => {
  await iotQueue.add(
    "toggle-device",
    { deviceId, action, bookingId },
    {
      delay,
      jobId: `${action}-${bookingId}-${deviceId}`
    },
  );
};

