import { type Request, type Response } from "express";
import { customResponse } from "../../utilities/index.js";
import { usersModel } from "../../utilities/db/model/users.js";
import type { SocketID } from "../../utilities/types/others.js";
import { onlineUsersModel } from "../../utilities/db/model/onlineUsers.js";

const getUserData = async (req: Request, res: Response) => { //express
  const { user_id } = req.session;
  if (!user_id) return res.json(customResponse({ message: "LoggedOut", status: 500 }));

  const response = (await usersModel.findOne({ user_id }))?.toObject();


  return res.json(customResponse({ message: "done", status: 200, data: response }));
}

const updateUserLastSeen = async ({ socket_id }: SocketID) => {
  const user_id = await onlineUsersModel.findOne({ socket_id }).then(doc => doc?.user_id);
  if (!user_id) return;
  const filter = { user_id };
  const update = { last_login: new Date() };

  return usersModel.findOneAndUpdate(filter, update).exec();
}




const updateUserReadReceipt = async (req: Request, res: Response) => {

  const { user_id } = req.session;
  if (!user_id) return res.json({ message: "LoggedOut", status: 403 });

  try {
    const { newReceipt } = req.body as { newReceipt: boolean };
    const result = await usersModel.updateOne({ user_id }, { "privacy.read_receipt": newReceipt });
    if (result) {
      res.json({ status: 200, message: "updated" })
    }
  } catch (error) {
    console.log("Error  Updating Receipt for user ", user_id)
  }
}


const updateUserDetails = async (req: Request, res: Response) => {
  const { user_id } = req.session;
  if (!user_id) return res.json({ message: "LoggedOut", status: 403 });

  try {

    const { update } = req.body;
    console.log(update);

  } catch (error) {

  }
}





const getAllUsers = async (req: Request, res: Response) => {
  try {
    const pageNumber = parseInt(req.query.page as string, 10) || 1;
    const limitNumber = 50;
    const currentUserId = req.session?.user_id;
    const searchTerm = (req.query.search_term as string)?.trim() || "";

    if (!currentUserId) {
      return res.json(customResponse({ message: "LoggedOut", status: 500 }));
    }

    const matchConditions: any = { user_id: { $ne: currentUserId } };

    // search filter (only if >= 3 chars)
    if (searchTerm.length >= 3) {
      const regex = new RegExp(searchTerm, "i");
      matchConditions.$or = [
        { username: regex },
        { "name.first": regex },
        { "name.last": regex },
      ];
    }

    const pipeline: any[] = [
      { $match: matchConditions },
      { $sort: { created_at: -1 } },
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },

      // include presence
      {
        $lookup: {
          from: "onlineusers",
          localField: "user_id",
          foreignField: "user_id",
          as: "presence",
        },
      },
      { $addFields: { presence: { $arrayElemAt: ["$presence", 0] } } },

      // ✅ MUTUAL FRIENDS LOGIC
      {
        $lookup: {
          from: "friends",
          let: { otherUserId: "$user_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$user_id", currentUserId] } } },
            { $project: { friend_list: "$friend_list.user_id" } },
            {
              $lookup: {
                from: "friends",
                let: { currentFriends: "$friend_list" },
                pipeline: [
                  { $match: { $expr: { $eq: ["$user_id", "$$otherUserId"] } } },
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

      // ✅ FRIENDSHIP STATUS (friends)
      {
        $lookup: {
          from: "friends",
          let: { otherUserId: "$user_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$user_id", currentUserId] } },
            },
            {
              $project: {
                isFriend: {
                  $in: ["$$otherUserId", "$friend_list.user_id"],
                },
              },
            },
          ],
          as: "friendStatus",
        },
      },
      { $addFields: { friends: { $ifNull: [{ $arrayElemAt: ["$friendStatus.isFriend", 0] }, false] } } },

      // ✅ FRIEND REQUEST STATUS (requested)
      {
        $lookup: {
          from: "friend_requests",
          let: { otherUserId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", currentUserId] },
                    { $eq: ["$requested", "$$otherUserId"] },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "requestedStatus",
        },
      },
      { $addFields: { requested: { $gt: [{ $size: "$requestedStatus" }, 0] } } },

      // ✅ INCOMING FRIEND REQUEST (incoming_request)
      {
        $lookup: {
          from: "friend_requests",
          let: { otherUserId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$otherUserId"] },
                    { $eq: ["$requested", currentUserId] },
                  ],
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: "incomingStatus",
        },
      },
      { $addFields: { incoming_request: { $gt: [{ $size: "$incomingStatus" }, 0] } } },

      // cleanup
      {
        $project: {
          password: 0,
          sessions: 0,
          privacy: 0,
          mutualData: 0,
          friendStatus: 0,
          requestedStatus: 0,
          incomingStatus: 0,
        },
      },
    ];

    const results = await usersModel.aggregate(pipeline);
    const total = await usersModel.countDocuments(matchConditions);

    res.json({
      status: 200,
      message: "success",
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
    console.error("Error fetching all users:", err);
    res.status(500).json({ status: 500, message: "failed" });
  }
};


export { getUserData, updateUserLastSeen, updateUserReadReceipt, updateUserDetails, getAllUsers };