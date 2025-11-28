import multer from "multer";
import fs from "fs";
import path from "path";

const TEMP_DIR = path.join(process.cwd(), "temp");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const upload = multer({ dest: TEMP_DIR });

export default upload;
