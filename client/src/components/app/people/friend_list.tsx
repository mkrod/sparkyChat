import { usePeopleProvider } from '@/constants/providers/people_provider'
import { useEffect, type FC, type JSX } from 'react'
import type { FriendList } from '@/constants/types';
import "./css/user_list.css";
import EmptyList from './empty_list';
import FriendListCard from './friend_list_card';
import { useChatProvider } from '@/constants/providers/chatProvider';
import PaginationControl from '@/components/utility/paginatiom_control';

interface Props {
    container: HTMLDivElement | null;
}

const FriendsList: FC<Props> = ({ container }): JSX.Element => {


    const { isMobile } = useChatProvider();
    const { friends, setFetchFriends, friendsPage, setFriendsPage } = usePeopleProvider();
    useEffect(() => {
        setFetchFriends(true) //on mount, fetch
        return () => setFetchFriends(false); // clean up
    }, [])


    return (
        <div className='user_list_container'>
            <div style={{
                gap: isMobile ? "1rem" : "0.3rem",
                paddingTop: "1rem",
            }} className="user_list_list_container">
                {friends?.results && friends?.results.length > 0 &&
                    friends?.results.map((f: FriendList, idx: number) => (
                        <FriendListCard key={`${idx} ${f.user_id}`} friend={f} />
                    ))
                }
                {
                    friends?.results.length === 0 && <EmptyList title="You have no Friend" />
                }
            </div>
            {friends && friends.totalPages > 1 && <div className='page_pagination_container'>
                <PaginationControl
                currentPage={friendsPage}
                total={friends?.total||0}
                unit={friends?.perPage||0}
                onPageChange={(page) => {
                    setFriendsPage(page);
                    setFetchFriends(true);
                    container?.scrollTo({ top: 0, behavior: "instant" });
                }}
                />
            </div>}
        </div>
    )
}

export default FriendsList