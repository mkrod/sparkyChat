import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { NotificationCountsIndex, User } from "../types";
import { defaultNotificationCounts } from "../vars";
import { useDataProvider } from "./data_provider";
import { useCallProvider } from "./call_provider";
import { useConnProvider } from "./conn_provider";


interface NotifContext {
    notificationCounts: Record<NotificationCountsIndex, number>;
}


const notifContext = createContext<NotifContext | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode}) => {

    const { messagesList } = useDataProvider();
    const { user_id: myId } = useConnProvider().user as User;
    const { callLogsParal } = useCallProvider();
    const [notificationCounts, setNotificationCounts] = useState<Record<NotificationCountsIndex, number>>(defaultNotificationCounts);


    useEffect(() => {
        let chats = 0;
        let calls = 0;
    
        // chats count
        messagesList.forEach((ml) => {
            chats += ml.unreadCount;
        });
    
        // calls count
        callLogsParal.forEach((cl) => {
            if (
                cl.endReason === "missed" &&
                !cl.read &&
                myId !== cl.initiatorId
            ) {
                calls += 1;
            }
        });
    
        setNotificationCounts({ chats, calls });
    }, [messagesList, callLogsParal, myId]);
    


  return (
    <notifContext.Provider value={{
        notificationCounts
    }}>
        { children }
    </notifContext.Provider>
  )
}

export const useNotificationProvider = () => {
    const context = useContext(notifContext);
    if(!context) throw Error("useNotificationProvider must be used within NotificationProvider");
    return context;
}