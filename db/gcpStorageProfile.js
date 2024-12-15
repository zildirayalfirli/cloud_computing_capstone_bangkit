import { Storage } from '@google-cloud/storage';
import dotenv from 'dotenv';

dotenv.config();

const bucketName = process.env.GCP_BUCKET_NAME;

const storage = new Storage({
  projectId: 'capstone-bangkit-d0ca4',
  keyFilename: './bucket.json'
});

const bucket = storage.bucket(bucketName);

export { storage, bucket };
