import jwt from "jsonwebtoken";

export const protectAction = (req, res, next) => {
  next();
  // const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];
  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }
  // jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
  //   if (err) {
  //     return res.status(403).json({ message: "Access Token Expired" });
  //   }
  //   if (user.role !== 1) {
  //     return res.status(403).json({
  //       message: "Forbidden: Admin only",
  //     });
  //   }
  //   req.user = user;
  //   next();
  // });
};
