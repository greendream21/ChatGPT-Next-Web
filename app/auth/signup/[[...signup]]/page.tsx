import React from "react";
import Link from "next/link";
import Image from "next/image";
import { SignUp } from "@clerk/nextjs";

const SignUpPage: React.FC = () => {
  return (
    <>
      <div className="flex justify-center">
        <SignUp />
      </div>
    </>
  );
};

export default SignUpPage;
