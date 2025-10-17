import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    name: { first: String, last: String, },
    createdAt: { type: Date, default: Date.now },
});

const usersModel = mongoose.model("users", userSchema);

export { usersModel };