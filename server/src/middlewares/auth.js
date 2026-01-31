export const protectAction = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  
  if (apiKey === process.env.INTERNAL_CONTROL_KEY) {
    return next();
  }
  res.status(403).json({ error: "Unauthorized: Invalid Control Key" });
};