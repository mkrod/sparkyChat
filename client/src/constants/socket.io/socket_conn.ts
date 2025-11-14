import { io } from "socket.io-client";
import { serverURL } from "..";

// Create and export a single socket instance
const socket = io(serverURL, {
    withCredentials: true,
    transports: ["websocket"], // Forces WebSocket transport
});

// Debugging
socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err);
});

socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket disconnected:", reason);
});

socket.on("reconnect_attempt", (attempt) => {
    console.log("🔄 Reconnecting attempt:", attempt);
});

socket.onAny((event, ...args) => {
    console.log("📥 Event received:", event, args);
});

export default socket;
