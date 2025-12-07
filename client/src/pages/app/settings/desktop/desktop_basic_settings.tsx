import { useState, type FC, type ReactNode } from "react"
import "./css/desktop_basic_settings.css";
import { useChatProvider } from "@/constants/providers/chatProvider";
import ImageViewer from "@/components/utility/viewable_image";
import { useConnProvider } from "@/constants/providers/conn_provider";
import { proxyImage, validateEditDetails, validateFile } from "@/constants/var_2";
import ActivityIndicator from "@/components/utility/activity_indicator";
import { type EditUser, type PreviewMediaData } from "@/constants/types";
import { createMediaPreviewObject, defaultEditUserObject } from "@/constants/vars";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { updateReadReciept, updateUserDetails, updateUserDp } from "@/constants/user/controller";
import Draggable from "@/components/draggable_window";
import { PiWarningCircleBold } from "react-icons/pi";
import { SendMail } from "@/constants/mailer/controller";


const DesktopBasicSettings: FC = (): ReactNode => {

  const { activeColor, setPrompt } = useChatProvider();
  const { user, setFetchingUser } = useConnProvider();
  const [isDpLoading, setIsDpLoading] = useState<boolean>(true);
  const [edit, setEdit] = useState<EditUser>(defaultEditUserObject);
  const [filteredEdit, setFilteredEdit] = useState<Record<string, any>>({});
  const [passwordFieldType, setPasswordFieldType] = useState<"password" | "text">("password");

  const [updating, setUpdating] = useState<"read_receipt" | "picture" | "details" | undefined>(undefined);

  const [dpFile, setDpFile] = useState<File | undefined>()
  const [dpFilePreview, setDpFilePreview] = useState<PreviewMediaData | undefined>(undefined)

  const [emailOtp, setEmailOtp] = useState<string>("");
  const [enteredOtp, setEnteredOtp] = useState<string>("");

  const [verification, setVerification] = useState<"update_details" | "change_dp" | null>(null);

  //dp changing
  const onDpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValidImage = validateFile(file, ["image"], 2); //2MB limit
    if (!isValidImage.valid) {
      setPrompt({ type: "error", title: isValidImage.error || "Invalid image file" });
      return;
    }

    //preview and upload logic here
    setDpFile(file);
    setDpFilePreview(createMediaPreviewObject(file));

    e.target.value = ""; //file aready written to dpFile so input value not needed
  };




  const validateDetails = async () => {
    setUpdating("details");

    const { filtered, error, message } = validateEditDetails(edit);
    if (error) {
      setPrompt({ type: "error", title: message });
      setUpdating(undefined)
      return;
    }

    setFilteredEdit(filtered as EditUser);
    setVerification("update_details");
    verifyToUpdate();
  };


  ///////////////////////////////////////////////////
  /////////////////////////////////////////////////////////
  const changeDp = async () => {
    const formData = new FormData();
    if (!dpFile) {
      setPrompt({ type: "error", title: "No Profile Picture selected" });
      setUpdating(undefined);
      setDpFile(undefined);
      setDpFilePreview(undefined);
      return;
    }
    formData.append("picture", dpFile);
    console.log("updating dp with", dpFile);
    const response = await updateUserDp(formData);
    if(response.status !== 200){
      setPrompt({ type:"error", title: "Cannot Update profile picture, please try again later" })
      return;
    }
    //after update
    setPrompt({ type: "success", title: "Profile Picture updated successfully" });
    setIsDpLoading(true);
    setFetchingUser(true);
    setDpFile(undefined);
    setDpFilePreview(undefined);
    setUpdating(undefined);
    setEmailOtp("");
    setEnteredOtp("");
    setVerification(null);
  }
  const updateDetails = () => {
    console.log("updating details with", edit);
    //return;
    updateUserDetails(filteredEdit as EditUser)
      .then((res) => { 
        if(res.status !== 200){
          setPrompt({ type: "error", title: res.message||"" });
        }else{
          setFetchingUser(true);
        }
      })
      .catch((err) => {
        setPrompt({ type: "error", title: "Cannot update details, try again", body: err });
      })
      .finally(() => {
        setUpdating(undefined);
        setEdit(defaultEditUserObject);
        setFilteredEdit({});
        setEmailOtp("");
        setEnteredOtp("");
        setVerification(null);
      });
  };

  ///////////////////////////////////////
  ////////////////////////////////////////////////
  ////////////////////////////////////////////////////
  const verifyToUpdate = async () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    //setPrompt({ type: "success", title: "Sending verification email...", body: otp });
    //send email with otp
    setEmailOtp(otp);
    const payload = {
      type: "email_otp",
      data: otp
    }
    const resp = await SendMail(payload);
    if (resp.status !== 200) {
      setPrompt({ type: "error", title: "Cannot send verification email", body: resp.message });
      setUpdating(undefined);
      setVerification(null);
      setEmailOtp("");
      setEnteredOtp("");
      setDpFile(undefined);
      setDpFilePreview(undefined);
      return;
    }
    setPrompt({ type: "success", title: "Verification email sent, check your inbox/spam folder" });
    //open draggable window to enter otp

  }


  const onVerifySuccess = () => {
    if (!verification) return;
    if (enteredOtp !== emailOtp) {
      setPrompt({ type: "error", title: "Invalid OTP entered" });
      return;
    }

    setPrompt({ type: "success", title: "OTP verified successfully" });

    switch (verification) {
      case "update_details":
        updateDetails();
        break;
      case "change_dp":
        changeDp();
        break;
    }
  }


  return (
    <div className="d_basic_settings_container">
      <div className="d_basic_settings_header">
        <span className="d_basic_settings_header_text">My Account</span>
        <span style={{ color: activeColor.textFadeSecondary }} className="d_basic_settings_header_sub_text">Manage your account information such as your email, password, and personal details</span>
      </div>

      <div className="d_basic_settings_content">
        <div className="d_basic_settings_content_section picture">
          <div className="d_basic_settings_picture_container">
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
            {isDpLoading && (
              <div
                style={{ position: "absolute", height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: activeColor.fadeBackground, borderRadius: "50%" }}>
                <ActivityIndicator color="var(--app-accent)" style="spin" />
              </div>
            )}
            {dpFilePreview && (
              <Draggable
                onCancel={() => { setUpdating(undefined), setDpFile(undefined), setDpFilePreview(undefined) }}
                header="Change Profile Picture"
              >
                <div className="d_basic_settings_preview_new_dp_container">
                  <img src={dpFilePreview.previewUrl} style={{ height: "100%", aspectRatio: "1/1", objectFit: "contain" }} />
                </div>
                <div className="d_basic_settings_preview_new_dp_action">
                  {updating !== "picture" && (
                    <button
                      disabled={!!updating}
                      className="d_basic_settings_change_dp_button"
                      onClick={() => { setUpdating("picture"), setVerification("change_dp"), verifyToUpdate() }}
                    >
                      Update
                    </button>
                  )}
                  {updating === "picture" && (
                    <div style={{ display: "flex", height: "2rem", alignItems: "center" }}>
                      <ActivityIndicator style="spin" color="var(--app-accent)" />
                    </div>
                  )}
                </div>
              </Draggable>
            )}
          </div>
          <div className="d_basic_settings_picture_int">
            <button
              disabled={!!updating || !!dpFilePreview}
              className="d_basic_settings_change_dp_button"
            >
              Change Avatar
              <input
                type="file"
                className="in_chat_footer_file_field"
                accept="image/*"
                onChange={onDpChange}
                disabled={!!updating || !!dpFilePreview}
              />
            </button>
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
            <span style={{ color: activeColor.text }} className="d_basic_settings_field_label">
              Email
              <PiWarningCircleBold
                size={15}
                cursor={"pointer"}
                color="var(--app-accent)"
                onClick={() => {
                  setPrompt({ type: "success", title: "Notice", body: "Contact support to change your email address" })
                }}
              />
            </span>
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
            {updating !== "read_receipt" && (
              <div onClick={() => {
                if(updating || dpFilePreview) return;
                setUpdating("read_receipt");
                updateReadReciept(!user.privacy.read_receipt)
                  .then(() => {
                    setFetchingUser(true);
                  })
                  .catch(() => {
                    setPrompt({ type: "error", title: "Cannot update Read Receipt try again" });
                  })
                  .finally(() => setTimeout(() => setUpdating(undefined), 1000));
              }}
                className="d_basic_settings_field_switch_container"
              >
                <input
                  type="checkbox"
                  className="d_basic_settings_field_switch"
                  checked={user.privacy.read_receipt}
                  onChange={() => { }}
                />
                <span className="d_basic_settings_field_switch_slider"></span>
              </div>
            )}
            {updating === "read_receipt" && (
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
        {updating !== "details" && (
          <button
            onClick={() => {
              validateDetails()
            }}
            disabled={!!updating || !!dpFilePreview}
            className="d_basic_settings_update_button"
          >
            Update
          </button>
        )}
        {updating === "details" && (
          <div style={{ display: "flex", height: "3rem", width: "5rem", alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator style="spin" color="var(--app-accent)" />
          </div>
        )}
      </div>
      {verification && (
        <Draggable
          onCancel={() => {
            setVerification(null)
            setEnteredOtp("");
            setUpdating(undefined);
            setEmailOtp("");
          }}
          header="Verify Action"
        >
          <div className="d_basic_settings_verify_otp_container">
            <span style={{ color: activeColor.text }} className="d_basic_settings_verify_otp_text">Enter the OTP sent to your email to verify this action.</span>
            <input
              type="text"
              maxLength={6}
              placeholder="Enter OTP"
              style={{ background: activeColor.fadeBackground, color: activeColor.textFade }}
              className="d_basic_settings_verify_otp_input"
              onChange={(e) => {
                setEnteredOtp(e.target.value);
              }}
              value={enteredOtp}
            />
            <button
              className="d_basic_settings_update_button"
              onClick={onVerifySuccess}
              disabled={enteredOtp.length !== 6}
            >
              Verify
            </button>
          </div>
        </Draggable>
      )}
    </div>
  )
}

export default DesktopBasicSettings