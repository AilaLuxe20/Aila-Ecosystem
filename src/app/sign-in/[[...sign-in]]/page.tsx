import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { ClerkAuthFrame } from "@/components/auth/ClerkAuthFrame";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Aila account.",
  robots: {
    index: false,
    follow: false,
  },
};

type SignInPageProps = {
  searchParams: Promise<{ redirect_url?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectUrl =
    typeof params.redirect_url === "string" && params.redirect_url.startsWith("/")
      ? params.redirect_url
      : "/dashboard";

  return (
    <ClerkAuthFrame
      title="Sign in"
      description="Use your Aila account to open Writer and the rest of the ecosystem."
      loadingLabel="Loading sign-in…"
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </ClerkAuthFrame>
  );
}
