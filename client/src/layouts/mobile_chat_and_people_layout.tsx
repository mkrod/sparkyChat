import { useDataProvider } from '@/constants/providers/data_provider'
import PeopleScreen from '@/pages/app/desktop/people_screen'
import MobileChatList from '@/pages/app/mobile/chat_list'
import { useState, type FC, type JSX } from 'react'
import "./css/mobile_chat_and_people_layout.css";

const MobileChatnPeopleLayout: FC = (): JSX.Element => {


    const { messagesList } = useDataProvider();
    const [openPeople, setOpenPeople] = useState<boolean>(false);



    return (
        <div className="mobile_home_chat_list_and_people_layout_container">
            {(!openPeople && messagesList.length > 0) && <MobileChatList visibitySetter={setOpenPeople} />}
            {(openPeople || messagesList.length === 0) && (<PeopleScreen visibitySetter={setOpenPeople} />)}
        </div>
    )
}

export default MobileChatnPeopleLayout