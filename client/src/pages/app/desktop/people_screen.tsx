import { useChatProvider } from '@/constants/providers/chatProvider';
import { useDataProvider } from '@/constants/providers/data_provider';
import type { UserListTab } from '@/constants/types';
import { userListTabs } from '@/constants/var_2';
import { useRef, useState, type Dispatch, type FC, type JSX, type KeyboardEvent, type SetStateAction } from 'react'
import { IoSearch } from 'react-icons/io5';
import "./css/people_screen.css";
import UsersList from '@/components/app/people/users_list';
import { usePeopleProvider } from '@/constants/providers/people_provider';
import ActivityIndicator from '@/components/utility/activity_indicator';
import RequestsList from '@/components/app/people/request_list';
import FriendsList from '@/components/app/people/friend_list';
import GroupsList from '@/components/app/people/groups_list';

const PeopleScreen: FC<{ visibitySetter: Dispatch<SetStateAction<boolean>> }> = ({ visibitySetter }): JSX.Element => {

    const { messagesList } = useDataProvider();
    const { activeColor, nameFilter, setNameFilter, isMobile } = useChatProvider();
    const { fetchUsers, fetchFriendRequests, fetchFriends, setFetchUsers, friendRequests } = usePeopleProvider();
    const searchRef = useRef<HTMLInputElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    //const [searchTerm, setSearchTerm] = useState<string>("")
    const [activeTab, setActiveTab] = useState<UserListTab>(userListTabs[0]);
    const isActiveTab = (tab: UserListTab) => tab.code === activeTab.code;



    return (
        <div className='users_list_container'>
            <div style={{
                padding: isMobile ? "2rem var(--mobile-padding-hor)" : ""
            }} className="chat_list_header">
                <div className="chat_list_header_search_container">
                    <IoSearch color={activeColor.textFade} />
                    <input type='text'
                        ref={searchRef}
                        style={{ color: activeColor.textFade }}
                        placeholder='Search'
                        className='chat_list_search_box'
                        value={nameFilter}
                        onChange={(e) => {
                            setNameFilter(e.target.value);
                            e.target.value.trim() === "" && setFetchUsers(true);
                        }}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                            //console.log(e.key)
                            if (e.key === "Enter") {
                                setFetchUsers(true);
                            }
                        }}
                    />
                </div>
                {(fetchUsers || fetchFriends || fetchFriendRequests) && <ActivityIndicator style='spin' color='var(--app-accent)' size='small' />}
                {messagesList.length > 0 &&
                    (<div onClick={() => visibitySetter(false)} className="user_list_header_close">
                        close
                    </div>)}
            </div>

            <div className='user_list_tabs_container'>
                {userListTabs.map((ut: UserListTab, index: number) => (

                    <div
                        style={{
                            color: isActiveTab(ut) ?
                                "var(--app-accent)" :
                                activeColor.textFade
                        }}
                        key={index}
                        onClick={() => setActiveTab(ut)}
                        className={`user_list_tab_container ${isActiveTab(ut) ? "active" : ""}`}
                    >
                        {ut.label}
                        {ut.code === "requests" && friendRequests?.results && friendRequests.results.length > 0 && (
                            <div className='user_list_tabs_count'>
                                {friendRequests.results.length}
                            </div>)}
                    </div>
                ))}
            </div>

            <div ref={containerRef} className='user_tab_screens_container'>
                {activeTab.code === "add_friends" && <UsersList container={containerRef.current} />}
                {activeTab.code === "requests" && <RequestsList container={containerRef.current} />}
                {activeTab.code === "friends" && <FriendsList container={containerRef.current} />}
                {activeTab.code === "groups" && <GroupsList container={containerRef.current} />}
            </div>
        </div>
    )
}

export default PeopleScreen