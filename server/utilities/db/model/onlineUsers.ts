import  mongoose  from "../db.js";

const onlineUserSchema = new mongoose.Schema({
    user_id: String,
    socket_id: String,
});

const onlineUsersModel = mongoose.model("onlineUsers", onlineUserSchema);

export { onlineUsersModel };
