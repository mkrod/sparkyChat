import Peer from "peerjs";
import { peerHost, peerPort } from "..";



export const createPeer = (userId: string) => {
    return new Peer(userId, {
        host: peerHost,
        port: peerPort,
        path: "/peerjs/peerjs", // must match server
        secure: true,
    });
};