import { usePeopleProvider } from '@/constants/providers/people_provider'
import { useEffect, type FC, type JSX } from 'react'
import UserListCard from './user_list_card';
import type { UserList } from '@/constants/types';
import "./css/user_list.css";
import ActivityIndicator from '@/components/utility/activity_indicator';

const UsersList: FC = (): JSX.Element => {



    const { allUsers, fetchUsers, setFetchUsers, setPage } = usePeopleProvider();
    useEffect(() => {
        setFetchUsers(true) //on mount, fetch
        return () => setFetchUsers(false); // clean up
    }, [])


    return (
        <div className='user_list_container'>
            <div className="user_list_list_container">
                {allUsers?.results.map((user: UserList, idx: number) => (
                    <UserListCard key={`${idx} ${user.user_id}`} user={user} />
                ))}
            </div>
            {fetchUsers &&
                (<div className="user_list_pagination_controller_container">
                    <ActivityIndicator size='small' color='var(--app-accent)' style='spin' />
                </div>)}
        </div>
    )
}

export default UsersList