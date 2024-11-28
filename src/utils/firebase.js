import { initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { appEnv } from './env.js';

initializeApp();

const storage = getStorage();

export const gcs = storage.bucket(appEnv.STORAGE_BUCKET);
