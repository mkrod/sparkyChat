import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react"
import { type Notification, type NotificationCountsIndex, type User, type SoundsIndexKey } from "../types";
import { defaultNotificationCounts } from "../vars";
import { useDataProvider } from "./data_provider";
import { useCallProvider } from "./call_provider";
import { useConnProvider } from "./conn_provider";
import { fetchUserNotifications } from "../user/controller";
import socket from "../socket.io/socket_conn";
import { usePeopleProvider } from "./people_provider";
import { defaultSounds } from "../var_2";


interface NotifContext {
    notificationCounts: Record<NotificationCountsIndex, number>;
    notification: Notification[];
    openMiniNotify: boolean;
    setOpenMiniNotify: Dispatch<SetStateAction<boolean>>;
    miniNoteLimit: number;
    SetMiniNoteLimit: (limit: number) => void;
    setSound: (option: Record<SoundsIndexKey, string>) => void;
    notificationSounds: Record<SoundsIndexKey, string>;
}


const notifContext = createContext<NotifContext | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {

    const { messagesList } = useDataProvider();
    const { user_id: myId } = useConnProvider().user as User;
    const { friendRequests } = usePeopleProvider();
    const { callLogsParal } = useCallProvider();
    const [notificationCounts, setNotificationCounts] = useState<Record<NotificationCountsIndex, number>>(defaultNotificationCounts);


    const [notification, setNotification] = useState<Notification[]>([]);
    const [fetchNotification, setFetchNotification] = useState<boolean>(true);
    useEffect(() => {
        if (!fetchNotification) return;

        fetchUserNotifications()
            .then((res) => {
               // console.log("notification: ", res);
                if (res.status === 200) {
                    setNotification(res.data as Notification[]);

                }
            })
            .catch((err) => {
                console.log("Cannot Fetch User Notification: ", err)
            })
            .finally(() => setFetchNotification(false));
    }, [fetchNotification]);
    useEffect(() => {
        socket.on("new_notification", () => setFetchNotification(true));
    }, [socket]);


    useEffect(() => {
        let chats = 0;
        let calls = 0;
        let base = 0;
        let friends_request = friendRequests?.results.length || 0;

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

        notification.forEach((n) => {
            if(!n.read){
                base += 1;
            }
        })
        
        setNotificationCounts({ chats, calls, base, friends_request });
    }, [messagesList, callLogsParal, myId, notification]);



    const [openMiniNotify, setOpenMiniNotify] = useState<boolean>(false);

    const [miniNoteLimit, setMiniNoteLimit] = useState<number>(6);
    useEffect(() => {
        const limit = localStorage.getItem("mini_notification_limit")||6;
        setMiniNoteLimit(limit as number);
    }, []);
    const SetMiniNoteLimit = useCallback((limit: number) => {
        localStorage.setItem("mini_notification_limit", String(limit));
        setMiniNoteLimit(limit);
    }, []);


    const [notificationSounds, setNotificationSounds] = useState<Record<SoundsIndexKey, string>>(defaultSounds);
    useEffect(() => {
        //localStorage.removeItem("notif_sounds")
        const sounds = localStorage.getItem("notif_sounds");
        if(!sounds){
            localStorage.setItem("notif_sounds", JSON.stringify(defaultSounds))
        }
        setNotificationSounds(sounds ? JSON.parse(sounds) : defaultSounds);
    }, []);

    const setSound = useCallback((altered: Record<SoundsIndexKey, string>) => {
        

        localStorage.setItem("notif_sounds", JSON.stringify(altered))
        setNotificationSounds(altered);

    }, []);


    return (
        <notifContext.Provider value={{
            notificationCounts,
            notification,
            openMiniNotify,
            setOpenMiniNotify,
            miniNoteLimit,
            SetMiniNoteLimit,
            setSound,
            notificationSounds
        }}>
            {children}
        </notifContext.Provider>
    )
}

export const useNotificationProvider = () => {
    const context = useContext(notifContext);
    if (!context) throw Error("useNotificationProvider must be used within NotificationProvider");
    return context;
}