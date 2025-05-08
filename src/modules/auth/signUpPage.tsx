import React, { useState } from "react";
import SignUpForm from "./signUpForm";

interface Props {}

const SignUpPage: React.FC<Props> = () => {
  const [isShowSignUpForm, setIsShowSignUpForm] = useState(false);

  return (
    <div className="">
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
