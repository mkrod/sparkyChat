import type { Request, Response } from "express";
import { CallLogModel, CallStateModel } from "../../utilities/db/model/calls.model.js";
import { usersModel } from "../../utilities/db/model/users.js";

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
