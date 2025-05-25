import React, { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { LoginModel } from "../users/models/loginModel";
import markRequiredFormField from "../../global/validation/markRequiredFormField";
import { AlertTypeEnum } from "../../global/enums/alertTypeEnum";
import AlertMessage from "../../other/alertMessage";
import isValidEmail from "../../global/validation/emailValidation";
import isValidTelephone from "../../global/validation/telephoneValidation";
import { postData } from "../../global/api";
import axios from "axios";
import checkRequiredFormFields from "../../global/validation/checkRequiredFormFields";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import { setAlert } from "../../other/alertSlice";
import { SocketMessageModel } from "../../webSockets/SocketMessageModel";
import { UserActivity } from "../../global/enums/userActivity";
import { webSocketService } from "../../webSockets/socketService";
import { UserRoleEnum } from "../../global/enums/userRoleEnum";
import ResetPasswordForm from "./resetPasswordForm";

const LoginForm: React.FC = () => {
  // local state variables
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [loginDetails, setLoginDetails] = useState<LoginModel>({
    userName: "",
    userPassword: "",
  });

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginDetails({ ...loginDetails, [id]: value });
    markRequiredFormField(e.target);
  };

  const dispatch = useDispatch<AppDispatch>();

  // user login function
  const handleLogIn = async () => {
    const userPassword = document.getElementById(
      "userPassword"
    ) as HTMLInputElement;
    const userName = document.getElementById("userName") as HTMLInputElement;

    // check if all the required form fields are filled.
    if (
      loginDetails.userName.trim().length < 1 ||
      loginDetails.userPassword.trim().length < 1
    ) {
      checkRequiredFormFields([userName, userPassword]);
      dispatch(
        setAlert({
          type: AlertTypeEnum.danger,
          message: "Please fill in all the required form fields marked by (*)",
          status: true,
        })
      );

      return;
    }

    // check if email or phone number is valid
    if (
      !isValidEmail(loginDetails.userName) &&
      !isValidTelephone(loginDetails.userName)
    ) {
      dispatch(
        setAlert({
          ...alert,
          type: AlertTypeEnum.danger,
          message: "Invalid phone number or email.",
          status: true,
        })
      );
      return;
    }

    // submit form if all the conditions are fulfilled
    try {
      setLoading(true);

      const result = await postData("/log-in", loginDetails);

      if (!result) {
        dispatch(
          setAlert({
            type: AlertTypeEnum.danger,
            message: "ERROR OCCURRED PLEASE TRY AGAIN!!",
            status: true,
          })
        );

        return;
      }

      if (result.data.status && result.data.status !== "OK") {
        dispatch(
          setAlert({
            ...alert,
            type: AlertTypeEnum.danger,
            message: result.data.message,
            status: true,
          })
        );
      } else {
        if (result.data.userRole === UserRoleEnum.landlord) {
          window.location.href = `${
            process.env.REACT_APP_LANDLORD_APP_URL + result.data.userId
          }`;
        } else if (result.data.userRole === UserRoleEnum.tenant) {
          window.location.href = `${
            process.env.REACT_APP_TENANT_APP_URL + result.data.userId
          }`;
        }
      }

      const socketMessage: SocketMessageModel = {
        userId: result.data.userId,
        userRole: result.data.userRole,
        content: null,
        activity: UserActivity.login,
      };

      webSocketService.sendMessage("/app/login", socketMessage);
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("REQUEST CANCELLED: ", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // if (isShowLandlordForm)
  //   return <LandlordForm landlord={landlord} setLandlord={setLandlord} />;

  return (
    <form
      className="login-for p-2 lg:p-10 relative  flex flex-wrap justify-center items-center bg-blue-950 text-sm lg:h-svh min-h-svh"
      action=""
      onSubmit={(e: React.FormEvent) => e.preventDefault()}
    >
      <div className="text-white w-full lg:w-1/3 p-3 lg:p-5  flex flex-wrap justify-center items-center">
        <div className="w-full flex justify-start items-end">
          <img
            className="w-14 lg:w-20 h-14 lg:h-20"
            src={`${process.env.REACT_APP_LOGO_IMAGE}/logo-no-background.png`}
            alt=""
          />
          <h1 className=" text-3xl lg:text-5xl font-extrabold">ENT</h1>
        </div>
        <div className="text-gray-400 h-3/4 flex flex-wrap items-center justify-center w-full text-start py-10 lg:py-20 text-xl lg:text-3xl">
          <div className="h-fit capitalize font-extralight">
            <p className="w-full">welcome to vent.</p>
            <p className="w-full">
              the World's number one real-estate solution.
            </p>
          </div>
        </div>
        <h1 className="text-xs w-full text-start">&copy; vent solutions</h1>
      </div>

      <div className="login-form-inner w-full  lg:w-1/4 relative p-5 lg:p-10 rounded-3xl bg-white  bg-opacity-10 shadow-white shadow-sm text-white">
        {isForgotPassword ? (
          <ResetPasswordForm setIsForgotPassword={setIsForgotPassword} />
        ) : (
          <>
            <div className="form-group py-2">
              <label htmlFor="userName" className="w-full text-white">
                Email<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="userName"
                autoComplete="off"
                aria-label="User name"
                placeholder="Email or Telephone*"
                className="w-full outline-none rounded-lg py-2"
                value={loginDetails.userName}
                onChange={handleChange}
              />
              <small className="w-full text-red-200">
                Email or telephone is required!
              </small>
            </div>
            <div className="form-group relative py-0 lg:py-2">
              <label htmlFor="userPassword" className="w-full text-white">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type={`${showPassword ? "text" : "password"}`}
                id="userPassword"
                autoComplete="false"
                aria-label="Password"
                placeholder="Password*"
                className="w-full outline-none rounded-lg py-2"
                value={loginDetails.userPassword}
                onChange={handleChange}
              />
              <small className="w-full text-red-200 text-sm">
                Password is required!
              </small>
              <div
                className="absolute h-1/2 right-0 top-6 flex items-center text-blue-800 text-lg  px-0  mr-2 cursor-pointer hover:text-blue-500"
                onClick={handleTogglePassword}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
            <div
              className="forgot-password text-blue-500 text-sm pt-5 lg:hover:text-blue-300 cursor-pointer"
              onClick={() => setIsForgotPassword(true)}
            >
              <p>Forgot password</p>
            </div>
          </>
        )}
        <div className="form-group flex flex-wrap justify-center pt-10  text-gold">
          {!isForgotPassword && (
            <button
              className="w-full bg-blue-600 p-3 text-lg text-white hover:bg-blue-400 active:scale-95"
              disabled={loading}
              onClick={handleLogIn}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          )}
          <p className="w-full pt-5 text-blue-100">
            Have no account?{" "}
            <Link
              to="/sign-up"
              className="text-lg text-blue-500 lg:hover:text-blue-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <AlertMessage />
    </form>
  );
};

export default LoginForm;
