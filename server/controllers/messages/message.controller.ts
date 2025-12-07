import type { Request, Response } from "express";
import { messageModel } from "../../utilities/db/model/messages.model.js";
import { usersModel } from "../../utilities/db/model/users.js";
import { onlineUsersModel } from "../../utilities/db/model/onlineUsers.js";
import { getIoNamespace } from "../../utilities/websocket/ws_conn.js";


const getUserMessageList = async (req: Request, res: Response) => {
  try {
    const user_id = req.session.user_id;
    if (!user_id) {
      return res.json({ message: "Unauthorized", status: 401, data: null });
    }


    const results = await messageModel.aggregate([
      // Step 1: get all messages involving the user
      {
        $match: {
          $or: [
            { senderId: user_id }, // messages sent by user
            { receiverId: user_id } // messages received by user
          ]
        }
      },
      // Step 2: sort newest first
      { $sort: { timestamp: -1 } },
      // Step 3: group by the other participant
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", user_id] }, // if current user sent it
              "$receiverId",                    // other participant = receiver
              "$senderId"                       // else other participant = sender
            ]
          },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiverId", user_id] }, { $ne: ["$status", "read"] }] },
                1,
                0
              ]
            }
          },
          lastMessage: { $first: "$content" },
          lastMessageType: { $first: "$type" },
          lastMessageStatus: { $first: "$status" },
          lastTimestamp: { $first: "$timestamp" },
          lastSenderId: { $first: "$senderId" }
        }
      },
      // Step 4: lookup the other party data from users collection
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "user_id",
          as: "otherPartyData"
        }
      },
      // Step 5: unwind the array to a single object
      { $unwind: "$otherPartyData" },
      // Step 6: reshape the otherPartyData
      {
        $project: {
          unreadCount: 1,
          lastMessage: 1,
          lastMessageType: 1,
          lastMessageStatus: 1,
          lastTimestamp: 1,
          lastSenderId: 1,
          otherPartyData: {
            user_id: "$otherPartyData.user_id",
            name: "$otherPartyData.name",
            picture: "$otherPartyData.picture"
          }
        }
      },
      // Step 7: optional: sort chats by lastTimestamp descending
      { $sort: { lastTimestamp: -1 } }
    ]);


    return res.json({ message: "success", status: 200, data: results });

  } catch (error: any) {
    return res.json({ message: "Internal Server Error", status: 500, data: null });
  }
}



const getMutualChat = async (req: Request, res: Response) => {
  // const io = getIoNamespace();

  try {
    //chatId represent other user here, supposed to use receiverId
    const { user_id } = req.session;
    const { chatId } = req.body;

    if (!user_id) {
      return res.json({ message: "Unauthorized", status: 401, data: null });
    }

    if (!chatId) {
      return res.json({ message: "Bad Request: chatId is required", status: 400, data: null });
    }


    // find all messages where (sender=user_id and receiver=chatId) or vice versa
    const messages = await messageModel.find({
      $or: [
        { senderId: user_id, receiverId: chatId },
        { senderId: chatId, receiverId: user_id },
      ],
    }).sort({ createdAt: 1 }); // oldest to newest (you can flip with -1)
    //console.log(messages);

    // fetch the other user's document
    const otherUser = await usersModel.findOne({ user_id: chatId }).select("-password -sessions");


    return res.json({
      message: "success",
      status: 200,
      data: {
        otherUser,
        messages,
      },
    });

  } catch (error: any) {
    console.error(error);
    return res.json({ message: "Internal Server Error", status: 500, data: null });
  }
};

export { getUserMessageList, getMutualChat };