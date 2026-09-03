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

type SignUpPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const redirectUrl =
    typeof params.redirect_url === "string" && params.redirect_url.startsWith("/")
      ? params.redirect_url
      : "/dashboard";

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#030303] px-4 py-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </div>
  );
}
