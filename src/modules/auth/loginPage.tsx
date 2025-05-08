import React, { useEffect, useState } from "react";
import Preloader from "../../other/Preloader";
import LoginForm from "./loginForm";

interface Props {}

const LoginPage: React.FC<Props> = () => {
  const [isPageLoading, setIspageLoading] = useState<boolean>(true);

  // create some delay 3sec and check if the user is authenticated already
  useEffect(() => {
    const timeOut = setTimeout(() => {
      setIspageLoading(false);
    }, 3000);
    return () => clearTimeout(timeOut);
  }, []);

  // render preloader screen if the page is still loading
  if (isPageLoading) {
    return <Preloader />;
  }

  return (
    <div className="">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
