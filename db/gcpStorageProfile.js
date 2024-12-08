import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.GCP_PROJECT_ID;
const serviceAccountJson = process.env.GCP_KEY_FILE_PATH;
const bucketName = process.env.GCP_BUCKET_NAME;

if (!projectId || !serviceAccountJson || !bucketName) {
  throw new Error("Missing GCP configuration. Check your environment variables.");
}

const credentials = JSON.parse(serviceAccountJson);

const storage = new Storage({
  projectId,
  credentials,
});

const bucket = storage.bucket(bucketName);

export { storage, bucket };
