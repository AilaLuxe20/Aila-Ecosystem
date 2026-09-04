import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { ClerkAuthFrame } from "@/components/auth/ClerkAuthFrame";
import { safeRedirectPath } from "@/lib/utils/url";

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
  const redirectUrl = safeRedirectPath(params.redirect_url, "/dashboard");

  return (
    <ClerkAuthFrame
      title="Create your account"
      description="Join Aila to write, generate, and work across products with one account."
      loadingLabel="Loading sign-up…"
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl={redirectUrl}
        fallbackRedirectUrl={redirectUrl}
      />
    </ClerkAuthFrame>
  );
}
