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

const getAllUsers = async (req: Request, res: Response) => {
    console.log(req.query)
    try {
      const pageNumber = parseInt(req.query.page as string, 10) || 1;
      const limitNumber = 50;
      const currentUserId = req.session?.user_id;
      const searchTerm = (req.query.search_term as string)?.trim() || "";
  
      const matchConditions: any = {};
  
      // Exclude current user
      if (currentUserId) matchConditions.user_id = { $ne: currentUserId };
  
      // If search term is at least 3 characters, apply search filter
      if (searchTerm.length >= 3) {
        const regex = new RegExp(searchTerm, "i"); // case-insensitive match
        matchConditions.$or = [
          { username: regex },
          { "name.first": regex },
          { "name.last": regex },
        ];
      }
  
      const pipeline: any[] = [
        { $match: matchConditions },
        ...(searchTerm.length < 3
          ? [{ $sample: { size: limitNumber } }] // random 50 if no valid search
          : [
              { $sort: { createdAt: -1 } },
              { $skip: (pageNumber - 1) * limitNumber },
              { $limit: limitNumber },
            ]),
        {
          $lookup: {
            from: "onlineusers",
            localField: "user_id",
            foreignField: "user_id",
            as: "presence",
          },
        },
        {
          $addFields: {
            presence: { $arrayElemAt: ["$presence", 0] },
          },
        },
        {
          $project: {
            password: 0,
            sessions: 0,
            privacy: 0,
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



  
  
export { getUserData, updateUserLastSeen, getAllUsers };