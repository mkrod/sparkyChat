import type { SessionData } from "express-session";
import type { Socket, Namespace } from "socket.io";

const SocketController = ({ socket, io, sess }: { socket: Socket, io: Namespace, sess: SessionData}) => {
    
}
export default SocketController;