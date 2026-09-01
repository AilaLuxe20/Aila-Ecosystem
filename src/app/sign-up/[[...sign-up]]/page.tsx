import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an Aila account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030303]">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}