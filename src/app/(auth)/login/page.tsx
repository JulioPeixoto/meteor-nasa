"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { LogoGoogle, LoaderIcon } from "@/components/custom/icons";
import { Button } from "@/components/ui/button";

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
        variant="neutral"
        size="lg"
        className="w-full bg-white text-gray-900 hover:bg-gray-50 border-gray-900 gap-3"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        aria-busy={googleLoading}
        aria-label="Continuar com Google"
        title="Continuar com Google"
      >
        {googleLoading ? (
          <div className="w-5 h-5" />
        ) : (
          <LogoGoogle size={20} />
        )}
        <span className="flex-1 text-center font-medium">
          {googleLoading ? "Entrando..." : "Continuar com Google"}
        </span>
        {googleLoading ? (
          <div className="w-5 h-5 animate-spin flex items-center justify-center">
            <LoaderIcon size={20} />
          </div>
        ) : (
          <div className="w-5" />
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