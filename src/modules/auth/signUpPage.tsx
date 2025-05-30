import React from "react";
import SignUpForm from "./signUpForm";

interface Props {}

const SignUpPage: React.FC<Props> = () => {
  return (
    <div className="w-full">
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
