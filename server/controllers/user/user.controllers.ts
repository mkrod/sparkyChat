import { type Request, type Response } from "express";
import { customResponse } from "../../utilities/index.js";
import { usersModel } from "../../utilities/db/model/users.js";
import type { SocketID } from "../../utilities/types/others.js";
import { onlineUsersModel } from "../../utilities/db/model/onlineUsers.js";

const getUserData = async (req: Request, res: Response) => { //express
    const { user_id } = req.session;
    if(!user_id) return res.json(customResponse({ message: "LoggedOut", status: 500 }));

    const response = (await usersModel.findOne({ user_id }))?.toObject();


    return res.json(customResponse({ message: "done", status: 200, data: response }));
}

const updateUserLastSeen = async ({ socket_id }: SocketID) => {
    const user_id = await onlineUsersModel.findOne({ socket_id }).then(doc => doc?.user_id);
    if(!user_id) return;
    const filter = { user_id };
    const update = { last_login: new Date() };

    return usersModel.findOneAndUpdate(filter, update).exec();
}

export { getUserData, updateUserLastSeen };