import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { CurrentChatMessageType, MessageList, Presence, Response } from '../types';
import socket from "@/constants/socket.io/socket_conn";
import { fetchCurrentChatMessages, fetchMessageList, fetchUsersPresence } from '../user/controller';

interface DataProviderTypes {
    messagesList: MessageList[];
    newMessage: boolean;
    presence: Presence[];
    currentChatId: string | undefined;
    setCurrentChatId: Dispatch<SetStateAction<string | undefined>>;
    currentChatMessages: CurrentChatMessageType | undefined;
}


const DataContext = createContext<DataProviderTypes | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {

    //////////////////// Message List
    const [messagesList, setMessagesList] = useState<MessageList[]>([]);
    const [newMessage, setNewMessage] = useState<boolean>(true);
    //trigger new message on socket event
    useEffect(() => {
        socket.on("new_message", () => setNewMessage(true));
        return () => {
            socket.off("new_message");
        }
    }, [socket])

    useEffect(() => {
        if (!newMessage) return;
        //update MessageList from server or other source here
        fetchMessageList()
            .then((res: Response) => {
                if (res.message !== "success") throw Error("Failed to fetch message list");
                setMessagesList(res.data as MessageList[]);
            })
            .catch((err: Error) => {
                console.error("Error fetching message list:", err);
            })
            .finally(() => setNewMessage(false));
    }, [newMessage]);

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////
    /////////////////////// online users//////////////////////////////////////////
    const [presence, setPresence] = useState<Presence[]>([]); //array of user_ids
    const [presenceChanged, setPresenceChanged] = useState<boolean>(true);

    //listen for presence updates
    useEffect(() => {
        socket.on("presence_changed", () => setPresenceChanged(true));

        return () => {
            socket.off("presence_changed");
        }
    }, [socket]);
    useEffect(() => {
        if (!presenceChanged) return;
        //fetch presence data from server
        fetchUsersPresence()
            .then((res: Response) => {
                if (res.message !== "success") throw Error("Failed to fetch users presence");
                setPresence(res.data as Presence[]);
            })
            .catch((err: Error) => {
                console.error("Error fetching users presence:", err);
            })
            .finally(() => setPresenceChanged(false));
    }, [presenceChanged]);

    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    ////////////////////// specific chats //////////////////////////////
    const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);
    const [currentChatMessages, setCurrentChatMessages] = useState<CurrentChatMessageType>(); //replace any with Message type when available
    useEffect(() => {
        if (!currentChatId) return setCurrentChatMessages(undefined);
        //fetch messages for current chat from server
        console.log("refetching in_chat for ", currentChatId)
        fetchCurrentChatMessages(currentChatId)
            .then((res: Response) => {
                if (res.message !== "success") throw Error("Failed to fetch current chat messages");
                setCurrentChatMessages(res.data as CurrentChatMessageType);
            })
            .catch((err: Error) => {
                console.error("Error fetching current chat messages:", err);
            });
    }, [currentChatId, newMessage]);


    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    //////////// listen for read_receipt update
    useEffect(() => {
        const updateMessage = () => {
            //const { sender_id, message_id } = data;
            console.log("event")
            setNewMessage(true);
        }
        socket.on("message_read", updateMessage);
        return () => {
            socket.off("message_read", updateMessage);
        }

    }, [socket]);

    return (
        <DataContext.Provider value={{
            messagesList,
            newMessage,
            presence,
            currentChatId,
            setCurrentChatId,
            currentChatMessages
        }}>
            {children}
        </DataContext.Provider>
    )
}

export const useDataProvider = () => {
    const context = useContext(DataContext);
    if (!context) throw Error("useDataProvider must be used within DataProvider");
    return context;
}