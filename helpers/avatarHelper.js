import gravatar from "gravatar";
import fs from "fs";
import path from "path";
import https from "https";

const AVATARS_DIR = path.join(process.cwd(), "public", "avatars");

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const download = (remoteUrl, localFilePath) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(localFilePath);
    https
      .get(remoteUrl, (response) => {
        if ((response.statusCode || 0) >= 400) {
          file.close();
          fs.unlink(localFilePath, () => {});
          return reject(
            new Error(`Failed to download avatar: ${response.statusCode}`)
          );
        }
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        file.close();
        fs.unlink(localFilePath, () => {});
        reject(err);
      });
  });

export const generateAndSaveAvatar = async (email, userId) => {
  ensureDir(AVATARS_DIR);
  const remoteAvatarUrl = gravatar.url(
    email,
    { s: "250", d: "identicon" },
    true
  );
  const avatarFilename = `${userId}.jpg`;
  const localFilePath = path.join(AVATARS_DIR, avatarFilename);
  const publicPath = `/avatars/${avatarFilename}`;

  try {
    await download(remoteAvatarUrl, localFilePath);
    return { avatarURL: publicPath, localFilePath, remoteAvatarUrl };
  } catch {
    return { avatarURL: remoteAvatarUrl, localFilePath: null, remoteAvatarUrl };
  }
};

export const saveUploadedAvatar = async (file, userId) => {
  ensureDir(AVATARS_DIR);
  const ext =
    path.extname(file?.originalname || "").toLowerCase() || ".jpg" || ".jpg";
  const uniqueName = `${userId}_${Date.now()}${ext}`;
  const destPath = path.join(AVATARS_DIR, uniqueName);
  await fs.promises.rename(file.path, destPath);
  return {
    avatarURL: `/avatars/${uniqueName}`,
    filePath: destPath,
    filename: uniqueName,
  };
};
