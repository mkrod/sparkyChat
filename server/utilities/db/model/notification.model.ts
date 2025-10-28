import { model, Schema } from "mongoose";

export interface Notification {
  user_id: string; // receiver of the notification
  type: "new_friend_request" | "friend_notification" | "message" | "others";
  title: string;
  content: string;
  metadata?: {
    friend?: {
      user_id: string; // the other user's id (e.g. sender)
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
