import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
mongoose.connect(process.env.MONGO_DB_URI || "mongodb://localhost:27017/chat_app");

const db : mongoose.Connection = mongoose.connection;

db.on("error", (err: Error) => {
    console.error("❌ MongoDB connection error:", err);
});
db.once("open", () => {
  console.log("✅ MongoDB connected");
});


export default mongoose ;