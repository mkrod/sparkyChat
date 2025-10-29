import ActivityIndicator from '@/components/utility/activity_indicator'
import type { UserList } from '@/constants/types'
import { proxyImage } from '@/constants/var_2'
import { presenceColor } from '@/constants/vars'
import { useEffect, useState, type FC, type JSX } from 'react'
import { TbMessage2, TbUserPlus, TbUserCheck, TbUserQuestion } from 'react-icons/tb'
import "./css/user_list_card.css";
import { useChatProvider } from '@/constants/providers/chatProvider'
import { cancelSentRequest, sendFriendRequest } from '@/constants/user/controller'
import { usePeopleProvider } from '@/constants/providers/people_provider'

interface Prop {
  user: UserList
}

const UserListCard: FC<Prop> = ({ user }): JSX.Element => {
  const { activeColor } = useChatProvider();
  const { setFetchUsers } = usePeopleProvider();
  const names = `${user.name.first} ${user.name.last}`;
  const [dpLoading, setDpLoading] = useState<boolean>(true);
  const [isAction, setIsAction] = useState<boolean>(false);

  // derive relationship state
  const relationship = user.friends
    ? 'friends'
    : user.requested
      ? 'requested'
      : user.incoming_request
        ? 'pending'
        : 'none';

  const handleAction = () => {
    if (isAction) return;
    setIsAction(true);


    switch (relationship) {
      case 'friends':
        // open chat
        break;
      case 'requested':
        // cancel friend request
        cancelSentRequest(user.user_id)
          .then((res) => {
            if (res.status === 200) {
              //success
              //refresh
              setFetchUsers(true);
            }
          })

        break;
      case 'pending':
        // accept friend request
        break;
      case 'none':
        // send friend request
        sendFriendRequest(user.user_id)
          .then((res) => {
            if (res.status === 200) {
              //success
              //refresh
              setFetchUsers(true);
            }
          })
        break;
    }
  };

  const getButtonIcon = () => {
    switch (relationship) {
      case 'friends':
        return <TbMessage2 size={12} />;
      case 'requested':
        return <TbUserCheck size={12} />;
      case 'pending':
        return <TbUserQuestion size={12} />;
      default:
        return <TbUserPlus size={12} />;
    }
  };

  const getButtonText = () => {
    switch (relationship) {
      case 'friends':
        return 'Message';
      case 'requested':
        return 'Requested';
      case 'pending':
        return 'Accept';
      default:
        return 'Add';
    }
  };

  useEffect(() => {
    setIsAction(false);
  }, [user]);

  //note:
  //1, press button
  //2, server return status 200 on success
  //3, callback .then() call setFetchUser(true)
       //to update list
  //4, useEffect on user changed, falsify the Loading aninmation by setIsAction(false);
  
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
          src={proxyImage(user.picture)}
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
          style={{ backgroundColor: presenceColor[user.presence.status] }}
          className='user_list_card_picture_presence'
        />
      </div>

      <div className="user_list_card_name_others_container">
        <div style={{ color: activeColor.textFade }} className="user_list_card_name_container">
          {names}
        </div>
        <div className="user_list_card_others_container">
          {user.mutual_friends.length > 0 && (
            <span className='user_list_card_others_mutual'>
              {user.mutual_friends.length} Mutual Friends
            </span>
          )}
        </div>
      </div>

      <div className="user_list_card_button_container">
        <button
          onClick={handleAction}
          style={{
            borderColor: activeColor.fadedBorder,
            color: activeColor.text,
            boxShadow: "0 0 10px 2px " + activeColor.fadedBorder,
          }}
          className='user_list_card_button'
        >
          {!isAction && getButtonText()}
          {!isAction && getButtonIcon()}
          {isAction && <ActivityIndicator style='spin' color='var(--app-accent)' />}
        </button>
      </div>
    </div>
  );
};

export default UserListCard;
