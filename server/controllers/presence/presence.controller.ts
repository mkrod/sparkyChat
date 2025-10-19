import type { Request, Response } from "express";
import { onlineUsersModel } from "../../utilities/db/model/onlineUsers.js";
import { customResponse } from "../../utilities/index.js";

const getAllUsersPresence = async (req: Request, res: Response) => {
    // Implementation to fetch and return all users' presence status
    const { user_id } = req.session;
    if(!user_id) return res.json({ message: "unauthorized", status: 401 });
    try{
        const results = await onlineUsersModel.find({});
        
        return res.json(customResponse({ message: "success", data: results }))
    }catch(err){
        return res.json({ message: "error fetching presence", status: 500 });
    }
}
export { getAllUsersPresence };