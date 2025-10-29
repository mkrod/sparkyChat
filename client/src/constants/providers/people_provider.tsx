import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { AllUsersType, Response } from "../types";
import { fetchAllUsers } from "../user/controller";
import { useChatProvider } from "./chatProvider";


interface PeopleContextType {
    allUsers: AllUsersType | undefined;
    fetchUsers: boolean;
    setFetchUsers: Dispatch<SetStateAction<boolean>>;
    setPage: Dispatch<SetStateAction<number>>;
}

const PeopleContext = createContext<PeopleContextType | null>(null);

export const PeopleProvider = ({ children }: { children: ReactNode }) => {

    const { nameFilter } = useChatProvider();

    //get all users
    const [allUsers, setAllusers] = useState<AllUsersType | undefined>(undefined);
    const [fetchUsers, setFetchUsers] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        if(!fetchUsers) return;
        fetchAllUsers(page, nameFilter)
        .then((res:Response) => {
            setAllusers(res.data as AllUsersType)
            console.log(res)
        })
        .catch((err) => console.log("Cannot fetch all users: ", err))
        .finally(() => {
            setFetchUsers(false);
        })

    }, [fetchUsers, page, nameFilter]);

    return (
        <PeopleContext.Provider value={{
            allUsers,
            fetchUsers,
            setFetchUsers,
            setPage,
        }}>
            {children}
        </PeopleContext.Provider>
    )
}

export const usePeopleProvider = () => {
    const context = useContext(PeopleContext);
    if(!context) throw Error("usePeopleProvider Must be used within PeopleProvider");
    return context;
}