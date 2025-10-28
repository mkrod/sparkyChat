import type { Request, Response } from "express";
import {
  friendModel,
  friendRequestModel,
} from "../../utilities/db/model/friends.model.js";
import { notificationModel } from "../../utilities/db/model/notification.model.js";

// 📩 Send a friend request
export const sendFriendRequest = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  const { friend_id } = req.body;

  if (!user_id || !friend_id)
    return res.status(400).json({ status: 400, message: "Missing user_id or friend_id" });

  try {
    const existing = await friendRequestModel.findOne({ user_id, requested: friend_id });
    if (existing)
      return res.status(409).json({ status: 409, message: "Friend request already sent" });

    const result = await friendRequestModel.create({ user_id, requested: friend_id });

    // Create a notification for the receiver
    await notificationModel.create({
      user_id: friend_id,
      type: "new_friend_request",
      title: "New Friend Request",
      content: `You received a friend request.`,
      metadata: { friend: { user_id } },
    });

    res.status(200).json({
      status: 200,
      message: "Friend request sent successfully",
      data: result,
    });
  } catch (err) {
    console.error("Error sending friend request:", err);
    res.status(500).json({ status: 500, message: "Failed to send friend request" });
  }
};

// ❌ Cancel a sent friend request
export const cancelSentRequest = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  const { friend_id } = req.body;

  if (!user_id || !friend_id)
    return res.status(400).json({ status: 400, message: "Missing user_id or friend_id" });

  try {
    const deleted = await friendRequestModel.findOneAndDelete({ user_id, requested: friend_id });
    if (!deleted)
      return res.status(404).json({ status: 404, message: "Friend request not found" });

    // Optional: notify the receiver that the request was canceled
    await notificationModel.create({
      user_id: friend_id,
      type: "friend_notification",
      title: "Friend Request Cancelled",
      content: "A friend request sent to you has been cancelled.",
      metadata: { friend: { user_id } },
    });

    res.status(200).json({ status: 200, message: "Friend request cancelled" });
  } catch (err) {
    console.error("Error cancelling request:", err);
    res.status(500).json({ status: 500, message: "Failed to cancel friend request" });
  }
};

// ✅ Accept a friend request
export const acceptUserRequest = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  const { friend_id } = req.body;

  if (!user_id || !friend_id)
    return res.status(400).json({ status: 400, message: "Missing user_id or friend_id" });

  try {
    const request = await friendRequestModel.findOneAndDelete({
      user_id: friend_id,
      requested: user_id,
    });

    if (!request)
      return res.status(404).json({ status: 404, message: "Friend request not found" });

    // Add each other to friend lists
    await friendModel.updateOne(
      { user_id },
      { $push: { friend_list: { user_id: friend_id, friend_since: new Date() } } },
      { upsert: true }
    );
    await friendModel.updateOne(
      { user_id: friend_id },
      { $push: { friend_list: { user_id, friend_since: new Date() } } },
      { upsert: true }
    );

    // Notifications for both users
    await notificationModel.create([
      {
        user_id: friend_id,
        type: "friend_notification",
        title: "Friend Request Accepted",
        content: "Your friend request was accepted.",
        metadata: { friend: { user_id } },
      },
      {
        user_id,
        type: "friend_notification",
        title: "New Friend Added",
        content: "You are now friends.",
        metadata: { friend: { user_id: friend_id } },
      },
    ]);

    res.status(200).json({ status: 200, message: "Friend request accepted" });
  } catch (err) {
    console.error("Error accepting request:", err);
    res.status(500).json({ status: 500, message: "Failed to accept friend request" });
  }
};

// 🚫 Decline a friend request
export const declineUserRequest = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  const { friend_id } = req.body;

  if (!user_id || !friend_id)
    return res.status(400).json({ status: 400, message: "Missing user_id or friend_id" });

  try {
    const deleted = await friendRequestModel.findOneAndDelete({
      user_id: friend_id,
      requested: user_id,
    });

    if (!deleted)
      return res.status(404).json({ status: 404, message: "Friend request not found" });

    // Notify sender that their request was declined
    await notificationModel.create({
      user_id: friend_id,
      type: "friend_notification",
      title: "Friend Request Declined",
      content: "Your friend request was declined.",
      metadata: { friend: { user_id } },
    });

    res.status(200).json({ status: 200, message: "Friend request declined" });
  } catch (err) {
    console.error("Error declining request:", err);
    res.status(500).json({ status: 500, message: "Failed to decline friend request" });
  }
};
