import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { MessageList, Presence, Response } from '../types';
import socket from "@/constants/socket.io/socket_conn";
import { fetchMessageList, fetchUsersPresence } from '../user/controller';

interface DataProviderTypes {
    messagesList: MessageList[];
    newMessage: boolean;
    presence: Presence[];
}


const DataContext = createContext<DataProviderTypes|null>(null);

export const DataProvider = ({ children }: {children: ReactNode}) => {

    //////////////////// Message List
    const [messagesList, setMessagesList] = useState<MessageList[]>([]);
    const [newMessage, setNewMessage] = useState<boolean>(true);
    //trigger new message on socket event
    useEffect(() => {
        socket.on("new_message", () => setNewMessage(true));
        return () => {
            socket.off("new_message");
        }
    }, [])
    useEffect(() => {
        if(!newMessage) return;
        //update MessageList from server or other source here
        fetchMessageList()
        .then((res: Response) => {
            if(res.message !== "success") throw Error("Failed to fetch message list");
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
    }, []);
    useEffect(() => {
        if(!presenceChanged) return;
        //fetch presence data from server
        fetchUsersPresence()
        .then((res: Response) => {
            if(res.message !== "success") throw Error("Failed to fetch users presence");
            setPresence(res.data as Presence[]);
        })
        .catch((err: Error) => {
            console.error("Error fetching users presence:", err);
        })
        .finally(() => setPresenceChanged(false));
    }, [presenceChanged]);
    
  return (
    <DataContext.Provider value={{
        messagesList,
        newMessage,
        presence
    }}>
        {children}
    </DataContext.Provider>
  )
}

export const useDataProvider = () => {
    const context = useContext(DataContext);
    if(!context) throw Error("useDataProvider must be used within DataProvider");
    return context;
}