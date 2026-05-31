import multer from 'multer';

// Use memoryStorage so the file is held in temporary RAM instead of saved on your hard drive
const storage = multer.memoryStorage();

// Validate that files match images or PDFs
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Upload images or PDF files only.') as any, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Cap the maximum size limit at 5MB
});