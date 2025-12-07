import { model, Schema } from "mongoose";
import type { Settings } from "../../types/others.js";



const settingsSchema = new Schema<Settings>({
    user_id: { type: String },
    notification: {
        friend_request: { type: Boolean },
        declined_request: { type: Boolean },
        accepted_request: { type: Boolean },
        unfriended: { type: Boolean },
    },
})

const settingsModel = model("settings", settingsSchema);

export { settingsModel };