import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user_id: String,
    username: String,
    email: String,
    name: { first: String, last: String, },
    picture: String,
    created_at: { type: Date, default: Date.now },
    last_login: { type: Date, default: Date.now },
    privacy: {
        read_receipt: { type: Boolean, default: true },
        password: { type: String },
    },
    auth_method: { type: String }
});

const usersModel = mongoose.model("users", userSchema);

export { usersModel };