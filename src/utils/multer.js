import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadToMemory = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB
  }
}).single('image');
