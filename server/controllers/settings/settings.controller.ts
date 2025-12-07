import type { Request, Response } from "express";
import { settingsModel } from "../../utilities/db/model/settings.model.js";
import { defaultSettings, flattenToDotNotation } from "../../utilities/index.js";
import get from "lodash.get";


export const getUserSettings = async (req: Request, res: Response) => {
    const { user_id } = req.session;
    if (!user_id) {
        return res.json({ status: 403, message: "unauthorized" });
    }

    try {
        const settings = await settingsModel.findOneAndUpdate(
            { user_id },
            {
                $setOnInsert: {
                    user_id, ...defaultSettings,
                }
            },
            {
                upsert: true,
                new: true,  // return the created or existing result
                lean: true,
            }
        );

        return res.json({ status: 200, message: "success", data: settings });
    } catch (err) {

    }
}

export const updateUserSettings = async (req: Request, res: Response) => {
    const { user_id } = req.session;
    if (!user_id) {
        return res.json({ status: 403, message: "unauthorized" });
    }

    const update = flattenToDotNotation(req.body);
    //console.log(update);

   await settingsModel.updateOne(
        { user_id },
        { $set: update }
    );

   return res.json({ status: 200, message: "success" })
}



export const getSpecificSetting = async (user_id: string, setting: string, defaultValue: any) => {
    if (!user_id) return;

    const doc = await settingsModel.findOne({ user_id }).lean();
    if (!doc) return defaultValue;

    return get(doc, setting);  // <-- works for nested paths
};

 //@p*O7Y13r@b2