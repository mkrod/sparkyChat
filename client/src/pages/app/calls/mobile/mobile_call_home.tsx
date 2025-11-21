import { type FC, type ReactNode } from "react"
import "./css/mobile_call_home.css";
import { PiDotsThreeOutlineVertical } from 'react-icons/pi';
import { useChatProvider } from "@/constants/providers/chatProvider";
import { callTabs } from "@/constants/var_2";
import { useCallProvider } from "@/constants/providers/call_provider";
import MobileListCallCard from "@/components/app/call/mobile_call_list_card";
import PaginationControl from "@/components/utility/paginatiom_control";


const MobileCallHome: FC = (): ReactNode => {
    const { activeColor } = useChatProvider();
    const { callLogs, callLogFilter, setCallLogFilter, setCallLogPage, setFetchCallLogs } = useCallProvider();

    return (
        <div className='mobile_call_logs_container'>
            <div className="mobile_call_logs_header">
                <div className="mobile_call_logs_header_content">
                    <span className='mobile_call_logs_left'>Edit</span>
                </div>
                <div className="mobile_call_logs_header_content">
                    <span className='mobile_call_logs_center'>Calls</span>
                </div>
                <div className="mobile_call_logs_header_content">
                    <div className='mobile_call_logs_right'>
                        <PiDotsThreeOutlineVertical size={20} />
                    </div>
                </div>
            </div>
            <div style={{
                background: activeColor.fadedBorder
            }} className="mobile_calls_logs_tabs_container">
                {callTabs.map((tab) => (
                    <div
                        style={{
                            background: callLogFilter === tab.code ? "var(--app-accent)" : 'transparent',
                            color: callLogFilter === tab.code ? "whitesmoke" : activeColor.textFade,
                            boxShadow: callLogFilter === tab.code ? `0 0 15px ${activeColor.fadedBorder}` : 'none',
                        }}
                        key={tab.code}
                        onClick={() => {
                            setCallLogFilter(tab.code);
                            setFetchCallLogs(true);
                        }}
                        className="mobile_call_logs_tab"
                    >
                        <span>{tab.label}</span>
                    </div>
                ))}
            </div>

            <div className="mobile_call_logs_contents">
                {callLogs?.results.map((log) => (
                    <MobileListCallCard key={log._id} data={log} />
                ))}
            </div>
            <div
                style={{
                    padding: "0 0.5rem",
                    margin: "0.5rem 0",
                    display: "flex",
                    flexWrap: "wrap"
                }}
                className="d_call_list_pagination"
            >
                <PaginationControl
                    currentPage={callLogs?.page || 1}
                    total={callLogs?.total || 0}
                    unit={callLogs?.perPage || 5}
                    onPageChange={(page: number) => {
                        setCallLogPage(page);
                        setFetchCallLogs(true);
                    }}
                />
            </div>
        </div>
    )
}

export default MobileCallHome