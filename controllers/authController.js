import { auth, db } from "../db/firebase.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const denylist = new Set(); // In-memory denylist for invalidated tokens

// Signup Handler
export const signup = async (req, res) => {
  const { email, password, confirmPassword, profile } = req.body;

  if (!email || !password || !confirmPassword || !profile || !profile.name || !profile.age) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const userRecord = await auth.createUser({ email, password });

    await db.collection("users").doc(userRecord.uid).set({
      email,
      profile,
    });

    const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET);

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login Handler (supports email/password and anonymous login)
export const login = async (req, res) => {
  const { email, password, isAnonymous } = req.body;

  if (isAnonymous) {
    try {
      // Create an anonymous user
      const userRecord = await auth.createUser({ displayName: "Anonymous" });

      await db.collection("users").doc(userRecord.uid).set({
        email: null,
        profile: {
          name: "Anonymous",
          age: null,
        },
      });

      const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET);

      res.status(200).json({
        message: "Anonymous login successful",
        token,
        uid: userRecord.uid,
      });
    } catch (error) {
      res.status(500).json({ message: "Anonymous login failed", error: error.message });
    }
  } else {
    // Email/Password Login
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    try {
      const userRecord = await auth.getUserByEmail(email);

      if (!userRecord) {
        return res.status(404).json({ message: "User not found" });
      }

      const token = jwt.sign({ uid: userRecord.uid }, process.env.JWT_SECRET);

      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
      res.status(401).json({ message: "Invalid credentials", error: error.message });
    }
  }
};

// Logout Handler
export const logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    denylist.add(token);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Profile Handler
export const getProfile = async (req, res) => {
  const { uid } = req.user;

  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ profile: userDoc.data().profile });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Profile Handler
export const updateProfile = async (req, res) => {
  const { uid } = req.user;
  const { profile } = req.body;

  if (!profile || !profile.name || !profile.age) {
    return res.status(400).json({ message: "Profile information is required" });
  }

  try {
    const userDoc = db.collection("users").doc(uid);
    const docSnapshot = await userDoc.get();

    if (!docSnapshot.exists) {
      await userDoc.set({
        email: req.user.email,
        profile,
      });
      return res.status(201).json({ message: "Profile created successfully" });
    }

    await userDoc.update({
      profile,
    });

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
