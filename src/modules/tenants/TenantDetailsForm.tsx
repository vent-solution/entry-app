import React from "react";
import { TenantCreationModel } from "./TenantModel";
import axios from "axios";
import { postData } from "../../global/api";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import { setAlert } from "../../other/alertSlice";
import { AlertTypeEnum } from "../../global/enums/alertTypeEnum";
import {
  ADDRESS_TYPE,
  NATIONAL_ID_TYPE,
} from "../../global/PreDefinedData/PreDefinedData";
import AlertMessage from "../../other/alertMessage";

import countryList from "../../global/data/countriesList.json";

interface Props {
  tenant: TenantCreationModel;
  setTenant: React.Dispatch<React.SetStateAction<TenantCreationModel>>;
  setIsShowTenantDetailsForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const TenantDetailsForm: React.FC<Props> = ({ tenant, setTenant }) => {
  const dispatch = useDispatch<AppDispatch>();

  // check if can save tenant details
  const canSaveTenant = String(tenant.idType).trim().length > 0;

  // handle change text field values
  const handleChangeTextFieldValues = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setTenant((prev) => ({ ...prev, [id]: value }));
  };

  // save tenant details
  const handleSaveTenantDetails = async () => {
    // check if all the required fiels are filled
    if (!canSaveTenant) {
      dispatch(
        setAlert({
          status: true,
          type: AlertTypeEnum.danger,
          message: "Please fill in all the required fields marked by (*)",
        })
      );
      return;
    }

    try {
      const result = await postData("/addNewTenant", tenant);

      if (result.data.status && result.data.status !== "OK") {
        dispatch(
          setAlert({
            status: true,
            type: AlertTypeEnum.danger,
            message: result.data.message,
          })
        );

        return;
      }

      window.location.href = "/";
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("SAVE USER CANCELLED: ");
      }
    }
  };

  return (
    <form
      className="py-5 text-lg lg:text-sm w-full m-auto  text-white"
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
    >
      <div className="flex flex-wrap justify-between w-full">
        {/* <h1 className="text-3xl font-bold w-full">
          Complete your tenant details
        </h1> */}

        {/* company name form input field */}
        <div className="form-group w-full p-5  shadow-lg">
          <label htmlFor="companyName" className="w-full font-bold">
            Company name <span className="text-red-600"></span>
          </label>
          <input
            type="text"
            id="companyName"
            placeholder="Enter company name"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={handleChangeTextFieldValues}
          />
          <small className="w-full"></small>
        </div>

        {/* national ID number form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="nationalId" className="w-full font-bold">
            ID number <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="nationalId"
            placeholder="Enter national ID number"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={handleChangeTextFieldValues}
          />
          <small className="w-full"></small>
        </div>

        {/* national ID type form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="idType" className="w-full font-bold">
            ID type <span className="text-red-600">*</span>
          </label>
          <select
            id="idType"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-3"
            onChange={handleChangeTextFieldValues}
          >
            <option value={""}>SELECT ID TYPE</option>
            {NATIONAL_ID_TYPE.map((type, index) => (
              <option key={index} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <small className="w-full"></small>
        </div>

        {/*next of kin details */}
        <h1 className="w-full text-xl font-bold pt-10">Next of Kin</h1>

        {/* next of kin full name form input field */}
        <div className="form-group w-full p-5  shadow-lg">
          <label htmlFor="fullName" className="w-full font-bold">
            Full name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            placeholder="Enter next of kin full name"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: { ...prev.nextOfKin, nokName: e.target.value },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* next of kin email form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="nokEmail" className="w-full font-bold">
            Email <span className="text-red-600"></span>
          </label>
          <input
            type="text"
            id="nokEmail"
            placeholder="Enter next of kin email"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: { ...prev.nextOfKin, nokEmail: e.target.value },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* next of kin telephone form input field */}
        <div className="form-group py-2 w-full lg:w-1/2 px-5">
          <label htmlFor="userTelephone" className="w-full text-white">
            Telephone <span className="text-red-500">*</span>
          </label>

          <input
            type="text"
            id="userTelephone"
            autoComplete="off"
            placeholder="Telephone* Eg. +23578348990"
            className="w-full outline-none rounded-lg bg-gray-100 py-2"
            value={tenant.nextOfKin?.nokTelephone || ""}
            onChange={(e) => {
              handleChangeTextFieldValues(e);
            }}
          />

          <small className="w-full text-red-300">
            Telephone number is required
          </small>
        </div>

        {/* next of kin ID form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="nokNationalId" className="w-full font-bold">
            ID number <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="nokNationalId"
            placeholder="Enter next of kin national ID"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: { ...prev.nextOfKin, nokNationalId: e.target.value },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* next of kin national ID type form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="nokIdType" className="w-full font-bold">
            ID type
            <span className="text-red-600">*</span>
          </label>
          <select
            id="nokIdType"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-3"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: { ...prev.nextOfKin, nokIdType: e.target.value },
              }))
            }
          >
            <option value="">SELECT ID TYPE</option>

            {NATIONAL_ID_TYPE.map((type) => (
              <option value={type.value}>{type.label}</option>
            ))}
          </select>
          <small className="w-full"></small>
        </div>

        {/* tenant's next of kin address */}
        <h1 className="text-lg font-bold pt-5 w-full">Next of kin address</h1>

        {/* next of kin address type form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="addressType" className="w-full font-bold">
            Address type <span className="text-red-600">*</span>
          </label>
          <select
            id="addressType"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-3"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: { ...prev.nextOfKin, addressType: e.target.value },
              }))
            }
          >
            <option value="">SELECT ADDRESS TYPE</option>

            {ADDRESS_TYPE.map((type) => (
              <option value={type.value}>{type.label}</option>
            ))}
          </select>
          <small className="w-full"></small>
        </div>

        {/* next of kin country form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="country" className="w-full font-bold">
            Country <span className="text-red-600">*</span>
          </label>

          <select
            name="country"
            id="country"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-3"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: {
                  ...prev.nextOfKin,
                  address: {
                    ...prev.nextOfKin?.address,
                    country: e.target.value,
                  },
                },
              }))
            }
          >
            <option value="">SELECT COUNTRY</option>
            {countryList.map((country) => (
              <option value={country.value}>{country.label}</option>
            ))}
          </select>
          <small className="w-full"></small>
        </div>

        {/* next of kin state form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="state" className="w-full font-bold">
            State <span className="text-red-600"></span>
          </label>
          <input
            type="text"
            id="state"
            placeholder="Enter next of kin state"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: {
                  ...prev.nextOfKin,
                  address: {
                    ...prev.nextOfKin?.address,
                    state: e.target.value,
                  },
                },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* next of kin city form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="city" className="w-full font-bold">
            City/Municipality/District <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="city"
            placeholder="Enter next of kin city"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: {
                  ...prev.nextOfKin,
                  address: {
                    ...prev.nextOfKin?.address,
                    city: e.target.value,
                  },
                },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* next of kin county form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="county" className="w-full font-bold">
            County <span className="text-red-600"></span>
          </label>
          <input
            type="text"
            id="county"
            placeholder="Enter next of kin county"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: {
                  ...prev.nextOfKin,
                  address: {
                    ...prev.nextOfKin?.address,
                    county: e.target.value,
                  },
                },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* next of kin division form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="division" className="w-full font-bold">
            Division / Sub county <span className="text-red-600"></span>
          </label>
          <input
            type="text"
            id="division"
            placeholder="Enter next of kin division"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: {
                  ...prev.nextOfKin,
                  address: {
                    ...prev.nextOfKin?.address,
                    division: e.target.value,
                  },
                },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* next of kin parish form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="parish" className="w-full font-bold">
            Parish / Ward <span className="text-red-600"></span>
          </label>
          <input
            type="text"
            id="parish"
            placeholder="Enter next of kin parish"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: {
                  ...prev.nextOfKin,
                  address: {
                    ...prev.nextOfKin?.address,
                    parish: e.target.value,
                  },
                },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* next of kin zone form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="zone" className="w-full font-bold">
            Zone / Village / LC1 <span className="text-red-600"></span>
          </label>
          <input
            type="text"
            id="zone"
            placeholder="Enter next of kin zone"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: {
                  ...prev.nextOfKin,
                  address: {
                    ...prev.nextOfKin?.address,
                    zone: e.target.value,
                  },
                },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* next of kin street form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="street" className="w-full font-bold">
            Street <span className="text-red-600"></span>
          </label>
          <input
            type="text"
            id="street"
            placeholder="Enter next of kin street"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: {
                  ...prev.nextOfKin,
                  address: {
                    ...prev.nextOfKin?.address,
                    street: e.target.value,
                  },
                },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* next of kin plotNumber form input field */}
        <div className="form-group w-full lg:w-1/2 p-5  shadow-lg">
          <label htmlFor="plotNumber" className="w-full font-bold">
            Plot Number <span className="text-red-600"></span>
          </label>
          <input
            type="text"
            id="plotNumber"
            placeholder="Enter next of kin plotNumber"
            className="w-full outline-none border border-gray-400 rounded-lg focus:border-blue-400 py-2"
            onChange={(e) =>
              setTenant((prev) => ({
                ...prev,
                nextOfKin: {
                  ...prev.nextOfKin,
                  address: {
                    ...prev.nextOfKin?.address,
                    plotNumber: e.target.value,
                  },
                },
              }))
            }
          />
          <small className="w-full"></small>
        </div>

        {/* button for saving tenant */}
        <div className="form-group w-full py-5 flex justify-center items-center">
          <input
            type="submit"
            id="save-tenant"
            className="py-1 px-10 outline-none bg-blue-700 lg:hover:bg-blue-400 text-2xl text-white cursor-pointer"
            onClick={handleSaveTenantDetails}
          />
        </div>
      </div>
      <AlertMessage />
    </form>
  );
};

export default TenantDetailsForm;
