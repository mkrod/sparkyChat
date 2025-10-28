import ActivityIndicator from '@/components/utility/activity_indicator'
import type { UserList } from '@/constants/types'
import { proxyImage } from '@/constants/var_2'
import { presenceColor } from '@/constants/vars'
import { useState, type FC, type JSX } from 'react'
import { GiLaserSparks } from 'react-icons/gi'
import "./css/user_list_card.css";
import { useChatProvider } from '@/constants/providers/chatProvider'

interface Prop {
    user: UserList
}



const UserListCard: FC<Prop> = ({ user }): JSX.Element => {

    const { activeColor } = useChatProvider();
    const names = `${user.name.first} ${user.name.last}`;
    const [dpLoading, setDpLoading] = useState<boolean>(true);

    return (
        <div style={{ borderColor: activeColor.fadedBorder }} className='user_list_card_container'>
            <div style={{
                borderColor: activeColor.fadedBorder,
                color: activeColor.text,
            }} className="user_list_card_picture_container">
                <img 
                onLoad={() => setDpLoading(false)}
                src={proxyImage(user.picture)} className='user_list_card_picture' />
                {dpLoading &&
                    (<div style={{ background: activeColor.background }} className='user_list_card_picture_loading'>
                        <ActivityIndicator size='small' color='var(--app-accent)' style='spin' />
                    </div>)}
                <div style={{ backgroundColor: presenceColor[user.presence.status] }} className='user_list_card_picture_presence'>
                </div>
            </div>
            <div className="user_list_card_name_others_container">
                <div style={{ color: activeColor.textFade }} className="user_list_card_name_container">
                    {names}
                </div>
                <div className="user_list_card_others_container">

                </div>
            </div>
            <div className="user_list_card_button_container">
                <button style={{
                    borderColor: activeColor.fadedBorder,
                    color: activeColor.text,
                    boxShadow: "0 0 10px 2px " + activeColor.fadedBorder
                }} className='user_list_card_button'>
                    Spark
                    <GiLaserSparks size={10} />
                </button>
            </div>
        </div>
    )
}

export default UserListCard