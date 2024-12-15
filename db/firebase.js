import admin from "firebase-admin";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import path from "path";

dotenv.config();

const __dirname = path.dirname(new URL(import.meta.url).pathname); // Get the directory name
const serviceAccountPath = path.resolve(__dirname, '../service-account.json');

// Read and parse the service-account.json file
const serviceAccount = JSON.parse(
  await readFile(serviceAccountPath, { encoding: "utf-8" })
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'capstone-bangkit-d0ca4',
});

export const db = admin.firestore();
