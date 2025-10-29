import ActivityIndicator from '@/components/utility/activity_indicator';
import { useChatProvider } from '@/constants/providers/chatProvider';
import { useDataProvider } from '@/constants/providers/data_provider';
import { usePeopleProvider } from '@/constants/providers/people_provider';
import type { FriendList } from '@/constants/types'
import { removeUserAsFriend } from '@/constants/user/controller';
import { proxyImage } from '@/constants/var_2';
import { presenceColor } from '@/constants/vars';
import { useState, type FC, type JSX } from 'react'
import { FcCancel } from 'react-icons/fc';
import { TbMessage2 } from 'react-icons/tb';

interface Props {
    friend: FriendList;
}

const FriendListCard: FC<Props> = ({ friend }): JSX.Element => {

    const { activeColor } = useChatProvider();
    const { setCurrentChatId } = useDataProvider();
    const { setFetchFriends } = usePeopleProvider();
    const names = `${friend.name.first} ${friend.name.last}`;
    const [dpLoading, setDpLoading] = useState<boolean>(true);
    const [isRemoving, setIsRemoving] = useState<boolean>(false);

    const handleUnfriend = () => {
        if (isRemoving) return;
        setIsRemoving(true);

        removeUserAsFriend(friend.user_id)
            .then((res) => {
                if (res.status === 200) {
                    //success
                    //refresh
                    setFetchFriends(true);
                }
            })
    }

    return (
        <div style={{ borderColor: activeColor.fadedBorder }} className='user_list_card_container'>
            <div
                style={{
                    borderColor: activeColor.fadedBorder,
                    color: activeColor.text,
                }}
                className="user_list_card_picture_container"
            >
                <img
                    onLoad={() => setDpLoading(false)}
                    src={proxyImage(friend.picture)}
                    className='user_list_card_picture'
                />
                {dpLoading && (
                    <div
                        style={{ background: activeColor.background }}
                        className='user_list_card_picture_loading'
                    >
                        <ActivityIndicator size='small' color='var(--app-accent)' style='spin' />
                    </div>
                )}
                <div
                    style={{ backgroundColor: presenceColor[friend.presence.status] }}
                    className='user_list_card_picture_presence'
                />
            </div>

            <div className="user_list_card_name_others_container">
                <div style={{ color: activeColor.textFade }} className="user_list_card_name_container">
                    {names}
                </div>
                <div className="user_list_card_others_container">
                    {friend.mutual_friends.length > 0 && (
                        <span className='user_list_card_others_mutual'>
                            {friend.mutual_friends.length} Mutual Friends
                        </span>
                    )}
                </div>
            </div>

            <div className="user_list_card_button_container">
                <button
                    onClick={() => {
                        setCurrentChatId(friend.user_id)
                    }}
                    style={{
                        borderColor: activeColor.fadedBorder,
                        color: activeColor.text,
                        boxShadow: "0 0 10px 2px " + activeColor.fadedBorder,
                    }}
                    className='user_list_card_button'
                >
                    Message
                    <TbMessage2 size={12} />
                </button>

                <button
                    onClick={handleUnfriend}
                    style={{
                        borderColor: activeColor.fadedBorder,
                        color: activeColor.text,
                        boxShadow: "0 0 10px 2px " + activeColor.fadedBorder,
                    }}
                    className='user_list_card_button_second'
                >
                    {!isRemoving && <FcCancel title='unfriend' size={12} />}
                    {isRemoving && <ActivityIndicator style='spin' color='var(--app-accent)' />}
                </button>
            </div>
        </div>
    );
}

export default FriendListCard