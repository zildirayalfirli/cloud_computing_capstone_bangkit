import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.GCP_PROJECT_ID;
const keyFilename = JSON.parse(process.env.GCP_KEY_FILE_PATH);

if (!projectId || !keyFilename) {
  console.error("Missing GCP configuration. Check .env file.");
  process.exit(1);
}

console.log("Using Project ID:", projectId);
console.log("Using Key File:", keyFilename);

const storage = new Storage({ projectId, keyFilename });

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);

console.log("Bucket initialized:", bucket.name);

export { storage, bucket };
