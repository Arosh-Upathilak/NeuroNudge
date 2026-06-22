import multer from "multer";

const storage = multer.diskStorage({});

/**
 * Multer middleware config for handling file uploads locally on disk.
 */
export const upload = multer({ storage });