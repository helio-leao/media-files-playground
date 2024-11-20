import { Router } from "express";
import fs from "fs/promises";
import multer from "multer";
import path from "path";
import {
  FILE_FIELD_NAME,
  FILES_DIRECTORY,
} from "../constants/fileConstants.js";

const __dirname = path.resolve();
const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${FILES_DIRECTORY}/`);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

router.post("/", upload.single(FILE_FIELD_NAME), (req, res) => {
  const { file } = req;
  res.sendFile(path.join(__dirname, file.path));
});

router.post("/fromBase64", async (req, res) => {
  const { base64, name, mimeType } = req.body;
  const filePath = path.join(__dirname, FILES_DIRECTORY, name);
  const buffer = Buffer.from(base64, "base64");
  await fs.mkdir(FILES_DIRECTORY, { recursive: true });
  await fs.writeFile(filePath, buffer);
  res.sendFile(filePath);
});

router.post("/fromUrl", async (req, res) => {
  const { url } = req.body;

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  const parsedUrl = new URL(url);
  let fileName = path.basename(parsedUrl.pathname) || "downloaded_file";
  fileName = fileName.split("?")[0];

  const filePath = path.join(__dirname, FILES_DIRECTORY, fileName);

  await fs.mkdir(FILES_DIRECTORY, { recursive: true });
  await fs.writeFile(filePath, Buffer.from(buffer));
  res.sendFile(filePath);
});

export default router;
