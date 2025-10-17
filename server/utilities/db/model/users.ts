import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    user_id: String,
    username: String,
    email: String,
    name: { first: String, last: String, },
    picture: String,
    created_at: String,
});

const usersModel = mongoose.model("users", userSchema);

export { usersModel };