import { usePeopleProvider } from '@/constants/providers/people_provider'
import { useEffect, type FC, type JSX } from 'react'
import UserListCard from './user_list_card';
import type { UserList } from '@/constants/types';
import "./css/user_list.css";
import EmptyList from './empty_list';
import { useChatProvider } from '@/constants/providers/chatProvider';
import PaginationControl from '@/components/utility/paginatiom_control';

interface Props {
    container: HTMLDivElement | null;
}

const UsersList: FC<Props> = ({ container }): JSX.Element => {
    const { isMobile } = useChatProvider();


    const { allUsers, setFetchUsers, setPage, page } = usePeopleProvider();
    useEffect(() => {
        setFetchUsers(true) //on mount, fetch
        return () => setFetchUsers(false); // clean up
    }, [])


    return (
        <div className='user_list_container'>
            <div style={{
                gap: isMobile ? "1rem" : "0.3rem",
                marginTop: "1rem"
            }} className="user_list_list_container">
                {
                    allUsers?.results.map((user: UserList, idx: number) => (
                        <UserListCard key={`${idx} ${user.user_id}`} user={user} />
                    ))
                }
                {
                    allUsers?.total === 0 && <EmptyList title="No pending Request" />
                }
            </div>
            {allUsers && allUsers.totalPages > 1 && <div className='page_pagination_container'>
                <PaginationControl 
                currentPage={page}
                total={allUsers?.total||0}
                unit={allUsers?.perPage||0}
                onPageChange={(page) => {
                    setPage(page);
                    setFetchUsers(true);
                    container?.scrollTo({ top: 0, behavior: "instant" });
                }}
                />
            </div>}
        </div>
    )
}

export default UsersList