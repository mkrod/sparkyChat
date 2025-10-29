import type { Request, Response } from "express";
import {
  friendModel,
  friendRequestModel,
} from "../../utilities/db/model/friends.model.js";
import { notificationModel } from "../../utilities/db/model/notification.model.js";
import { onlineUsersModel } from "../../utilities/db/model/onlineUsers.js";
import { getIoNamespace } from "../../utilities/websocket/ws_conn.js";

// Helper: send socket event if user is online
const sendSocketEvent = async (user_id: string, event: string, data: any) => {
  const io = getIoNamespace();
  const online = await onlineUsersModel.findOne({ user_id });
  if (online && online.status !== "offline" && online.socket_id) {
    io.to(online.socket_id).emit(event, data);
  }
};

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

    const notification = await notificationModel.create({
      user_id: friend_id,
      type: "new_friend_request",
      title: "New Friend Request",
      content: `You received a friend request.`,
      metadata: { friend: { user_id } },
      read: false,
    });

    await sendSocketEvent(friend_id, "new_notification", notification);

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

// ❌ Cancel sent request
export const cancelSentRequest = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  const { friend_id } = req.body;

  if (!user_id || !friend_id)
    return res.status(400).json({ status: 400, message: "Missing user_id or friend_id" });

  try {
    const deleted = await friendRequestModel.findOneAndDelete({ user_id, requested: friend_id });
    if (!deleted)
      return res.status(404).json({ status: 404, message: "Friend request not found" });

    const notification = await notificationModel.create({
      user_id: friend_id,
      type: "friend_notification",
      title: "Friend Request Cancelled",
      content: "A friend request sent to you has been cancelled.",
      metadata: { friend: { user_id } },
      read: false,
    });

    await sendSocketEvent(friend_id, "new_notification", notification);

    res.status(200).json({ status: 200, message: "Friend request cancelled" });
  } catch (err) {
    console.error("Error cancelling request:", err);
    res.status(500).json({ status: 500, message: "Failed to cancel friend request" });
  }
};

// ✅ Accept user request
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

    // Add both to each other's list
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

    const [notif1, notif2] = await notificationModel.create([
      {
        user_id: friend_id,
        type: "friend_notification",
        title: "Friend Request Accepted",
        content: "Your friend request was accepted.",
        metadata: { friend: { user_id } },
        read: false,
      },
      {
        user_id,
        type: "friend_notification",
        title: "New Friend Added",
        content: "You are now friends.",
        metadata: { friend: { user_id: friend_id } },
        read: false,
      },
    ]);

    await sendSocketEvent(friend_id, "new_notification", notif1);
    await sendSocketEvent(user_id, "new_notification", notif2);

    res.status(200).json({ status: 200, message: "Friend request accepted" });
  } catch (err) {
    console.error("Error accepting request:", err);
    res.status(500).json({ status: 500, message: "Failed to accept friend request" });
  }
};

// 🚫 Decline user request
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

    const notification = await notificationModel.create({
      user_id: friend_id,
      type: "friend_notification",
      title: "Friend Request Declined",
      content: "Your friend request was declined.",
      metadata: { friend: { user_id } },
      read: false,
    });

    await sendSocketEvent(friend_id, "new_notification", notification);

    res.status(200).json({ status: 200, message: "Friend request declined" });
  } catch (err) {
    console.error("Error declining request:", err);
    res.status(500).json({ status: 500, message: "Failed to decline friend request" });
  }
};

// 📥 Fetch all user requests
export const fetchAllUserRequests = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  if (!user_id)
    return res.status(400).json({ status: 400, message: "Missing user_id" });

  try {
    const requests = await friendRequestModel.find({ requested: user_id });
    res.status(200).json({
      status: 200,
      message: "Friend requests fetched successfully",
      data: requests,
    });
  } catch (err) {
    console.error("Error fetching friend requests:", err);
    res.status(500).json({ status: 500, message: "Failed to fetch friend requests" });
  }
};

// 👥 Fetch all confirmed friends
export const fetchUserFriends = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  if (!user_id)
    return res.status(400).json({ status: 400, message: "Missing user_id" });

  try {
    const userFriends = await friendModel.findOne({ user_id });
    res.status(200).json({
      status: 200,
      message: "Friends fetched successfully",
      data: userFriends?.friend_list || [],
    });
  } catch (err) {
    console.error("Error fetching user friends:", err);
    res.status(500).json({ status: 500, message: "Failed to fetch friends" });
  }
};
