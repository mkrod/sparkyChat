import { type Request, type Response } from "express";
import { customResponse } from "../../utilities/index.js";
import { usersModel } from "../../utilities/db/model/users.js";

const getUserData = async (req: Request, res: Response) => {
    const { user_id } = req.session;
    if(!user_id) return res.json(customResponse({ message: "LoggedOut", status: 500 }));

    const response = (await usersModel.findOne({ user_id }))?.toObject();



    return res.json(customResponse({ message: "done", status: 200, data: response }));
}

export { getUserData };