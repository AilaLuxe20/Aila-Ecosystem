import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Aila account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#030303]">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}