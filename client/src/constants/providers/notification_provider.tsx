import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { MessageList, NotificationCountsIndex } from "../types";
import { defaultNotificationCounts } from "../vars";
import { useDataProvider } from "./data_provider";


interface NotifContext {
    notificationCounts: Record<NotificationCountsIndex, number>;
}


const notifContext = createContext<NotifContext | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode}) => {

    const { messagesList } = useDataProvider();
    const [notificationCounts, setNotificationCounts] = useState<Record<NotificationCountsIndex, number>>(defaultNotificationCounts);


    useEffect(() => {
        if (messagesList.length === 0) return;
        let chats = 0, calls = 0;
        messagesList.map((ml: MessageList) => chats += ml.unreadCount);
        const data = {
            chats, calls
        }
        setNotificationCounts(data);
    }, [messagesList]);


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