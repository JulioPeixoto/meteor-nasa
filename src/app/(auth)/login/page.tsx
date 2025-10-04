"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { LogoGoogle, LoaderIcon } from "@/components/custom/icons";
import { Button } from "@/components/ui/temp-button";

function LoginForm() {
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/", prompt: "select_account" });
  };

  return (
    <div>
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-heading mb-2 text-white">
          Entrar
        </h1>
      </div>

      <Button
        type="button"
        variant="default"
        className="w-full h-11 sm:h-12 font-base text-sm sm:text-base"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        aria-busy={googleLoading}
        aria-label="Continuar com Google"
        title="Continuar com Google"
      >
        <LogoGoogle size={18} />
        <span className="flex-1 text-center">Continuar com Google</span>
        {googleLoading ? (
          <span className="animate-spin">
            <LoaderIcon />
          </span>
        ) : (
          <span className="w-4" />
        )}
      </Button>
    </div>
  );
}

export default function Page() {
  return (
    <AuthPageLayout>
      <LoginForm />
    </AuthPageLayout>
  );
}
