import { createContext, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { AllFriendsType, AllRequestsType, AllUsersType, Response } from "../types";
import { fetchAllUserRequests, fetchAllUsers, fetchUserFriends } from "../user/controller";
import { useChatProvider } from "./chatProvider";


interface PeopleContextType {
    allUsers: AllUsersType | undefined;
    fetchUsers: boolean;
    setFetchUsers: Dispatch<SetStateAction<boolean>>;
    setPage: Dispatch<SetStateAction<number>>;
    friendRequests: AllRequestsType | undefined;
    fetchFriendRequests: boolean;
    setFetchFriendRequests: Dispatch<SetStateAction<boolean>>;
    setRequestPage: Dispatch<SetStateAction<number>>;
    friends: AllFriendsType | undefined;
    fetchFriends: boolean;
    setFetchFriends: Dispatch<SetStateAction<boolean>>;
    setFriendsPage: Dispatch<SetStateAction<number>>;
}

const PeopleContext = createContext<PeopleContextType | null>(null);

export const PeopleProvider = ({ children }: { children: ReactNode }) => {

    const { nameFilter } = useChatProvider();

    //get all users
    const [allUsers, setAllusers] = useState<AllUsersType | undefined>(undefined);
    const [fetchUsers, setFetchUsers] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);

    useEffect(() => {
        if (!fetchUsers) return;
        fetchAllUsers(page, nameFilter)
            .then((res: Response) => {
                setAllusers(res.data as AllUsersType)
                console.log(res)
            })
            .catch((err) => console.log("Cannot fetch all users: ", err))
            .finally(() => {
                setFetchUsers(false);
            })

    }, [fetchUsers, page, nameFilter]);

    /// frienRequestsList
    const [friendRequests, setFriendRequests] = useState<AllRequestsType | undefined>(undefined);
    const [fetchFriendRequests, setFetchFriendRequests] = useState<boolean>(false);
    const [requestPage, setRequestPage] = useState<number>(1);

    useEffect(() => {
        if (!fetchFriendRequests) return;
        fetchAllUserRequests(requestPage, nameFilter)
            .then((res: Response) => {
                setFriendRequests(res.data as AllRequestsType)
                console.log(res)
            })
            .catch((err) => console.log("Cannot fetch all request: ", err))
            .finally(() => {
                setFetchFriendRequests(false);
            })

    }, [fetchFriendRequests, requestPage, nameFilter]);

    //////friends
    const [friends, setFriends] = useState<AllFriendsType | undefined>(undefined);
    const [fetchFriends, setFetchFriends] = useState<boolean>(false);
    const [friendsPage, setFriendsPage] = useState<number>(1);

    useEffect(() => {
        if (!fetchFriends) return;
        fetchUserFriends(friendsPage, nameFilter)
            .then((res: Response) => {
                setFriends(res.data as AllFriendsType)
                console.log(res)
            })
            .catch((err) => console.log("Cannot fetch all friends: ", err))
            .finally(() => {
                setFetchFriends(false);
            })

    }, [fetchFriends, friendRequests, nameFilter]);


    return (
        <PeopleContext.Provider value={{
            allUsers,
            fetchUsers,
            setFetchUsers,
            setPage,
            friendRequests,
            fetchFriendRequests,
            setFetchFriendRequests,
            setRequestPage,
            friends,
            fetchFriends,
            setFetchFriends,
            setFriendsPage
        }}>
            {children}
        </PeopleContext.Provider>
    )
}

export const usePeopleProvider = () => {
    const context = useContext(PeopleContext);
    if (!context) throw Error("usePeopleProvider Must be used within PeopleProvider");
    return context;
}