import { createContext, useContext, useState, type FC } from 'react'
import type { colorScheme } from './types';
import { colors } from './vars';






interface ChatContextType {
    // Define the shape of your context here
    activeColor: colorScheme;
    isMobile: boolean;
    activity: boolean;
    setActivity: React.Dispatch<React.SetStateAction<boolean>>;
}


/////////////////////////////////////////////////////////////////
const ChatContext = createContext<ChatContextType | null>(null);
interface ChatProviderProps {
    children: React.ReactNode
}
export const ChatProvider : FC<ChatProviderProps> = ({ children }) => {

    // Detect system color scheme preference
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    //console.log(media)
    const scheme = media.matches ? "dark" : "light";
    const [activeColor, setActiveColor] = useState<colorScheme>(colors[scheme] || colors[0]); // Default to the first color scheme
    media.onchange = (e) => {
        //console.log("Media ChangedL: ", e);
        const newScheme = e.matches ? "dark" : "light";
        setActiveColor(colors[newScheme] || colors[0]);
    };

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
    const [activity, setActivity] = useState<boolean>(false);


  return (
    <ChatContext.Provider 
    value={{
        activeColor,
        isMobile,
        activity,
        setActivity
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