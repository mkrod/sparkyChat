import type { Request, Response } from "express";
import { notificationModel } from "../../utilities/db/model/notification.model.js";
import { usersModel } from "../../utilities/db/model/users.js";
import type { User } from "../../utilities/types/others.js";
import { sendSocketEvent } from "../../utilities/websocket/helper.js";
import { flattenToDotNotation } from "../../utilities/index.js";

export const fetchAllUserNotification = async (req: Request, res: Response) => {
    const { user_id } = req.session;
    if (!user_id) {
        return res.json({ status: 403, message: "unauthorized" });
    }

    try {
        const notifications = await notificationModel.find({ user_id }).sort({ createdAt: -1 });

        const friendIds = notifications
            .map(n => n.metadata?.friend?.user_id)
            .filter(Boolean);

        let friendUsers: Record<string, User> = {};
        if (friendIds.length > 0) {
            const users = await usersModel.find(
                { user_id: { $in: friendIds } },
                {
                    _id: 0,
                    email: 0,
                    privacy: 0, // remove whole privacy field (safe)
                    auth_method: 0,
                    created_at: 0,
                    last_login: 0,
                }
            ).lean();


            friendUsers = Object.fromEntries(
                users.map(u => [u.user_id, u])
            );
        }

        const finalResult = notifications.map(n => {
            if (n.metadata?.friend?.user_id) {
                const fId = n.metadata.friend.user_id;
                if (friendUsers[fId]) {
                    n.metadata.friend = friendUsers[fId];
                }
            }
            return n;
        });

        return res.json({ status: 200, message: "success", data: finalResult });

    } catch (error) {
        console.log("Error fetching notifications for user:", user_id, error);
        return res.json({ status: 500 });
    }
};


export const readAllUserNotification = async (req: Request, res: Response) => {
    const { user_id } = req.session;
    if (!user_id) {
        return res.json({ status: 403, message: "unauthorized" });
    }

    await notificationModel.updateMany({ user_id }, { read: true });
    await sendSocketEvent(user_id, "new_notification");
    return res.json({ status: 200, message: "success" });
}


/*
export const getUserNotificationSettings = async (req: Request, res: Response) => {
    const { user_id } = req.session;
    if (!user_id) {
        return res.json({ status: 403, message: "unauthorized" });
    }

    const settings = await notificationSettingsModel.findOneAndUpdate(
        { user_id },
        {
            $setOnInsert: {
                user_id,
                settings: { ...defaultNotificationSettings },
            }
        },
        {
            upsert: true,
            new: true,  // return the created or existing result
            lean: true,
        }
    );

    return res.json({ status: 200, message: "success", data: settings });
};



export const updateUserNotificationSetting = async (req: Request, res: Response) => {
    const { user_id } = req.session;
    if (!user_id) {
        return res.json({ status: 403, message: "unauthorized" });
    }

    const key = Object.keys(req.body)[0] as string;
    const value = req.body[key] as boolean;

    await notificationSettingsModel.updateOne(
        { user_id },
        { $set: { [`settings.${key}`]: value } }
    );

    return res.json({ status: 200, message: "success" })
}
*/