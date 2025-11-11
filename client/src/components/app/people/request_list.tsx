import { useEffect, type FC, type JSX } from 'react';
import "./css/request_list.css";
import { usePeopleProvider } from '@/constants/providers/people_provider';
import type { RequestList } from '@/constants/types';
import RequestListCard from './request_list_card';
import EmptyList from './empty_list';
import { useChatProvider } from '@/constants/providers/chatProvider';
import PaginationControl from '@/components/utility/paginatiom_control';


interface Props {
    container: HTMLDivElement | null;
}

const RequestsList: FC<Props> = ({ container }): JSX.Element => {

    const { isMobile } = useChatProvider();
    const { friendRequests, setFetchFriendRequests, requestPage, setRequestPage } = usePeopleProvider();
    useEffect(() => {
        setFetchFriendRequests(true) //on mount, fetch
        return () => setFetchFriendRequests(false); // clean up
    }, [])


    return (
        <div className='user_list_container'>
            <div style={{
                gap: isMobile ? "1rem" : "0.3rem",
                paddingTop: "1rem"
            }} className="user_list_list_container">
                {
                    friendRequests?.results.map((req: RequestList, idx: number) => (
                        <RequestListCard key={`${idx} ${req.requester.user_id}`} request={req} />
                    ))
                }
                {
                    friendRequests?.total === 0 && <EmptyList title="No pending Request" />
                }
            </div>
            {friendRequests && friendRequests.totalPages > 1 && <div className='page_pagination_container'>
                <PaginationControl
                currentPage={requestPage}
                total={friendRequests?.total||0}
                unit={friendRequests?.perPage||0}
                onPageChange={(page) => {
                    setRequestPage(page);
                    setFetchFriendRequests(true);
                    container?.scrollTo({ top: 0, behavior: "instant" });
                }}
                />
            </div>}
        </div>
    )
}

export default RequestsList;