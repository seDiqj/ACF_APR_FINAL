"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError, AxiosResponse } from "axios";
import { useParentContext } from "@/contexts/ParentContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  LockKeyhole,
  Mail,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Globe2,
  CircleCheck,
} from "lucide-react";

const LoginPage = () => {
  const { reqForToastAndSetMessage, axiosInstance } = useParentContext();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      reqForToastAndSetMessage("Please fill all the fields!");
      return;
    }

    setLoading(true);

    axiosInstance
      .post("/authentication/login", { email, password, remember })
      .then((response: AxiosResponse<any>) => {
        reqForToastAndSetMessage(response.data.message);

        document.cookie = `access_token=${response.data.access_token}; path=/; max-age=86400; samesite=lax`;

        setRedirecting(true);
        router.push("/");
      })
      .catch((error: AxiosError<any>) => {
        const errorMsg =
          error.response?.data?.message ||
          "An error occurred during authentication.";

        setError(errorMsg);
        reqForToastAndSetMessage(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const disabled = loading || redirecting;

  return (
    <main className="min-h-screen bg-zinc-950 selection:bg-emerald-500/20 antialiased">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">

        {/* =====================================================
            LEFT — IMMERSIVE HERO
            ===================================================== */}
        <section className="relative hidden min-h-screen overflow-hidden lg:block">

          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-[1.03]"
            style={{
              backgroundImage:
                "url('/images/action-against-hunger-login.jpg')",
            }}
          />

          {/* Layered overlays */}
          <div className="absolute inset-0 bg-zinc-950/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/55 to-zinc-950/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/20" />

          {/* Ambient lights */}
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-emerald-400/15 blur-[140px]" />
          <div className="absolute -bottom-40 left-1/3 h-[450px] w-[450px] rounded-full bg-emerald-500/10 blur-[130px]" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between p-10 xl:p-14">

            {/* Brand */}
            <div className="flex items-center justify-between">

              <div className="group flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2.5 backdrop-blur-xl shadow-2xl">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>

                <div className="pr-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white">
                    Action Against Hunger
                  </p>

                  <p className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.2em] text-emerald-300/80">
                    Humanitarian Workspace
                  </p>
                </div>

              </div>

              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/10 px-3 py-2 text-[9px] font-medium uppercase tracking-wider text-white/60 backdrop-blur-md xl:flex">
                <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
                Global Platform
              </div>

            </div>

            {/* Main Hero */}
            <div className="max-w-2xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-300 backdrop-blur-md">
                <Sparkles className="h-3 w-3" />
                Global Mission Portal
              </div>

              <h1 className="max-w-xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white xl:text-6xl">
                A world
                <br />
                <span className="bg-gradient-to-r from-white via-white to-emerald-200 bg-clip-text text-transparent">
                  free from hunger.
                </span>
              </h1>

              <p className="mt-7 max-w-lg text-sm leading-7 text-white/65 xl:text-[15px]">
                We save, improve and protect lives by preventing, detecting
                and treating undernutrition, while helping communities build
                a more resilient future.
              </p>

              {/* Mission Stats */}
              <div className="mt-9 flex flex-wrap gap-3">

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-white/80">
                      Humanitarian Operations
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <CircleCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-white/80">
                      Global Collaboration
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="flex items-end justify-between border-t border-white/10 pt-5">

              <div>
                <p className="text-[10px] font-medium text-white/45">
                  Action Against Hunger International
                </p>

                <p className="mt-1 text-[9px] text-white/25">
                  Saving lives • Empowering communities
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[9px] text-white/45 backdrop-blur-md">
                <LockKeyhole className="h-3 w-3 text-emerald-400" />
                Secure Environment
              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            RIGHT — LOGIN
            ===================================================== */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-12 dark:bg-zinc-950 sm:px-10">

          {/* Ambient background */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-[450px] w-[450px] rounded-full bg-emerald-500/[0.07] blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-40 h-[450px] w-[450px] rounded-full bg-emerald-400/[0.04] blur-[120px]" />

          {/* Subtle grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.5) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10 w-full max-w-[390px]">

            {/* Mobile Brand */}
            <div className="mb-12 lg:hidden">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-900 dark:text-white">
                    Action Against Hunger
                  </p>

                  <p className="mt-1 text-[8px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                    Humanitarian Workspace
                  </p>
                </div>

              </div>

            </div>

            {/* Header */}
            <div className="mb-9">

              <div className="mb-4 flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,.6)]" />

                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                  Secure Gateway
                </span>

              </div>

              <h2 className="text-[32px] font-semibold tracking-[-0.04em] text-zinc-950 dark:text-white">
                Welcome back.
              </h2>

              <p className="mt-3 max-w-[340px] text-[12px] leading-6 text-zinc-500 dark:text-zinc-400">
                Sign in with your organizational identity to access the
                humanitarian workspace.
              </p>

            </div>

            {/* Form */}
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-0">

                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      className="flex items-start gap-3 rounded-2xl border border-red-500/15 bg-red-500/[0.06] px-4 py-3.5 text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200"
                    >
                      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                      <span className="font-medium leading-relaxed">
                        {error}
                      </span>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-2">

                    <Label
                      htmlFor="email"
                      className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300"
                    >
                      Organizational Email
                    </Label>

                    <div className="group relative">

                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-zinc-400 transition-colors duration-200 group-focus-within:text-emerald-500" />

                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="username@actionagainsthunger.org"
                        autoComplete="email"
                        disabled={disabled}
                        className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/80 pl-11 text-[12px] shadow-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus-visible:border-emerald-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700 dark:focus-visible:bg-zinc-900"
                      />

                    </div>

                  </div>

                  {/* Password */}
                  <div className="space-y-2">

                    <div className="flex items-center justify-between">

                      <Label
                        htmlFor="password"
                        className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-300"
                      >
                        Password
                      </Label>

                      <button
                        type="button"
                        className="text-[10px] font-semibold text-emerald-600 transition-colors hover:text-emerald-500 hover:underline dark:text-emerald-400"
                      >
                        Forgot password?
                      </button>

                    </div>

                    <div className="group relative">

                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-zinc-400 transition-colors duration-200 group-focus-within:text-emerald-500" />

                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                        disabled={disabled}
                        className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/80 pl-11 pr-11 text-[12px] shadow-none transition-all duration-200 placeholder:text-zinc-400 hover:border-zinc-300 focus-visible:border-emerald-500 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-emerald-500/10 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-zinc-700 dark:focus-visible:bg-zinc-900"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={disabled}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 focus:outline-none dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>

                    </div>

                  </div>

                  {/* Remember */}
                  <div className="flex items-center gap-2 pt-0.5">

                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={(value) => setRemember(!!value)}
                      disabled={disabled}
                      className="h-4 w-4 rounded-[5px] border-zinc-300 dark:border-zinc-700 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                    />

                    <Label
                      htmlFor="remember"
                      className="cursor-pointer select-none text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
                    >
                      Keep me signed in on this device
                    </Label>

                  </div>

                  {/* Login button */}
                  <Button
                    type="submit"
                    disabled={disabled}
                    className="group relative mt-2 h-12 w-full overflow-hidden rounded-2xl bg-emerald-600 font-semibold text-white shadow-lg shadow-emerald-600/15 transition-all duration-300 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50"
                  >

                    {/* Button glow */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                    {disabled ? (
                      <div className="relative flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">
                          {redirecting
                            ? "Redirecting..."
                            : "Authorizing..."}
                        </span>
                      </div>
                    ) : (
                      <div className="relative flex w-full items-center justify-center gap-2">
                        <span className="text-xs">
                          Sign into Platform
                        </span>

                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    )}

                  </Button>

                </form>

              </CardContent>
            </Card>

            {/* Security */}
            <div className="mt-9">

              <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">

                <div className="flex gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                      Authorized Access Monitoring
                    </p>

                    <p className="mt-1 text-[9px] leading-5 text-zinc-500 dark:text-zinc-400">
                      This system is private and monitored. Access is
                      restricted to verified staff and authorized partners.
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="mt-7 flex items-center justify-center gap-2 text-[9px] font-medium text-zinc-400 dark:text-zinc-600">

              <LockKeyhole className="h-3 w-3" />

              <span>
                Secure authentication environment
              </span>

              <span className="text-zinc-300 dark:text-zinc-700">
                •
              </span>

              <span>
                © {new Date().getFullYear()} ACF
              </span>

            </div>

          </div>
        </section>

      </div>
    </main>
  );
};

export default LoginPage;
