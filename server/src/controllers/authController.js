import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findUserByUsername,
  saveRefreshToken,
  deleteRefreshToken,
} from "../services/authService.js";

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await findUserByUsername(username);

    if (!user)
      return res
        .status(401)
        .json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });

    if (user.role_id !== 1) {
      console.log("no access");
      return res.status(403).json({
        access: false,
        message: "ไม่มีสิทธิ์เข้าใช้งาน (เฉพาะผู้ดูแลระบบเท่านั้น)",
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role_id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "60m" },
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: user.role_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    await saveRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        username: user.username,
        role: user.role_id,
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Session หมดอายุ กรุณาเข้าสู่ระบบใหม่" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  // 1. ลบ Refresh Token ใน Database (ถ้ามี)
  if (token) {
    await deleteRefreshToken(token); // ฟังก์ชันใน repository ของคุณ
  }

  // 2. ลบ Cookie ใน Browser
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: "/api/auth/refresh", // ต้องตรงกับตอนที่ set ไว้
  });

  res.json({ message: "Logged out successfully" });
};
