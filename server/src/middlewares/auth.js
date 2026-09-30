import jwt from "jsonwebtoken";
import { findUserById, isUserBlocked } from "../services/authService.js";
import { getAllowedRoomIds } from "../services/roomAccessService.js";

export const protectAction = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await findUserById(decoded.id);

    if (!user || isUserBlocked(user.status)) {
      return res.status(403).json({
        message: "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
      });
    }
    if (decoded.role !== 1) {
      return res.status(403).json({
        message: "Forbidden: Admin only",
      });
    }
    const allowedRoomIds = await getAllowedRoomIds(decoded.id);

    req.user = decoded;
    req.allowedRoomIds = allowedRoomIds;
    req.allowedRoomIdSet = new Set(allowedRoomIds);

    next();
  } catch (err) {
    return res.status(403).json({ message: "Access Token Expired" });
  }
};
