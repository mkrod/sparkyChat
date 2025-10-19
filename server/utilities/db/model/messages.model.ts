import { Schema, model, Document } from "mongoose";

interface IMessage extends Document {
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: "text" | "image" | "video" | "audio" | "file";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  replyTo?: string;
  edited?: boolean;
  metadata?: Record<string, any>;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: String, required: true },
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ["text", "image", "video", "audio", "file"], default: "text" },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
  replyTo: { type: String },
  edited: { type: Boolean, default: false },
  metadata: { type: Schema.Types.Mixed },
});

const messageModel = model<IMessage>("Message", MessageSchema);
export  { messageModel, type IMessage };