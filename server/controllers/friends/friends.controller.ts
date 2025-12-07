import type { Request, Response } from "express";
import {
  friendModel,
  friendRequestModel,
} from "../../utilities/db/model/friends.model.js";
import { notificationModel } from "../../utilities/db/model/notification.model.js";
import { onlineUsersModel } from "../../utilities/db/model/onlineUsers.js";
import { getIoNamespace } from "../../utilities/websocket/ws_conn.js";
import { usersModel } from "../../utilities/db/model/users.js";
import { sendSocketEvent } from "../../utilities/websocket/helper.js";
import { settingsModel } from "../../utilities/db/model/settings.model.js";
import { getSpecificSetting } from "../settings/settings.controller.js";

// Helper: send socket event if user is online

// 📩 Send a friend request
export const sendFriendRequest = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  const { friend_id } = req.body;

  if (!user_id || !friend_id)
    return res.status(400).json({ status: 400, message: "Missing user_id or friend_id" });

  try {
    const existing = await friendRequestModel.findOne({ user_id, requested: friend_id });
    if (existing) return res.status(409).json({ status: 409, message: "Friend request already sent" });

    const result = await friendRequestModel.create({ user_id, requested: friend_id });

    //if friend have notification on
    const friendAllowedRequestNotification = await getSpecificSetting(friend_id, "notification.friend_request", true);
    //console.log(friendAllowedRequestNotification);

    if (friendAllowedRequestNotification) {
      const username = (await usersModel.findOne({ user_id }))?.toJSON().username;
      //console.log(username)
      if (username) {
        const notification = await notificationModel.create({
          user_id: friend_id,
          type: "new_friend_request",
          title: "New Friend Request",
          content: `${username} sent you a friend request.`,
          metadata: { friend: { user_id } },
          read: false,
        });
      }
      await sendSocketEvent(friend_id, "new_notification");
    }

    await sendSocketEvent(friend_id, "friend_request");

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

    const friendAllowedCancelledNotification = await getSpecificSetting(friend_id, "notification.cancelled", true);
    if (friendAllowedCancelledNotification) {
      const username = (await usersModel.findOne({ user_id }))?.toJSON().username;

      if (username) {
        const notification = await notificationModel.create({
          user_id: friend_id,
          type: "friend_notification",
          title: "Friend Request Cancelled",
          content: `${username} cancelled friend request sent to you.`,
          metadata: { friend: { user_id } },
          read: false,
        });
      }
      await sendSocketEvent(friend_id, "new_notification");
    }
    await sendSocketEvent(friend_id, "friend_request");

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

    const friendAllowedAcceptedNotification = await getSpecificSetting(friend_id, "notification.accepted_request", true);
    if (friendAllowedAcceptedNotification) {
      const username = (await usersModel.findOne({ user_id }))?.toJSON().username;
      const notif1 = await notificationModel.create(
        {
          user_id: friend_id,
          type: "friend_notification",
          title: "Friend Request Accepted",
          content: `${username} accepted your friend request.`,
          metadata: { friend: { user_id } },
          read: false,
        },
      );

      await sendSocketEvent(friend_id, "new_notification", notif1);
    }

    await sendSocketEvent(friend_id, "friend");
    await sendSocketEvent(friend_id, "friend_request"); // update his request list

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

    const friendAllowedDeclinedNotification = await getSpecificSetting(friend_id, "notification.declined_request", true);
    if (friendAllowedDeclinedNotification) {
      const username = (await usersModel.findOne({ user_id }))?.toJSON().username;

      if (username) {
        const notification = await notificationModel.create({
          user_id: friend_id,
          type: "friend_notification",
          title: "Friend Request Declined",
          content: `${username} declined Your friend request.`,
          metadata: { friend: { user_id } },
          read: false,
        });
      }
      await sendSocketEvent(friend_id, "new_notification");
    }

    await sendSocketEvent(friend_id, "friend_request");


    res.status(200).json({ status: 200, message: "Friend request declined" });
  } catch (err) {
    console.error("Error declining request:", err);
    res.status(500).json({ status: 500, message: "Failed to decline friend request" });
  }
};



// 📥 Fetch all user requests
export const fetchAllUserRequests = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  const pageNumber = parseInt(req.query.page as string, 10) || 1;
  const limitNumber = 50;

  if (!user_id)
    return res.status(400).json({ status: 400, message: "Missing user_id" });

  try {
    const requestsPipeline: any[] = [
      { $match: { requested: user_id } },
      { $sort: { created_at: -1 } },
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },

      // join requester user details
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "user_id",
          as: "requester",
        },
      },
      { $unwind: "$requester" },

      // presence of requester
      {
        $lookup: {
          from: "onlineusers",
          localField: "user_id",
          foreignField: "user_id",
          as: "presence",
        },
      },
      { $addFields: { "requester.presence": { $arrayElemAt: ["$presence", 0] } } },

      // mutual friends
      {
        $lookup: {
          from: "friends",
          let: { requesterId: "$user_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user_id", user_id] } } },
            { $project: { friend_list: "$friend_list.user_id" } },
            {
              $lookup: {
                from: "friends",
                let: { currentFriends: "$friend_list" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$user_id", "$$requesterId"] } } },
                  {
                    $project: {
                      mutual_friends: {
                        $filter: {
                          input: "$friend_list.user_id",
                          as: "fid",
                          cond: { $in: ["$$fid", "$$currentFriends"] },
                        },
                      },
                    },
                  },
                ],
                as: "mutuals",
              },
            },
            {
              $project: {
                mutual_friends: {
                  $ifNull: [{ $arrayElemAt: ["$mutuals.mutual_friends", 0] }, []],
                },
              },
            },
          ],
          as: "mutualData",
        },
      },
      {
        $addFields: {
          mutual_friends: {
            $ifNull: [{ $arrayElemAt: ["$mutualData.mutual_friends", 0] }, []],
          },
        },
      },

      // project clean
      {
        $project: {
          "requester.password": 0,
          "requester.sessions": 0,
          "mutualData": 0,
          "presence": 0,
        },
      },
    ];

    const results = await friendRequestModel.aggregate(requestsPipeline);
    const total = await friendRequestModel.countDocuments({ requested: user_id });

    res.status(200).json({
      status: 200,
      message: "Friend requests fetched successfully",
      data: {
        page: pageNumber,
        perPage: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        from: (pageNumber - 1) * limitNumber + 1,
        to: Math.min(pageNumber * limitNumber, total),
        results,
      },
    });
  } catch (err) {
    console.error("Error fetching friend requests:", err);
    res.status(500).json({ status: 500, message: "Failed to fetch friend requests" });
  }
};




// 👥 Fetch all confirmed friends
export const fetchUserFriends = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  const pageNumber = parseInt(req.query.page as string, 10) || 1;
  const limitNumber = 50;

  if (!user_id)
    return res.status(400).json({ status: 400, message: "Missing user_id" });

  try {
    const userFriends = await friendModel.findOne({ user_id });
    const friendList = userFriends?.friend_list?.map((f: any) => f.user_id) || [];

    if (!friendList.length) {
      return res.status(200).json({
        status: 200,
        message: "No friends found",
        data: { results: [] },
      });
    }

    const pipeline: any[] = [
      { $match: { user_id: { $in: friendList } } },
      { $sort: { created_at: -1 } },
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },

      // presence
      {
        $lookup: {
          from: "onlineusers",
          localField: "user_id",
          foreignField: "user_id",
          as: "presence",
        },
      },
      { $addFields: { presence: { $arrayElemAt: ["$presence", 0] } } },

      // mutual friends
      {
        $lookup: {
          from: "friends",
          let: { friendId: "$user_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user_id", user_id] } } },
            { $project: { friend_list: "$friend_list.user_id" } },
            {
              $lookup: {
                from: "friends",
                let: { currentFriends: "$friend_list" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$user_id", "$$friendId"] } } },
                  {
                    $project: {
                      mutual_friends: {
                        $filter: {
                          input: "$friend_list.user_id",
                          as: "fid",
                          cond: { $in: ["$$fid", "$$currentFriends"] },
                        },
                      },
                    },
                  },
                ],
                as: "mutuals",
              },
            },
            {
              $project: {
                mutual_friends: {
                  $ifNull: [{ $arrayElemAt: ["$mutuals.mutual_friends", 0] }, []],
                },
              },
            },
          ],
          as: "mutualData",
        },
      },
      {
        $addFields: {
          mutual_friends: {
            $ifNull: [{ $arrayElemAt: ["$mutualData.mutual_friends", 0] }, []],
          },
        },
      },

      // cleanup
      {
        $project: {
          password: 0,
          sessions: 0,
          mutualData: 0,
        },
      },
    ];

    // ✅ use users collection, not friendModel again
    const results = await usersModel.aggregate(pipeline);

    const total = friendList.length;

    res.status(200).json({
      status: 200,
      message: "Friends fetched successfully",
      data: {
        page: pageNumber,
        perPage: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
        from: (pageNumber - 1) * limitNumber + 1,
        to: Math.min(pageNumber * limitNumber, total),
        results,
      },
    });
  } catch (err) {
    console.error("Error fetching user friends:", err);
    res.status(500).json({ status: 500, message: "Failed to fetch friends" });
  }
};


export const removeUserAsFriend = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  const { friend_id } = req.body;

  if (!user_id || !friend_id) {
    return res.status(400).json({ status: 400, message: "Missing user_id or friend_id" });
  }

  try {
    // 🧩 Remove from both users' friend lists
    await friendModel.updateOne(
      { user_id },
      { $pull: { friend_list: { user_id: friend_id } } }
    );

    await friendModel.updateOne(
      { user_id: friend_id },
      { $pull: { friend_list: { user_id } } }
    );

    // 🗑️ Remove any existing friend requests between both users
    await friendRequestModel.deleteMany({
      $or: [
        { user_id, requested: friend_id },
        { user_id: friend_id, requested: user_id },
      ],
    });

    const friendAllowedUnfriendNotification = await getSpecificSetting(friend_id, "notification.unfriended", true);

    if (friendAllowedUnfriendNotification) {
      const username = (await usersModel.findOne({ user_id }))?.toJSON().username;
      if (username) {// 🔔 Create notification for the removed friend
        const notification = await notificationModel.create({
          user_id: friend_id, // receiver
          type: "friend_notification",
          title: "Friend removed",
          content: `${username} has removed you as a friend.`,
          read: false,
          metadata: {
            friend: { user_id },
          },
          created_at: new Date(),
        });
      }
      await sendSocketEvent(friend_id, "new_notification");
    }

    // 🚀 Emit real-time event to the removed user's socket
    const data = {
      user_id,
      message: "You were removed from the friend list",
    };
    await sendSocketEvent(friend_id, "friend_removed", data);

    return res.status(200).json({
      status: 200,
      message: "Friend removed successfully",
      data: { friend_id },
    });
  } catch (err) {
    console.error("Error removing friend:", err);
    return res.status(500).json({
      status: 500,
      message: "Failed to remove friend",
    });
  }
};