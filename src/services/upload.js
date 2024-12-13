import { appEnv } from '../utils/env.js';
import { gcs } from '../utils/firebase.js';

/**
 * @param {Express.Multer.File} file
 * @returns {Promise<string>}
 */
export async function uploadImageToGcs(file) {
  const fileExtension = file.originalname.split('.').pop();

  const fileName = `${crypto.randomUUID()}.${fileExtension}`;
  const filePath = `public/${fileName}`;

  await gcs.file(filePath).save(file.buffer);

  const generatedUploadedUrl = `https://storage.googleapis.com/${appEnv.STORAGE_BUCKET}/${filePath}`;

  return generatedUploadedUrl;
}

export const UploadService = {
  uploadImageToGcs
};
