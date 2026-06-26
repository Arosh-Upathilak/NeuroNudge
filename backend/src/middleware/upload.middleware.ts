import multer from "multer";
import os from "os";

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (req, file, cb) => {
    // Preserve the file extension
    const ext = file.originalname.split('.').pop() || 'jpg';
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  }
});

/**
 * Multer middleware config for handling file uploads locally on disk.
 */
export const upload = multer({ storage });