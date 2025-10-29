import { model, Schema } from "mongoose";

export interface Notification {
  user_id: string; // receiver of the notification
  type: "new_friend_request" | "friend_notification" | "message" | "others";
  title: string;
  content: string;
  read: boolean; // ✅ new field
  metadata?: {
    friend?: {
      user_id: string;
    };
  };
  createdAt?: Date;
}

const notificationSchema = new Schema<Notification>(
  {
    user_id: { type: String, required: true },
    type: {
      type: String,
      enum: ["new_friend_request", "friend_notification", "message", "others"],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false }, // ✅ added
    metadata: {
      friend: {
        user_id: { type: String },
      },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const notificationModel = model<Notification>("Notification", notificationSchema);
