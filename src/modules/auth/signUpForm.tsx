import axios from "axios";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { AppDispatch } from "../../app/store";
import { postData } from "../../global/api";
import { AlertTypeEnum } from "../../global/enums/alertTypeEnum";
import { GenderEnum } from "../../global/enums/genderEnum";
import { UserRoleEnum } from "../../global/enums/userRoleEnum";
import checkRequiredFormFields from "../../global/validation/checkRequiredFormFields";
import isValidEmail from "../../global/validation/emailValidation";
import markRequiredFormField from "../../global/validation/markRequiredFormField";
import isValidTelephone from "../../global/validation/telephoneValidation";
import AlertMessage from "../../other/alertMessage";
import { setAlert } from "../../other/alertSlice";
import { UserModel } from "../users/models/userModel";
import LandlordForm from "./LandlordForm";
import PhoneInput from "react-phone-input-2";
import { LandlordCreationModel } from "./landlordModel";
import { SocketMessageModel } from "../../webSockets/SocketMessageModel";
import { webSocketService } from "../../webSockets/socketService";
import { UserActivity } from "../../global/enums/userActivity";
import { TenantCreationModel } from "../tenants/TenantModel";
import TenantDetailsForm from "../tenants/TenantDetailsForm";

const SignUpForm = () => {
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [GenderValues] = useState([
    GenderEnum.male,
    GenderEnum.female,
    GenderEnum.others,
  ]);
  const [user, setUser] = useState<UserModel>({
    firstName: "",
    lastName: "",
    otherNames: "",
    gender: "",
    userRole: "",
    userTelephone: "",
    userEmail: "",
    userPassword: "",
    addedBy: { userId: null },
    linkedTo: { userId: null },
  });

  const [landlord, setLandlord] = useState<LandlordCreationModel>({
    user: {
      userId: 0,
    },

    companyName: "",

    idType: "",
    nationalId: "",

    addressType: "",
    address: {
      country: "",
      state: "",
      city: "",
      county: "",
      division: "",
      parish: "",
      zone: "",
      street: "",
      plotNumber: "",
    },
  });

  const [tenant, setTenant] = useState<TenantCreationModel>({
    user: {
      userId: 0,
    },

    companyName: "",

    idType: "",
    nationalId: "",

    nextOfKin: {
      nokName: "",
      nokEmail: "",
      nokTelephone: "",
      nokNationalId: "",
      nokIdType: "",
      addressType: "",
      address: {
        country: "",
        state: "",
        city: "",
        county: "",
        division: "",
        parish: "",
        zone: "",
        street: "",
        plotNumber: "",
      },
    },
  });

  const [isShowTenantDetailsForm, setIsShowTenantDetailsForm] =
    useState<boolean>(false);

  const [accountType, setAccountType] = useState<string>("");
  const [isShowLandlordForm, setIsShowLandlordForm] = useState<boolean>(false);
  const [isShowSignUpForm, setISShowSignUpForm] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const isValidGenderValue =
    user.gender === GenderEnum.female ||
    user.gender === GenderEnum.male ||
    user.gender === GenderEnum.others;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setUser({ ...user, [id]: value });
    markRequiredFormField(e.target);
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  // function for creating new user account (signup)
  const signUp = async () => {
    const firstName = document.getElementById("firstName") as HTMLInputElement;
    const lastName = document.getElementById("lastName") as HTMLInputElement;
    const email = document.getElementById("userEmail") as HTMLInputElement;

    const gender = document.getElementById("gender") as HTMLInputElement;
    const password = document.getElementById(
      "userPassword"
    ) as HTMLInputElement;

    // check if all the required form fields are filled
    if (
      !user.firstName ||
      user.firstName.trim().length < 1 ||
      !user.lastName ||
      user.lastName.trim().length < 1 ||
      !user.userEmail ||
      user.userEmail.trim().length < 1 ||
      !user.userTelephone ||
      user.userTelephone.trim().length < 1 ||
      !user.gender ||
      user.gender.trim().length < 1 ||
      !user.userPassword ||
      user.userPassword.trim().length < 1
    ) {
      checkRequiredFormFields([
        firstName,
        lastName,
        email,
        // telephone,
        gender,
        password,
      ]);

      dispatch(
        setAlert({
          message: "Please fill in all the required form fields marked by (*)",
          type: AlertTypeEnum.danger,
          status: true,
        })
      );

      return;
    }

    // check if the gender value is valid (male, female, others)
    if (!isValidGenderValue) {
      dispatch(
        setAlert({
          type: AlertTypeEnum.danger,
          message: "Invalid gender value.",
          status: true,
        })
      );
      return;
    }

    // check if the email is valid
    if (!isValidEmail(String(user.userEmail))) {
      const parent: HTMLElement | null = email.parentElement;

      if (parent) {
        const small = parent.querySelector("small");
        parent.classList.add("required");
        small?.classList.add("visible");
      }

      dispatch(
        setAlert({
          type: AlertTypeEnum.danger,
          message: "Invalid email.",
          status: true,
        })
      );
      return;
    }

    // check if the telephone number is valid
    if (!isValidTelephone(String(user.userTelephone))) {
      dispatch(
        setAlert({
          type: AlertTypeEnum.danger,
          message: "Invalid telephone number.",
          status: true,
        })
      );
      return;
    }

    // submit sign-up form if all conditions are fullfilled
    try {
      setLoading(true);
      const result = await postData("/sign-up", user);

      if (result.data.status && result.data.status !== "OK") {
        dispatch(
          setAlert({
            type:
              result.data.status !== "OK"
                ? AlertTypeEnum.danger
                : AlertTypeEnum.success,
            message: result.data.message,
            status: true,
          })
        );
        return;
      }

      localStorage.setItem(
        "dnap-user",
        JSON.stringify({
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          userId: result.data.userId,
          userRole: result.data.userRole,
        })
      );

      if (accountType === UserRoleEnum.landlord) {
        setLandlord((prev) => ({
          ...prev,
          user: { userId: Number(result.data.userId) },
        }));
        setIsShowLandlordForm(true);
      }

      if (accountType === UserRoleEnum.tenant) {
        setTenant((prev) => ({
          ...prev,
          user: { userId: Number(result.data.userId) },
        }));
        setIsShowTenantDetailsForm(true);
      }

      const socketMessage: SocketMessageModel = {
        userId: result.data.userId,
        userRole: result.data.userRole,
        content: JSON.stringify(result.data),
        activity: UserActivity.signUp,
      };

      // send socket message
      webSocketService.sendMessage("/app/sign-up", socketMessage);
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log("REQUEST CANCELLED: ", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const userChoice = (
    <div className="text-gray-500 p-5 w-full">
      <div
        className="py-10 border rounded-lg px-5 lg:hover:text-gray-400 cursor-pointer"
        onClick={() => {
          setISShowSignUpForm(true);
          setAccountType(UserRoleEnum.landlord);
          setUser((prev) => ({ ...prev, userRole: UserRoleEnum.landlord }));
        }}
      >
        <h1 className="text-3xl flex justify-between">
          <span>Landlord account</span>
          <span>{">"}</span>
        </h1>
      </div>
      <div
        className="py-10 border rounded-lg mt-10 px-5 lg:hover:text-gray-400 cursor-pointer"
        onClick={() => {
          setISShowSignUpForm(true);
          setAccountType(UserRoleEnum.tenant);
          setUser((prev) => ({ ...prev, userRole: UserRoleEnum.tenant }));
        }}
      >
        <h1 className="text-3xl flex justify-between">
          <span>Tenant account</span>
          <span>{">"}</span>
        </h1>
      </div>
    </div>
  );

  return (
    <form
      className="login-for relative  flex flex-wrap justify-center items-start bg-blue-950 text-sm min-h-svh"
      action=""
      onSubmit={(e: React.FormEvent) => e.preventDefault()}
    >
      <div className=" text-white w-full lg:w-1/3 p-3 lg:p-5  flex flex-wrap justify-center items-center lg:h-svh lg:sticky top-0 lg:py-32">
        <div className="w-full flex justify-start items-end">
          <img
            className="w-20 h-20"
            src="/images/logo-no-background.png"
            alt=""
          />
          <h1 className=" text-5xl font-extrabold">ENT</h1>
        </div>
        <div className="text-gray-400 h-3/4 flex flex-wrap items-center justify-center w-full text-start py-20 text-3xl">
          <div className="h-fit capitalize font-extralight">
            <p className="w-full">welcome to vent.</p>
            <p className="w-full">
              the World's number one real-estate solution.
            </p>
          </div>
        </div>
        <h1 className="text-xs w-full text-start">&copy; vent solutions</h1>
      </div>

      <div className="login-form-inner w-full lg:w-1/2 relative px-5 rounded-md  bg-blue-700 flex flex-wrap bg-opacity-10 shadow-sm pb-10">
        <div className="w-full p-5 flex justify-center lg:sticky -top-32 bg-inherit">
          <h1 className="text-white text-2xl border-b-2 border-b-white w-full">
            Create a vent account{" "}
            {user.userRole && <span>({user.userRole})</span>}
          </h1>
        </div>

        {!isShowSignUpForm ? (
          userChoice
        ) : isShowTenantDetailsForm ? (
          <TenantDetailsForm
            tenant={tenant}
            setTenant={setTenant}
            setIsShowTenantDetailsForm={setIsShowTenantDetailsForm}
          />
        ) : isShowLandlordForm ? (
          <LandlordForm landlord={landlord} setLandlord={setLandlord} />
        ) : (
          <>
            {/* First name input field */}
            <div className="form-group py-2 w-full lg:w-1/2 px-5">
              <label htmlFor="firstName" className="w-full text-white">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                autoComplete="off"
                autoFocus
                placeholder="First name*"
                className="w-full outline-none rounded-lg border-2 bg-gray-200"
                value={user.firstName || ""}
                onChange={(e) => {
                  handleChange(e);
                  markRequiredFormField(e.target);
                }}
              />
              <small className="w-full text-red-300">
                First name is required.
              </small>
            </div>

            {/* Last name input field */}
            <div className="form-group py-2 w-full lg:w-1/2 px-5">
              <label htmlFor="lastName" className="w-full text-white">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                autoComplete="off"
                placeholder="Last name*"
                className="w-full outline-none rounded-lg bg-gray-200"
                value={user.lastName || ""}
                onChange={(e) => {
                  handleChange(e);
                  markRequiredFormField(e.target);
                }}
              />
              <small className="w-full text-red-300">
                Last name is required.
              </small>
            </div>

            {/* Other names form field */}
            <div className="form-group py-2 w-full px-5">
              <label htmlFor="otherNames" className="w-full text-white">
                Other names
              </label>
              <input
                type="text"
                id="otherNames"
                autoComplete="off"
                placeholder="Other names"
                className="w-full outline-none rounded-lg bg-gray-200"
                value={user.otherNames || ""}
                onChange={handleChange}
              />
            </div>

            {/* Email input field */}
            <div className="form-group py-2 w-full lg:w-1/2 px-5">
              <label htmlFor="userEmail" className="w-full text-white">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="userEmail"
                autoComplete="off"
                placeholder="Email* Eg. example@domain.com"
                className="w-full outline-none rounded-lg bg-gray-200"
                value={user.userEmail || ""}
                onChange={(e) => {
                  handleChange(e);
                  markRequiredFormField(e.target);
                }}
              />
              <small className="w-full text-red-300">Email is required.</small>
            </div>

            {/* Telephone input field */}
            <div className="form-group py-2 w-full lg:w-1/2 px-5">
              <label htmlFor="userTelephone" className="w-full text-white">
                Telephone <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                id="userTelephone"
                autoComplete="off"
                placeholder="Telephone* Eg. +23578348990"
                className="w-full outline-none rounded-lg bg-gray-200"
                value={user.userTelephone || ""}
                onChange={(e) => {
                  handleChange(e);
                  markRequiredFormField(e.target);
                }}
              />

              {/* <PhoneInput
                country={"us"}
                value={user.userTelephone}
                placeholder="Enter telephone 1"
                onChange={(phone) => {
                  setUser({
                    ...user,
                    userTelephone: phone ? "+" + phone : null,
                  });
                }}
                inputStyle={{
                  width: "100%",
                  padding: "10px 50px",
                  fontSize: "16px",
                  borderRadius: "4px",
                }}
                containerStyle={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center", // To keep the phone number and country code in the same line
                }}
              /> */}

              <small className="w-full text-red-300">
                Telephone number is required
              </small>
            </div>

            {/* Gender form field */}
            <div className="form-group py-2 w-full lg:w-1/2 px-5 ">
              <label htmlFor="gender" className="w-full text-white">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                id="gender"
                className="w-full outline-none rounded-lg bg-gray-200 text-black"
                onChange={(e) => {
                  handleChange(e);
                  markRequiredFormField(e.target);
                }}
              >
                {GenderValues.map((gender, index) => (
                  <option key={index} value={gender} />
                ))}
              </select>
              {/* <input
                type="text"
                id="gender"
                list="genderList"
                autoComplete="off"
                placeholder="Gender*"
                className="w-full outline-none rounded-lg bg-gray-200"
                value={user.gender || ""}
                onChange={(e) => {
                  handleChange(e);
                  markRequiredFormField(e.target);
                }}
              />
              <datalist id="genderList">
                {GenderValues.map((gender, index) => (
                  <option key={index} value={gender} />
                ))}
              </datalist> */}
              <small className="w-full text-red-300">Gender is required.</small>
            </div>

            {/* Password input field */}
            <div className="form-group relative py-0 lg:py-2 w-full lg:w-1/2 pl-5">
              <label htmlFor="userPassword" className="w-full text-white">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="userPassword"
                autoComplete="off"
                placeholder="Password*"
                className="w-full outline-none rounded-lg bg-gray-200"
                value={user.userPassword || ""}
                onChange={(e) => {
                  handleChange(e);
                  markRequiredFormField(e.target);
                }}
              />
              <small className="w-full text-red-300">
                Password is required.
              </small>
              <div
                className="absolute right-0 top-10 text-blue-800 text-lg px-2 mr-2 cursor-pointer"
                onClick={handleTogglePassword}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>

            {/* action buttons */}
            <div className="form-group w-full flex flex-wrap justify-around py-5 text-gold pl-5">
              <button
                className="w-1/3 bg-gray-800 p-2 text-lg text-white hover:bg-gray-700 active:translate-x-2"
                onClick={() => {
                  setISShowSignUpForm(false);
                  setAccountType("");
                }}
                disabled={loading}
              >
                {loading ? "Loading..." : "< Back"}
              </button>

              <button
                className="w-1/3 bg-blue-600 p-2 text-lg text-white hover:bg-blue-400 active:translate-x-2"
                onClick={signUp}
                disabled={loading}
              >
                {loading ? "Saving..." : "Next >"}
              </button>
            </div>
          </>
        )}
        <p className="w-full pt-5 text-blue-100 px-5">
          Have an account already?{" "}
          <Link to="/" className="text-xl text-blue-500 lg:hover:text-blue-300">
            Log In
          </Link>
        </p>
      </div>
      <AlertMessage />
    </form>
  );
};

export default SignUpForm;
