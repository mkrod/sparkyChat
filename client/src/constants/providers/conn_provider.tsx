import { createContext, useContext, useEffect, useState, type Dispatch, type FC, type SetStateAction } from 'react'
import { type Response, type SoundsIndexKey, type User } from '../types';
import { fetchUserData } from '../user/controller';
import { defaultUserObject } from '../vars';
import socket from '../socket.io/socket_conn';
import { defaultSounds } from '../var_2';


interface ConnContextType {
    // Define the shape of your context here
    user: User;
    setUser: Dispatch<SetStateAction<User>>;
    fetchingUser: boolean;
    setFetchingUser: Dispatch<SetStateAction<boolean>>;
}



/////////////////////////////////////////////////////////////////
const ConnContext = createContext<ConnContextType | null>(null);

interface ConnProviderProps {
    children: React.ReactNode
}
export const ConnectionProvider: FC<ConnProviderProps> = ({ children }) => {

    // ✅ WebSocket setup
    useEffect(() => {
      // When connected
      socket.on("connect", () => {
          console.log("Socket connected:", socket.id);
      });

      socket.on("connect_error", (err) => {
          console.error("Connection error:", err);
      });

      // Cleanup listeners on unmount
      return () => {
          socket.off("connect");
      };
  }, []);

  ///////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////
  const [user, setUser] = useState<User>(defaultUserObject);
  const [fetchingUser, setFetchingUser] = useState<boolean>(true);
  useEffect(() => {
    if(!fetchingUser) return;

    fetchUserData()
      .then((res: Response) => {
        setUser(res.data);
      })
      .catch((err: Error) => {
        console.log("Error fetching user data: ", err);
      })
      .finally(() => setFetchingUser(false));

  }, [fetchingUser])

  //should be in useDataProvider but provider hierarchy, restriction, i need user_id , i cant use outside here, Data provider have not access here

  useEffect(() => {
    const str = localStorage.getItem("notif_sounds");
    const sounds: Record<SoundsIndexKey, string> = str ? JSON.parse(str) : defaultSounds;


    const handleNewMessage = ({ to }: { to: string }) => {
        if (to === user.user_id) { //i received a message, play sound
            const audio = new Audio(`/sound/${sounds.message}`);
            audio.play();
        } //else, i just need to update my ui, which is done in DataProvider
    }
    socket.on("new_message", handleNewMessage);
    return () => {
        socket.off("new_message", handleNewMessage);
    }
}, [socket, user])


  return (
    <ConnContext.Provider value={{
      user,
      setUser,
      fetchingUser,
      setFetchingUser
    }}>
      { children }
    </ConnContext.Provider>
  )
}

export const useConnProvider = () => {
  const context = useContext(ConnContext);
  if(!context) {
    throw new Error('useConnProvider must be used within a ConnProvider')
  }
  return context;
}