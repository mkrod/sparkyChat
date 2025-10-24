import type { Request, Response } from "express";
import type { Media, Message } from "../../utilities/types/others.js";
import crypto from "crypto";
import { messageModel } from "../../utilities/db/model/messages.model.js";
import { onlineUsersModel } from "../../utilities/db/model/onlineUsers.js";
import { getIoNamespace } from "../../utilities/websocket/ws_conn.js";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";

const generateThumbnail = async (videoPath: string, thumbnailPath: string) => {
  return new Promise<void>((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-i", videoPath,
      "-ss", "00:00:01",
      "-vframes", "1",
      "-q:v", "2",
      thumbnailPath
    ]);

    ffmpeg.on("close", code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });

    ffmpeg.on("error", err => reject(err));
  });
};

export const sendMedia = async (req: Request, res: Response) => {
  try {
    const { files } = req as { files: Express.Multer.File[] };
    const { metadata, users } = req.body;
    const { user_id } = req.session;

    if (!files?.length || !user_id)
      return res.status(400).json({ message: "Invalid request" });

    const { receiverId } = JSON.parse(users) as { receiverId: string };
    const io = getIoNamespace();
    if (!io) throw Error("Socket not initialized");

    // Generate thumbnails for videos first
    for (const file of files) {
      if (file.mimetype.startsWith("video/")) {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        const thumbnailsDir = path.join(process.cwd(), "public", "thumbnails");
        if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

        const videoPath = path.join(uploadsDir, file.filename);
        const thumbnailPath = path.join(thumbnailsDir, `${path.parse(file.filename).name}.jpg`);

        await generateThumbnail(videoPath, thumbnailPath);
      }
    }

    // Map files to messages
    const messages: Message[] = files.map((file, index) => {
        //console.log(file)
      let caption = "";
      try {
        const parsed = JSON.parse(metadata[index] ?? "{}");
        caption = parsed.caption ?? "";
      } catch { }

      const { filename, mimetype, size, originalname } = file;
      const content = `${process.env.SERVER_URL}/uploads/${filename}`;

      const type: Message["type"] =
        mimetype.startsWith("image/") ? "image" :
          mimetype.startsWith("video/") ? "video" :
            mimetype.startsWith("audio/") ? "audio" :
              "file";

      const thumbnail =
        type === "video"
          ? `${process.env.SERVER_URL}/thumbnails/${path.parse(filename).name}.jpg`
          : undefined;

      const media: Media = {
        content,
        caption,
        size,
        type,
        originalName: originalname,
        thumbnail,
        uploadedAt: new Date()
      };

      return {
        senderId: user_id,
        receiverId,
        chatId: crypto.randomUUID(),
        media,
        type,
        timestamp: new Date(),
        status: "sent",
      };
    });

    // Save messages
    await messageModel.insertMany(messages);

    // Find sockets
    const usersSockets = await onlineUsersModel.find({
      user_id: { $in: [user_id, receiverId] },
    }).lean();

    const socketIds = usersSockets
      .map(u => u.socket_id)
      .filter((id): id is string => typeof id === "string");

    if (socketIds.length > 0) {
      io.to(socketIds).emit("new_message", {
        messages,
        from: user_id,
        to: receiverId,
      });
    }

    return res.json({ status: 200, message: "success" });
  } catch (error) {
    console.error("Error sending Media:", error);
    return res.status(500).json({ status: 500, message: "error" });
  }
};
