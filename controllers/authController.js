import { db } from "../db/firebase.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const denylist = new Set(); // In-memory denylist for invalidated tokens

// Signup Handler
export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userRef = db.collection("users").where("email", "==", email);
    const userSnapshot = await userRef.get();

    if (!userSnapshot.empty) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = {
      email,
      password,
      username,
    };

    const userDocRef = await db.collection("users").add(newUser);

    const token = jwt.sign(
      { userId: userDocRef.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME } // Set token lifetime
    );

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: error.message });
  }
};

// Login Handler
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Email and password are required");
    }

    const userRef = db.collection("users").where("email", "==", email);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      return res.status(400).send("User does not exist");
    }

    const userDoc = userSnapshot.docs[0];

    if (password !== userDoc.data().password) {
      return res.status(400).send("Invalid credentials");
    }

    const user = userDoc.data();
    user.password = undefined;

    const token = jwt.sign(
      { userId: userDoc.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME } // Set token lifetime
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
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

// Change Password Handler with new password verification
export const changePassword = async (req, res) => {
  const { email, newPassword, verifyPassword } = req.body;

  if (!email || !newPassword || !verifyPassword) {
    return res.status(400).json({ message: "Email, new password, and verify password are required" });
  }

  if (newPassword !== verifyPassword) {
    return res.status(400).json({ message: "New password and verify password do not match" });
  }

  try {
    const userRef = db.collection("users").where("email", "==", email);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      return res.status(404).json({ message: "Email not found" });
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;

    await db.collection("users").doc(userId).update({
      password: newPassword,
    });

    res.status(200).json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Error updating password", error: error.message });
  }
};
