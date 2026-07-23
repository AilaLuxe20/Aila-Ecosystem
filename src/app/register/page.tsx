"use client";

import AuthCard from "@/components/auth/AuthCard";
import AuthDivider from "@/components/auth/AuthDivider";
import AuthFooter from "@/components/auth/AuthFooter";
import AuthHeader from "@/components/auth/AuthHeader";
import RegisterForm from "@/components/auth/RegisterForm";
import SocialLogin from "@/components/auth/SocialLogin";

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-black px-6 py-12">
            <AuthCard>
                <AuthHeader
                    title="Create your"
                    highlight="Aila Account"
                    subtitle="Build, automate and scale with Aila OS."
                />

                <RegisterForm />

                <AuthDivider />

                <SocialLogin />

                <AuthFooter
                    text="Already have an account?"
                    linkText="Sign In"
                    href="/login"
                />
            </AuthCard>
        </main>
    );
}