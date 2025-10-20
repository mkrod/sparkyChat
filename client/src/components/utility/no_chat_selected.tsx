import type { FC, JSX } from "react";
import "./css/no_chat_selected.css";

const NoChatSelected: FC = (): JSX.Element => {


    return (
        <div className="no_chat_selected_container">
            <img src="/chat_no_select.png" className="no_chat_selected_img" />
            <div className="no_chat_selected_text">
                <span>You haven't opened any message yet</span>
                <span>Please select a message</span>
            </div>

            <div className="no_chat_selected_button_container">
                <button className="no_chat_selected_button">Start a new chat</button>
            </div>
        </div>
    )
}

export default NoChatSelected