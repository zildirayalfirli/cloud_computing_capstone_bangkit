import { db } from '../db/firebase.js';
import { bucket } from '../db/gcpStorageProfile.js';
import dotenv from 'dotenv';

dotenv.config();

export const updateProfile = async (req, res) => {
  const { uid } = req.user;
  const { username, email, password } = req.body;
  const profileImage = req.file;

  try {
    let profileImageUrl = null;
    console.log("Request body:", req.body);
    console.log("Uploaded file:", profileImage);

    const userDoc = await db.collection("users").doc(uid).get();
    const userData = userDoc.data();

    const oldProfileImageUrl = userData?.profileImageUrl;

    if (oldProfileImageUrl) {
      const oldFilePath = oldProfileImageUrl.split(`${bucket.name}/`)[1];
      console.log(`Attempting to delete old image at path: ${oldFilePath}`);
      await bucket.file(oldFilePath).delete();
      console.log(`Old image ${oldFilePath} deleted from GCP bucket.`);
    }

    let uniqueFilename;
    if (profileImage) {
      uniqueFilename = `${uid}-${profileImage.originalname}`;
      const file = bucket.file(`${uid}/${uniqueFilename}`);

      console.log(`Uploading file to GCP bucket: ${uniqueFilename}`);

      await file.save(profileImage.buffer, {
        metadata: { contentType: profileImage.mimetype },
      });

      await file.makePublic();

      profileImageUrl = `https://storage.googleapis.com/${bucket.name}/${uid}/${uniqueFilename}`;
      console.log("Uploaded Profile Image URL:", profileImageUrl);
    }

    await db.collection("users").doc(uid).update({
      username,
      email,
      profileImageUrl,
      password
    });

    res.status(200).json({
      message: "Profile updated successfully",
        username,
        email,
        profileImageUrl,
        password,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

/// Get Profile (GET)
export const getProfile = async (req, res) => {
  const { uid } = req.user;

  try {
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = userDoc.data();
    res.status(200).json({
      profile: userData,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};
