import { useEffect, type FC, type JSX } from 'react';
import "./css/request_list.css";
import { usePeopleProvider } from '@/constants/providers/people_provider';
import type { RequestList } from '@/constants/types';
import ActivityIndicator from '@/components/utility/activity_indicator';
import RequestListCard from './request_list_card';
import EmptyList from './empty_list';


interface Props {
    container: HTMLDivElement | null;
}

const RequestsList: FC<Props> = ({ container }): JSX.Element => {

    const { friendRequests, fetchFriendRequests, setFetchFriendRequests, setRequestPage } = usePeopleProvider();
    useEffect(() => {
        setFetchFriendRequests(true) //on mount, fetch
        return () => setFetchFriendRequests(false); // clean up
    }, [])

    useEffect(() => {
        if (!container) return;

        const handleScroll = () => {

            const { scrollHeight, scrollTop, clientHeight } = container;

            if (scrollHeight <= (scrollTop + clientHeight)) { //bottom
                if (fetchFriendRequests || !friendRequests) return;
                if (friendRequests.totalPages <= friendRequests.page) return;
                setRequestPage((prev) => {
                    if (prev < friendRequests.totalPages) {
                        container.scrollTo({ top: 2, behavior: "instant" });
                        return prev + 1
                    } else {
                        return prev
                    }
                });
                setFetchFriendRequests(true);
            }

            if (scrollTop === 0) { //top
                if (fetchFriendRequests || !friendRequests) return;
                if (friendRequests.page === 1) return;
                setRequestPage((prev) => {
                    if (prev > 1) {
                        container.scrollTo({ top: 0, behavior: "instant" });
                        return prev - 1
                    } else {
                        return prev
                    }
                });
                setFetchFriendRequests(true);
            }
        }
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [container, friendRequests]);

    return (
        <div className='user_list_container'>
            <div className="user_list_list_container">
                {
                    friendRequests?.results.map((req: RequestList, idx: number) => (
                        <RequestListCard key={`${idx} ${req.requester.user_id}`} request={req} />
                    ))
                }
                {
                    friendRequests?.total === 0 && <EmptyList title="No pending Request" />
                }
            </div>
            {fetchFriendRequests &&
                (
                    <div className="user_list_pagination_controller_container">
                        <ActivityIndicator size='small' color='var(--app-accent)' style='spin' />
                    </div>
                )
            }
        </div>
    )
}

export default RequestsList;