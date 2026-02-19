import { Queue, Worker } from "bullmq";
import redisConnection from "../config/redis.js";
import connectionPool from "../config/db.js";

export const iotQueue = new Queue("iot-scheduling", {
  connection: redisConnection,
});

const iotWorker = new Worker(
  "iot-scheduling",
  async (job) => {
    const { deviceId, action, bookingId } = job.data;
    
    try {
      // 1. EXECUTE
      // await executeIotCommand(deviceId, action); 

      // 2. UPDATE
      await connectionPool.query(
        `UPDATE device_schedule 
         SET record_status = 'completed' 
         WHERE booking_id = $1 AND device_id = $2 AND action = $3`,
        [bookingId, deviceId, action]
      );
      
      console.log(`[Worker] Task Finished: ${job.id}`);
    } catch (error) {
      console.error(`[Worker] Execution Failed:`, error.message);
      throw error; 
    }
  },
  { connection: redisConnection }
);

export const addIotJob = async (deviceId, action, delay, bookingId) => {
  const jobId = `${action}-${bookingId}-${deviceId}`;
  
  await iotQueue.add(
    "toggle-device",
    { deviceId, action, bookingId },
    {
      delay: delay < 0 ? 0 : delay,
      jobId: jobId,
      removeOnComplete: true, 
    }
  );
};

export const syncDatabaseToQueue = async () => {
  const { rows: pendingTasks } = await db.query(
    "SELECT * FROM device_schedule WHERE record_status = 'pending'"
  );

  const now = Date.now();

  for (const task of pendingTasks) {
    const executionTime = new Date(task.action_time).getTime();
    const delay = executionTime - now;

    await addIotJob(task.device_id, task.action, delay, task.booking_id);
  }
};