import IORedis from "ioredis";

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null,
};

const redisConnection = new IORedis(redisConfig);

redisConnection.on("error", (err) =>
  console.error("Redis Connection Error:", err),
);
redisConnection.on("connect", () => console.log("[IoT Queue] Connected to Redis"));

export default redisConnection;
