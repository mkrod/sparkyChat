import { createContext, useContext, useEffect, useState, type Dispatch, type FC, type SetStateAction } from 'react'
import type { colorScheme, Scheme } from '../types';
import { colors } from '../vars';






interface ChatContextType {
    // Define the shape of your context here
    activeColor: colorScheme;
    isMobile: boolean;
    activity: boolean;
    setActivity: React.Dispatch<React.SetStateAction<boolean>>;
    userScheme: Scheme;
    setUserScheme: Dispatch<SetStateAction<Scheme>>;
    switchScheme: () => void;
}


/////////////////////////////////////////////////////////////////
const ChatContext = createContext<ChatContextType | null>(null);
interface ChatProviderProps {
    children: React.ReactNode
}
export const ChatProvider : FC<ChatProviderProps> = ({ children }) => {

    // Detect system color scheme preference
    const [schemeChanged, setSchemechange] = useState<boolean>(true);

    const [userScheme, setUserScheme] = useState<Scheme>("light");

    const [activeColor, setActiveColor] = useState<colorScheme>(colors[userScheme] || colors[0]); // Default to the first color scheme

    useEffect(() => {
        if(!schemeChanged) return;
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const scheme: Scheme = media.matches ? "dark" : "light";
        const preferredScheme: Scheme = (localStorage.getItem("scheme") as Scheme)||scheme;
        setUserScheme(preferredScheme);
        console.log(preferredScheme)
        setActiveColor(colors[preferredScheme])
        setSchemechange(false);
    }, [schemeChanged])




    const switchScheme = () => {
        const oldScheme = localStorage.getItem("scheme") as Scheme;
        const newScheme = oldScheme === "dark" ? "light" : "dark";
        localStorage.setItem("scheme", newScheme);
        setSchemechange(true);
        setUserScheme(newScheme);
    }
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    ///// Responsiveness Settings ///////////////////////////////////
    const mobileSize = 770; // Define your mobile size threshold
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < mobileSize);
    window.addEventListener('resize', () => {
        setIsMobile(window.innerWidth < mobileSize);
    });
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    const [activity, setActivity] = useState<boolean>(true);


  return (
    <ChatContext.Provider 
    value={{
        activeColor,
        isMobile,
        activity,
        setActivity,
        userScheme,
        setUserScheme,
        switchScheme
    }}>
        { children }
    </ChatContext.Provider>
  )
}

export const useChatProvider = () => {
    const context = useContext(ChatContext);
    if(!context) {
        throw new Error('useChatProvider must be used within a ChatProvider')
    }
    return context;
}