import  mongoose  from "../db.js";

const onlineUserSchema = new mongoose.Schema({
    user_id: String,
    socket_id: String,
    status: { type: String, enum: ["online", "offline", "away", "busy"], default: "online" },
});

const onlineUsersModel = mongoose.model("onlineUsers", onlineUserSchema);

export { onlineUsersModel };
