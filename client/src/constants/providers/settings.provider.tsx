import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import type { Settings } from '../types';
import { defaultSettings } from '../var_2';
import { fetchSettings } from '../user/controller';

interface SettingsContextType {
    settings: Settings;
    setFetchingSettings: Dispatch<SetStateAction<boolean>>;
}

const settingsContext = createContext<SettingsContextType | null>(null);


export const SettingsProvider = ({ children }: { children: ReactNode}) => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [fetchingSettings, setFetchingSettings] = useState<boolean>(true);

    useEffect(() => {
        if(!fetchingSettings) return;

        fetchSettings()
        .then((res) => {
            //console.log(res)
            if(res.status === 200){
                setSettings(res.data as Settings);
            }
        })
        .catch(err => {
            console.log("Cannot Fetch Settings: ", err);
        })
        .finally(() => setFetchingSettings(false));
    }, [fetchingSettings]);

  return (
    <settingsContext.Provider value={{
        settings,
        setFetchingSettings
    }}>
        {children}
    </settingsContext.Provider>
  )
}

export const useSettingsProvider = () => {
    const context = useContext(settingsContext);
    if(!context) throw Error("useSettingsProvider must be used within SettingsProvider");
    return context;
}