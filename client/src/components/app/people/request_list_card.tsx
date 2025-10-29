import type { RequestList } from '@/constants/types'
import { useState, type FC, type JSX } from 'react'
import "./css/request_list_card.css";
import { useChatProvider } from '@/constants/providers/chatProvider';
import { usePeopleProvider } from '@/constants/providers/people_provider';
import { proxyImage } from '@/constants/var_2';
import ActivityIndicator from '@/components/utility/activity_indicator';
import { presenceColor } from '@/constants/vars';
import { TbUserQuestion } from 'react-icons/tb';
import { FcCancel } from 'react-icons/fc';
import { acceptUserRequest, declineUserRequest } from '@/constants/user/controller';

interface Props {
    request: RequestList;
}
const RequestListCard: FC<Props> = ({ request }): JSX.Element => {

    const { requester } = request;
    const { activeColor } = useChatProvider();
    const { setFetchFriendRequests } = usePeopleProvider();
    const names = `${requester.name.first} ${requester.name.last}`;
    const [dpLoading, setDpLoading] = useState<boolean>(true);
    const [isAccepting, setIsAccepting] = useState<boolean>(false);
    const [isRejecting, setIsRejecting] = useState<boolean>(false);


    const handleAccept = () => {
        if (isAccepting) return;
        setIsAccepting(true);

        acceptUserRequest(requester.user_id)
            .then((res) => {
                if (res.status === 200) {
                    //success
                    //refresh
                    setFetchFriendRequests(true);
                }
            })
    }
    const handleReject = () => {
        if (isRejecting) return;
        setIsRejecting(true);

        declineUserRequest(requester.user_id)
            .then((res) => {
                if (res.status === 200) {
                    //success
                    //refresh
                    setFetchFriendRequests(true);
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
                    src={proxyImage(requester.picture)}
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
                    style={{ backgroundColor: presenceColor[requester.presence.status] }}
                    className='user_list_card_picture_presence'
                />
            </div>

            <div className="user_list_card_name_others_container">
                <div style={{ color: activeColor.textFade }} className="user_list_card_name_container">
                    {names}
                </div>
                <div className="user_list_card_others_container">
                    {request.mutual_friends.length > 0 && (
                        <span className='user_list_card_others_mutual'>
                            {request.mutual_friends.length} Mutual Friends
                        </span>
                    )}
                </div>
            </div>

            <div className="user_list_card_button_container">
                <button
                    onClick={handleAccept}
                    style={{
                        borderColor: activeColor.fadedBorder,
                        color: activeColor.text,
                        boxShadow: "0 0 10px 2px " + activeColor.fadedBorder,
                    }}
                    className='user_list_card_button'
                >
                    {!isAccepting && "Accept"}
                    {!isAccepting && <TbUserQuestion size={12} />}
                    {isAccepting && <ActivityIndicator style='spin' color='var(--app-accent)' />}
                </button>

                <button
                    onClick={handleReject}
                    style={{
                        borderColor: activeColor.fadedBorder,
                        color: activeColor.text,
                        boxShadow: "0 0 10px 2px " + activeColor.fadedBorder,
                    }}
                    className='user_list_card_button_second'
                >
                    {!isRejecting && <FcCancel size={12} />}
                    {isRejecting && <ActivityIndicator style='spin' color='var(--app-accent)' />}
                </button>
            </div>
        </div>
    );
}

export default RequestListCard