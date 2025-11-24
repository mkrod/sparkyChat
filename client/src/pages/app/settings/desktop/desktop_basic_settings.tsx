import { useState, type FC, type ReactNode } from "react"
import "./css/desktop_basic_settings.css";
import { useChatProvider } from "@/constants/providers/chatProvider";
import ImageViewer from "@/components/utility/viewable_image";
import { useConnProvider } from "@/constants/providers/conn_provider";
import { proxyImage } from "@/constants/var_2";
import ActivityIndicator from "@/components/utility/activity_indicator";
import { type EditUser } from "@/constants/types";
import { defaultEditUserObject } from "@/constants/vars";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { updateReadReciept, updateUserDetails } from "@/constants/user/controller";


const DesktopBasicSettings: FC = (): ReactNode => {

  const { activeColor, setPrompt } = useChatProvider();
  const { user, setFetchingUser } = useConnProvider();
  const [isDpLoading, setIsDpLoading] = useState<boolean>(true);
  const [edit, setEdit] = useState<EditUser>(defaultEditUserObject);
  const [passwordFieldType, setPasswordFieldType] = useState<"password" | "text">("password");
  const [updatingReadReciept, setUpdatingReadReciept] = useState<boolean>(false);
  const [updatingDetails, setUpdatingDetails] = useState<boolean>(false);

  const update = async () => {
    setUpdatingDetails(true);
  
    const filtered: Record<string, any> = {};
  
    for (const [key, value] of Object.entries(edit)) {
      // STRING
      if (typeof value === "string") {
        if (value.trim() !== "") {
          filtered[key] = value.trim();
        }
        continue;
      }
  
      // OBJECT (one level)
      if (typeof value === "object" && value !== null) {
        const inner = Object.fromEntries(
          Object.entries(value).filter(([_, v]) =>
            typeof v === "string" ? v.trim() !== "" : v === true
          )
        );
  
        if (Object.keys(inner).length > 0) {
          filtered[key] = inner;
        }
      }
    }
  
    if (Object.keys(filtered).length === 0) {
      setPrompt({ type: "error", title: "Invalid" });
      setUpdatingDetails(false);
      return;
    }
  
    setPrompt({ type: "success", title: "Valid" });
    //do validation before update
    //password for auth_method == "password"
    //otp for others in popup, draggable window, goodbye!
    //updateUserDetails(filtered as EditUser);
    setUpdatingDetails(false);
  };
  


  return (
    <div className="d_basic_settings_container">
      <div className="d_basic_settings_header">
        <span className="d_basic_settings_header_text">My Account</span>
        <span style={{ color: activeColor.textFadeSecondary }} className="d_basic_settings_header_sub_text">Manage your account information such as your email, password, and personal details</span>
      </div>

      <div className="d_basic_settings_content">
        <div className="d_basic_settings_content_section picture">
          <div style={{ background: activeColor.fadeBackground }} className="d_basic_settings_picture_container">
            <ImageViewer
              src={proxyImage(user.picture)}
              options={{
                thumbnailClassName: "d_basic_settings_picture",
                rounded: true,
                height: "5rem",
                width: "5rem"
              }}
              onload={() => setIsDpLoading(false)}
            />
            {isDpLoading && <div style={{ position: "absolute" }}><ActivityIndicator color="var(--app-accent)" style="spin" /></div>}
          </div>
          <div className="d_basic_settings_picture_int">
            <button className="d_basic_settings_change_dp_button">Change Avatar</button>
            <span style={{ color: activeColor.textFade, fontWeight: 600, fontSize: "0.7rem" }} className="d_basic_settings_header_sub_text">Atleast 800x 800px recommended. JPG, PNG allowed</span>
          </div>
        </div>


        <div className="d_basic_settings_content_section dual_field">
          <div className="d_basic_settings_field_container">
            <span style={{ color: activeColor.text }} className="d_basic_settings_field_label">First Name</span>
            <div style={{ background: activeColor.fadeBackground }} className="d_basic_settings_field_input_container">
              <input
                placeholder={user.name.first}
                style={{ color: activeColor.textFade }}
                type="text"
                className="d_basic_settings_field"
                value={edit.name.first}
                onChange={(e) => setEdit({ ...edit, name: { ...edit.name, first: e.target.value } })}
              />
            </div>
          </div>
          <div className="d_basic_settings_field_container">
            <span style={{ color: activeColor.text }} className="d_basic_settings_field_label">First Name</span>
            <div style={{ background: activeColor.fadeBackground }} className="d_basic_settings_field_input_container">
              <input
                placeholder={user.name.last}
                style={{ color: activeColor.textFade }}
                type="text"
                className="d_basic_settings_field"
                value={edit.name.last}
                onChange={(e) => setEdit({ ...edit, name: { ...edit.name, last: e.target.value } })}
              />
            </div>
          </div>
        </div>

        <div className="d_basic_settings_content_section dual_field">
          <div className="d_basic_settings_field_container">
            <span style={{ color: activeColor.text }} className="d_basic_settings_field_label">Username</span>
            <div style={{ background: activeColor.fadeBackground }} className="d_basic_settings_field_input_container">
              <input
                placeholder={user.username}
                style={{ color: activeColor.textFade }}
                type="text"
                className="d_basic_settings_field"
                value={edit.username}
                onChange={(e) => setEdit({ ...edit, username: e.target.value })}
              />
            </div>
          </div>
          <div className="d_basic_settings_field_container">
            <span style={{ color: activeColor.text }} className="d_basic_settings_field_label">Email</span>
            <div style={{ background: activeColor.fadeBackground }} className="d_basic_settings_field_input_container">
              <input
                disabled
                placeholder={user.email}
                style={{ color: activeColor.textFade }}
                type="text"
                className="d_basic_settings_field"
                value={edit.email}
                onChange={(e) => setEdit({ ...edit, email: e.target.value })}
              />
            </div>
          </div>
        </div>


        <div className="d_basic_settings_content_section dual_field">
          <div className="d_basic_settings_field_container">
            <span style={{ color: activeColor.text }} className="d_basic_settings_field_label">Send Read Receipt</span>
            {!updatingReadReciept && <div onClick={() => {
              setUpdatingReadReciept(true);
              updateReadReciept(!user.privacy.read_receipt)
                .then(() => {
                  setFetchingUser(true);
                })
                .catch(() => {
                  setPrompt({ type: "error", title: "Cannot update Read Receipt try again" });
                })
                .finally(() => setTimeout(() => setUpdatingReadReciept(false), 1000));
            }}
              className="d_basic_settings_field_switch_container"
            >
              <input
                type="checkbox"
                className="d_basic_settings_field_switch"
                defaultChecked={user.privacy.read_receipt}
              />
              <span className="d_basic_settings_field_switch_slider"></span>
            </div>}
            {updatingReadReciept && (
              <div style={{ display: "flex", height: "2rem", alignItems: "center" }}>
                <ActivityIndicator style="spin" color="var(--app-accent)" />
              </div>
            )}
          </div>

        </div>


        {user.auth_method === "password" && <div className="d_basic_settings_content_section dual_field">
          <div className="d_basic_settings_field_container">
            <span style={{ color: activeColor.text }} className="d_basic_settings_field_label">Old Password</span>
            <div style={{ background: activeColor.fadeBackground }} className="d_basic_settings_field_input_container">
              <input
                placeholder="Enter your old password"
                style={{ color: activeColor.textFade }}
                type="text"
                className="d_basic_settings_field"
                value={edit.username}
                onChange={(e) => setEdit({ ...edit, username: e.target.value })}
              />
            </div>
          </div>
          <div className="d_basic_settings_field_container">
            <span style={{ color: activeColor.text }} className="d_basic_settings_field_label">New Password</span>
            <div style={{ background: activeColor.fadeBackground }} className="d_basic_settings_field_input_container">
              <input
                placeholder="Enter New Password"
                style={{ color: activeColor.textFade }}
                type={passwordFieldType}
                className="d_basic_settings_field"
                value={edit.privacy.password}
                onChange={(e) => setEdit({ ...edit, privacy: { ...edit.privacy, password: e.target.value } })}
              />
              <div onClick={() => setPasswordFieldType((prev) => prev === "password" ? "text" : "password")} className="d_basic_settings_field_icon">
                {passwordFieldType === "password" && <BsFillEyeFill size={16} />}
                {passwordFieldType === "text" && <BsFillEyeSlashFill size={16} />}
              </div>
            </div>
          </div>
        </div>}


      </div>

      <div style={{ borderTop: "0.5px solid " + activeColor.fadedBorder }} className="d_basic_settings_content_section submit">
        {!updatingDetails && (
          <button onClick={update} className="d_basic_settings_update_button">
            Update
          </button>
        )}
        {updatingDetails && (
          <div style={{ display: "flex", height: "3rem", width: "5rem", alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator style="spin" color="var(--app-accent)" />
          </div>
        )}
      </div>
    </div>
  )
}

export default DesktopBasicSettings