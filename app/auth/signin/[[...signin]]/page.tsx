import React from "react";
import { SignIn } from "@clerk/nextjs";

const SignInPage: React.FC = () => {
  return (
    <>
      <div className="flex justify-center">
        <SignIn />
      </div>
    </>
  );
};

export default SignInPage;
