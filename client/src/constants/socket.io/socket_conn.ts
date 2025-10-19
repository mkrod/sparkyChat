import { io } from "socket.io-client";
import { serverURL } from "..";

// Create and export a single socket instance
const socket = io(serverURL, {
    withCredentials: true,
    transports: ["websocket"], // Forces WebSocket transport
});

export default socket;