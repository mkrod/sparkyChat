import { onlineUsersModel } from "../db/model/onlineUsers.js";
import { getIoNamespace } from "./ws_conn.js";

export const sendSocketEvent = async (user_id: string, event: string, data?: any) => {
  const io = getIoNamespace();
  const online = await onlineUsersModel.findOne({ user_id });
  if (online && online.status !== "offline" && online.socket_id) {
    io.to(online.socket_id).emit(event, data);
  }
};