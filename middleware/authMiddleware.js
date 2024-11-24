import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const denylist = new Set();

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  if (denylist.has(token)) {
    return res.status(401).json({ message: "Token has been invalidated. Please log in again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { uid: decoded.uid };
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
