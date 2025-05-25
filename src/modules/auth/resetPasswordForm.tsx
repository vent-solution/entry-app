import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LoginModel } from "../users/models/loginModel";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import AlertMessage from "../../other/alertMessage";
import { setAlert } from "../../other/alertSlice";
import { AlertTypeEnum } from "../../global/enums/alertTypeEnum";
import axios from "axios";
import { postData } from "../../global/api";
import checkRequiredFormFields from "../../global/validation/checkRequiredFormFields";
import markRequiredFormField from "../../global/validation/markRequiredFormField";

interface Props {
  setIsForgotPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

const ResetPasswordForm: React.FC<Props> = ({ setIsForgotPassword }) => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [user, setUser] = useState<LoginModel>({
    userName: "",
    userPassword: "",
  });

  const dispatch = useDispatch<AppDispatch>();

  // check if all required fields are filled before saving
  const canSave =
    user.userName.trim().length > 0 && user.userPassword.trim().length > 0;

  // toggle show and hide password
  const hideAndShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // handle change form event
  const handleChangeFormFieldEvent = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setUser((prev) => ({ ...prev, [id]: value }));
  };

  // get password reset token
  const saveNewPassword = async () => {
    if (!canSave) {
      checkRequiredFormFields([
        document.getElementById("userName") as HTMLInputElement,
      ]);
      checkRequiredFormFields([
        document.getElementById("userPassword") as HTMLInputElement,
      ]);

      dispatch(
        setAlert({
          status: true,
          type: AlertTypeEnum.danger,
          message: "Please fill in all the required fields!",
        })
      );

      return;
    }

    try {
      // fetch the password reset token

      const result = await postData("/reset-password", {
        email: user.userName,
      });

      console.log(result.data);

      if (result.data.status && result.data.status !== "OK") {
        dispatch(
          setAlert({
            status: true,
            type: AlertTypeEnum.danger,
            message: result.data.message,
          })
        );
        return;
      } else {
        // save the new password after receiving the password reset token
        const token = result.data; // Extract the token
        if (!token) {
          console.log("Invalid token received from server.");
          return;
        }

        // Save the new password
        const result2 = await postData(
          `/save-password?token=${encodeURIComponent(token)}`,
          {
            newPassword: user.userPassword,
          }
        );

        console.log(result2.data);

        if (result2.data.status && result2.data.status !== "OK") {
          dispatch(
            setAlert({
              status: true,
              type: AlertTypeEnum.danger,
              message: result2.data.message,
            })
          );
          return;
        } else {
          dispatch(
            setAlert({
              status: true,
              type: AlertTypeEnum.success,
              message: result2.data.message,
            })
          );

          setIsForgotPassword(false);
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("GET PASSWORD RESET TOKEN CANCELLED: ", error.message);
      }
    }
  };

  return (
    <>
      <div className="login-form-inner w-full relative rounded-md text-white">
        <h1 className="text-xl pb-5">Reset your vent password</h1>

        {/* email or telephone form field */}
        <div className="form-group">
          <label htmlFor="userName" className="w-full text-white">
            Email<span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="userName"
            autoComplete="false"
            value={user.userName}
            placeholder="Enter email or Telephone*"
            className="w-full outline-none rounded-lg py-2"
            onChange={(e) => {
              handleChangeFormFieldEvent(e);
              markRequiredFormField(e.target);
            }}
          />
          <small className="w-full text-red-600">
            {" "}
            Email or telephone is required!
          </small>
        </div>

        {/* password form field */}
        <div className="form-group relative py-2">
          <label htmlFor="userPassword" className="w-full text-white">
            New password<span className="text-red-600">*</span>
          </label>
          <input
            type={`${showPassword ? "text" : "password"}`}
            id="userPassword"
            autoComplete="false"
            value={user.userPassword}
            placeholder="Enter Password*"
            className="w-full outline-none rounded-lg py-2"
            onChange={(e) => {
              handleChangeFormFieldEvent(e);
              markRequiredFormField(e.target);
            }}
          />
          <small className="w-full text-red-600">
            {" "}
            New password is required!
          </small>
          <div
            className="absolute right-0 top-10 text-blue-800 text-lg  px-2  mr-2 cursor-pointer lg:hover:text-blue-600"
            onClick={() => hideAndShowPassword()}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </div>
        </div>
        <p
          className="forgot-password text-blue-500 lg:hover:text-blue-300 text-lg cursor-pointer"
          onClick={() => setIsForgotPassword(false)}
        >
          Login Instead?
        </p>
        <div className="form-group flex flex-wrap justify-center pt-10  text-gold">
          <button
            className="w-full bg-blue-600 p-3 text-lg text-white hover:bg-blue-400 active:scale-95"
            onClick={() => {
              saveNewPassword();
            }}
          >
            Reset Password
          </button>
        </div>
      </div>
      <AlertMessage />
    </>
  );
};

export default ResetPasswordForm;
