import { usePeopleProvider } from '@/constants/providers/people_provider'
import { useEffect, type FC, type JSX } from 'react'
import type { FriendList } from '@/constants/types';
import "./css/user_list.css";
import ActivityIndicator from '@/components/utility/activity_indicator';
import EmptyList from './empty_list';
import FriendListCard from './friend_list_card';

interface Props {
    container: HTMLDivElement | null;
}

const FriendsList: FC<Props> = ({ container }): JSX.Element => {



    const { friends, fetchFriends, setFetchFriends, setFriendsPage } = usePeopleProvider();
    useEffect(() => {
        setFetchFriends(true) //on mount, fetch
        return () => setFetchFriends(false); // clean up
    }, [])

    useEffect(() => {
        if (!container) return;

        const handleScroll = () => {

            const { scrollHeight, scrollTop, clientHeight } = container;

            if (scrollHeight <= (scrollTop + clientHeight)) { //bottom
                if (fetchFriends || !friends) return;
                if (friends.totalPages <= friends.page) return;
                setFriendsPage((prev) => {
                    if (prev < friends.totalPages) {
                        container.scrollTo({ top: 2, behavior: "instant" });
                        return prev + 1
                    } else {
                        return prev
                    }
                });
                setFetchFriends(true);
            }

            if (scrollTop === 0) { //top
                if (fetchFriends || !friends) return;
                if (friends.page === 1) return;
                setFriendsPage((prev) => {
                    if (prev > 1) {
                        container.scrollTo({ top: 0, behavior: "instant" });
                        return prev - 1
                    } else {
                        return prev
                    }
                });
                setFetchFriends(true);
            }
        }
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [container, friends]);


    return (
        <div className='user_list_container'>
            <div className="user_list_list_container">
                {friends?.results && friends?.results.length > 0 && 
                    friends?.results.map((f: FriendList, idx: number) => (
                        <FriendListCard key={`${idx} ${f.user_id}`} friend={f} />
                    ))
                }
                {
                    friends?.results.length === 0 && <EmptyList title="You have no Friend" />
                }
            </div>
            {fetchFriends &&
                (
                    <div className="user_list_pagination_controller_container">
                        <ActivityIndicator size='small' color='var(--app-accent)' style='spin' />
                    </div>
                )
            }
        </div>
    )
}

export default FriendsList