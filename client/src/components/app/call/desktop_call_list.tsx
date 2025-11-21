import { type FC, type ReactNode } from 'react';
import "./css/desktop_call_list.css";
import { IoSearch } from 'react-icons/io5';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { useCallProvider } from '@/constants/providers/call_provider';
import DesktopCallListCard from './desktop_call_list_card';
import PaginationControl from '@/components/utility/paginatiom_control';



const DesktopCallList: FC = (): ReactNode => {
    const { activeColor } = useChatProvider();
    const { callLogs, setCallLogPage } = useCallProvider();


    return (
        <div
            style={{
                borderColor: activeColor.fadedBorder
            }}
            className='d_call_list_container'
        >
            <div className="d_call_list_header">
                <div className="d_call_list_left">
                    <div className="d_call_list_search_container">
                        <div className="d_call_list_search_icon">
                            <IoSearch />
                        </div>
                        <input placeholder='Search' type="text" className="d_call_list_search_input" />
                    </div>
                </div>
                <div className="d_call_list_right">
                    Sorting
                </div>
            </div>
            <div className="d_call_list_content_container">
                <div
                    style={{
                        borderColor: activeColor.fadedBorder
                    }}
                    className="d_call_list_content_labels"
                >
                    <div className="d_call_list_content_label name">Name</div>
                    <div className="d_call_list_content_label email">Email</div>
                    <div className="d_call_list_content_label time">Timestamp</div>
                    <div className="d_call_list_content_label dur">Duration</div>
                    <div className="d_call_list_content_label type">Type</div>
                    <div className="d_call_list_content_label status">Status</div>
                    <div className="d_call_list_content_label action">Action</div>
                </div>
                <div className="d_call_list_content">
                    {callLogs?.results.map((cl) => (
                        <DesktopCallListCard key={cl.callId} callLog={cl} />
                    ))}
                </div>
                <div
                    style={{ padding: "0 0.5rem", marginTop: "0.5rem" }}
                    className="d_call_list_pagination"
                >
                    <PaginationControl
                        currentPage={callLogs?.page || 1}
                        total={callLogs?.total || 0}
                        unit={callLogs?.perPage || 5}
                        onPageChange={(page: number) => setCallLogPage(page)}
                    />
                </div>
            </div>
        </div>
    )
}

export default DesktopCallList