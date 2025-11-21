import type { Request, Response } from "express";
import { CallLogModel, CallStateModel } from "../../utilities/db/model/calls.model.js";
import { usersModel } from "../../utilities/db/model/users.js";
import type { PipelineStage } from "mongoose";

/* =========================
   📞 Get Current User Call State
   ========================= */
export const getUserCallState = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.session;
    if (!user_id) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }

    const callState = await CallStateModel.findOne({
      $or: [{ initiatorId: user_id }, { receiverId: user_id }]
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (!callState) {
      return res.json({ status: 200, success: true, data: null });
    }

    // Fetch initiator and receiver details
    const [initiator, receiver] = await Promise.all([
      usersModel.findOne({ user_id: callState.initiatorId }).select("user_id username email name picture").lean(),
      usersModel.findOne({ user_id: callState.receiverId }).select("user_id username email name picture").lean(),
    ]);

    // Fallback for missing users
    const fallbackUser = {
      user_id: "unknown",
      username: "Unknown User",
      email: "",
      name: { first: "Unknown", last: "" },
      picture: "",
    };

    return res.json({
      status: 200,
      success: true,
      data: {
        ...callState,
        initiator: initiator || fallbackUser,
        receiver: receiver || fallbackUser,
      },
    });
  } catch (error) {
    console.error("Error fetching user call state:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch call state.",
    });
  }
};


/* =========================
   🧾 Get Current User Call Logs
   ========================= */
export const getUserCallLogs = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user_id;
    if (!userId) {
      return res.status(401).json({ status: 401, message: "Unauthorized" });
    }

    const logs = await CallLogModel.find({
      $or: [{ initiatorId: userId }, { receiverId: userId }],
    })
      .sort({ endedAt: -1 })
      .limit(20)
      .lean();

    if (logs.length === 0) {
      return res.json({ status: 200, success: true, data: [] });
    }

    const userIds = Array.from(
      new Set(logs.flatMap((log) => [log.initiatorId, log.receiverId]))
    );

    const users = await usersModel
      .find({ user_id: { $in: userIds } })
      .select("user_id username email name picture")
      .lean();

    const userMap = Object.fromEntries(users.map((u) => [u.user_id, u]));

    const fallbackUser = {
      user_id: "unknown",
      username: "Unknown User",
      email: "",
      name: { first: "Unknown", last: "" },
      picture: "",
    };

    const enrichedLogs = logs.map((log) => ({
      ...log,
      initiator: userMap[log.initiatorId] || fallbackUser,
      receiver: userMap[log.receiverId] || fallbackUser,
    }));

    return res.json({
      status: 200,
      success: true,
      data: enrichedLogs,
    });
  } catch (error) {
    console.error("Error fetching user call logs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch call logs.",
    });
  }
};


export const getUserCallLogsFiltered = async (req: Request, res: Response) => {
  try {
    const userId = req.session?.user_id;
    const pageNumber = parseInt(req.query.page as string, 10) || 1;
    const limitNumber = 50;

    const filter = (req.query.filter as string)?.toLowerCase() || "";

    if (!userId) {
      return res.status(400).json({ status: 400, message: "LoggedOut" });
    }

    let match: any = {
      $or: [
        { initiatorId: userId },
        { receiverId: userId }
      ]
    };

    // 🔍 apply filter
    if (filter === "incoming") {
      match = { receiverId: userId };
    } else if (filter === "outgoing") {
      match = { initiatorId: userId };
    } else if (filter === "missed") {
      match = {
        $or: [
          { initiatorId: userId },
          { receiverId: userId }
        ],
        status: "missed"
      };
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },

      // attach the other user info
      {
        $lookup: {
          from: "users",
          localField: "initiatorId",
          foreignField: "user_id",
          as: "initiator"
        }
      },
      { $addFields: { initiator: { $arrayElemAt: ["$initiator", 0] } } },

      {
        $lookup: {
          from: "users",
          localField: "receiverId",
          foreignField: "user_id",
          as: "receiver"
        }
      },
      { $addFields: { receiver: { $arrayElemAt: ["$receiver", 0] } } },

      // remove sensitive fields
      {
        $project: {
          "initiator.password": 0,
          "initiator.sessions": 0,
          "receiver.password": 0,
          "receiver.sessions": 0,
        }
      }
    ];

    const results = await CallLogModel.aggregate(pipeline);
    const total = await CallLogModel.countDocuments(match);

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
        results
      }
    });
  } catch (err) {
    console.error("Error fetching call logs:", err);
    res.status(500).json({ status: 500, message: "failed" });
  }
};

