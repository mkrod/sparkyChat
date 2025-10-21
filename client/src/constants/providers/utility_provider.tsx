import{ createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { TypingType } from '../types';
import socket from '../socket.io/socket_conn';


interface UtilityContext {
    typingUsersList: TypingType[];
}

const utilityContext = createContext<UtilityContext | null>(null);

export const UtilityProvider = ({children}: {children: ReactNode}) => {

    const [typingUsersList, setTypingUsersList] = useState<TypingType[]>([]);
    useEffect(() => {
        socket.on("user_typing", ({ sender_id }) => {
            const isUserTypingAlready = typingUsersList.find((tl) => tl.user_id === sender_id);
            if(isUserTypingAlready) return; //preventing duplicate
            setTypingUsersList((prev) => ([...prev, { user_id: sender_id, isTyping: true }]));
            setTimeout(() => {
                setTypingUsersList((prev) => prev.filter((p) => p.user_id !== sender_id));
            }, 3000);
        })
    }, []);

  return (
    <utilityContext.Provider value={{
        typingUsersList,
    }}>
        {children}
    </utilityContext.Provider>
  )
}

export const useUtilityProvider = () => {
      const context = useContext(utilityContext);
      if(!context) {
        throw new Error('useUtilityProvider must be used within a UtilityProvider')
      }
      return context;
}