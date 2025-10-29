import { usePeopleProvider } from '@/constants/providers/people_provider'
import { useEffect, type FC, type JSX } from 'react'
import UserListCard from './user_list_card';
import type { UserList } from '@/constants/types';
import "./css/user_list.css";
import ActivityIndicator from '@/components/utility/activity_indicator';

interface Props {
    container: HTMLDivElement | null;
}

const UsersList: FC<Props> = ({ container }): JSX.Element => {



    const { allUsers, fetchUsers, setFetchUsers, setPage } = usePeopleProvider();
    useEffect(() => {
        setFetchUsers(true) //on mount, fetch
        return () => setFetchUsers(false); // clean up
    }, [])

    useEffect(() => {
        if(!container) return;

        const handleScroll = () => {
            
            const { scrollHeight, scrollTop, clientHeight } = container;

            if(scrollHeight <= (scrollTop + clientHeight)){ //bottom
                if(fetchUsers || !allUsers) return;
                if(allUsers.totalPages <= allUsers.page) return;
                setPage((prev) => {
                    if(prev < allUsers.totalPages){
                        container.scrollTo({ top: 2, behavior: "instant" });
                        return prev + 1
                    }else{
                        return prev
                    }
                });
                setFetchUsers(true);
            }
            
            if(scrollTop === 0){ //top
                if(fetchUsers || !allUsers) return;
                if(allUsers.page === 1) return;
                setPage((prev) => {
                    if(prev > 1){
                        container.scrollTo({ top: 0, behavior: "instant" });
                        return prev - 1
                    }else{
                        return prev
                    }
                });
                setFetchUsers(true);
            }
        }
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [container, allUsers]);


    return (
        <div className='user_list_container'>
            <div className="user_list_list_container">
                {
                    allUsers?.results.map((user: UserList, idx: number) => (
                        <UserListCard key={`${idx} ${user.user_id}`} user={user} />
                    ))
                }
            </div>
            {fetchUsers &&
                (
                    <div className="user_list_pagination_controller_container">
                        <ActivityIndicator size='small' color='var(--app-accent)' style='spin' />
                    </div>
                )
            }
        </div>
    )
}

export default UsersList