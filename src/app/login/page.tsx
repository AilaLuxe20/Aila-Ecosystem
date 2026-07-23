"use client";

import AuthCard from "@/components/auth/AuthCard";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader";
import LoginForm from "@/components/auth/LoginForm";
import SocialLogin from "@/components/auth/SocialLogin";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12">
      <AuthCard>
        <AuthHeader
          title="Welcome"
          highlight="Back"
          subtitle="Sign in to continue to Aila OS."
        />

        <LoginForm />

        <AuthDivider />

        <SocialLogin />

        <AuthFooter
          text="Don't have an account?"
          linkText="Create one"
          href="/register"
        />
      </AuthCard>
    </main>
  );
}