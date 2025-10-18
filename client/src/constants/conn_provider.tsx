import { createContext, useContext, useEffect, useState, type Dispatch, type FC, type SetStateAction } from 'react'
import { type Response, type User } from './types';
import { fetchUserData } from './user/controller';
import { defaultUserObject } from './vars';


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