import { createContext, useContext, useEffect, type ReactNode } from "react";
import socket from "../socket.io/socket_conn";

interface OffNotifyContextType { }

const OffNotifyContext = createContext<OffNotifyContextType | null>(null);

export const OffNotifyProvider = ({ children }: { children: ReactNode }) => {
    useEffect(() => {
        // 1. Register the service worker
        navigator.serviceWorker.register("/sw.js");

        // 2. Ask notification permission
        Notification.requestPermission();

        // 3. Listen for new messages via socket
        const handleMessage = (msg: { sender: string, type: string; content: string; dp?: string }) => {
            if (Notification.permission === "granted" && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    sender: msg.sender,
                    type: msg.type,
                    content: msg.content,
                    icon: msg.dp || "/logo.png",
                });
            }
        };

        socket.on("offline_message", handleMessage);

        return () => {
            socket.off("offline_message", handleMessage);
        };
    }, []);

    return <OffNotifyContext.Provider value={{}}>{children}</OffNotifyContext.Provider>;
};

export const useOffNotify = () => {
    const context = useContext(OffNotifyContext);
    if (!context) throw Error("useOffNotify must be used within a OffNotifyProvider");
    return context;
};
