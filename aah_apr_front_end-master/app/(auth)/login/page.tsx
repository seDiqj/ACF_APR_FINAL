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
  Sparkles 
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
        const errorMsg = error.response?.data?.message || "An error occurred during authentication.";
        setError(errorMsg);
        reqForToastAndSetMessage(errorMsg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const disabled = loading || redirecting;

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 selection:bg-emerald-500/20 antialiased">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* =====================================================
            LEFT — HERO & BRANDING (Premium Modern Accent)
            ===================================================== */}
        <section className="relative hidden min-h-screen overflow-hidden lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center scale-105 animate-[pulse_8s_infinite_alternate]"
            style={{ backgroundImage: "url('/images/action-against-hunger-login.jpg')" }}
          />

          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/95 via-emerald-950/40 to-transparent" />
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex min-h-screen flex-col justify-between p-12 xl:p-16 text-white">
            
            {/* Header / Logo */}
            <div className="flex items-center gap-3.5 backdrop-blur-md bg-white/5 border border-white/10 p-3 pr-6 rounded-full w-fit shadow-2xl">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 shadow-inner">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.15em] text-white">
                  Action Against Hunger
                </div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">
                  Humanitarian Workspace
                </div>
              </div>
            </div>
            {/* Core Value Proposition */}
            <div className="max-w-xl pr-4">
              <div className="inline-flex items-center gap-2 mb-4 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                <Sparkles className="h-3 w-3" /> Global Mission Portal
              </div>
              <h1 className="text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl bg-gradient-to-r from-white via-white to-slate-200 bg-clip-text text-transparent">
                A world free <br />from hunger.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-slate-200/90 font-light">
                We save, improve and protect lives by preventing, detecting and treating undernutrition, while helping communities build a more resilient future.
              </p>
              
              <div className="mt-8 h-[2px] w-12 bg-gradient-to-r from-emerald-400 to-transparent rounded-full" />
              <p className="mt-5 text-xs leading-relaxed text-slate-300/70 max-w-md">
                Together with partners around the world, we target the root causes of hunger to engineer lasting global transformation.
              </p>
            </div>

            {/* Left Footer */}
            <div className="flex items-end justify-between border-t border-white/10 pt-6">
              <div>
                <p className="text-[11px] font-medium text-slate-400">Action Against Hunger International</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Saving lives • Empowering communities</p>
              </div>
              <div className="hidden items-center gap-2 text-[10px] tracking-wide text-slate-400 bg-white/5 px-3 py-1.5 rounded-md border border-white/5 xl:flex">
                <LockKeyhole className="h-3 w-3 text-emerald-400" /> End-to-End Encrypted
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================
            RIGHT — LOGIN INTERFACE (Clean & Hyper-focused)
            ===================================================== */}
        <section className="relative flex min-h-screen items-center justify-center px-6 py-16 sm:px-12 bg-white dark:bg-zinc-950">
          
          {/* Soft ambient lighting */}
          <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.02] blur-[100px]" />
          <div className="pointer-events-none absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-blue-500/[0.015] blur-[80px]" />

          <div className="relative z-10 w-full max-w-[380px]">
            
            {/* Responsive Mobile Header */}
            <div className="mb-10 lg:hidden flex items-center gap-3 bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/50 p-3 rounded-2xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-600/10">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                  Action Against Hunger
                </p>
                <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
                  Field Operations Portal
                </p>
              </div>
            </div>

            {/* Section Greeting */}
            <div className="mb-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 mb-2">
                Secure Gateway
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome back
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                Sign in with your organizational identity to safely access the global workspace.
              </p>
            </div>
            {/* Clean Form Component */}
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Error Notification */}
                  {error && (
                    <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-500/10 bg-red-500/[0.06] px-4 py-3 text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[11px] font-semibold tracking-wide text-slate-700 dark:text-zinc-300">
                      Organizational Email
                    </Label>
                    <div className="relative group">
                      <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="username@actionagainsthunger.org"
                        autoComplete="email"
                        disabled={disabled}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200/80 dark:bg-zinc-900/50 dark:border-zinc-800/80 pl-10 text-xs shadow-none transition-all duration-200 focus-visible:bg-white dark:focus-visible:bg-zinc-950 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-[11px] font-semibold tracking-wide text-slate-700 dark:text-zinc-300">
                        Password
                      </Label>
                      <a href="#" className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors">
                        Forgot password?
                      </a>
                    </div>
                    <div className="relative group">
                      <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                        disabled={disabled}
                        className="h-11 rounded-xl bg-slate-50 border-slate-200/80 dark:bg-zinc-900/50 dark:border-zinc-800/80 pl-10 pr-10 text-xs shadow-none transition-all duration-200 focus-visible:bg-white dark:focus-visible:bg-zinc-950 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={disabled}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={(value) => setRemember(!!value)}
                      disabled={disabled}
                      className="h-4 w-4 rounded-md border-slate-300 dark:border-zinc-700 data-[state=checked]:border-emerald-600 data-[state=checked]:bg-emerald-600"
                    />
                    <Label htmlFor="remember" className="cursor-pointer select-none text-xs font-medium text-slate-500 dark:text-zinc-400">
                      Keep me signed in on this device
                    </Label>
                  </div>

                  {/* Modern Action Button */}
                  <Button
                    type="submit"
                    disabled={disabled}
                    className="group mt-3 h-11 w-full rounded-xl bg-emerald-600 font-semibold text-white shadow-md shadow-emerald-600/10 transition-all duration-200 hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
                  >
                    {disabled ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>{redirecting ? "Redirecting..." : "Authorizing..."}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5 w-full">
                        <span>Sign into Platform</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </div>
                    )}
                  </Button>

                </form>
              </CardContent>
            </Card>

            {/* Bottom Compliance & Security info */}
            <div className="mt-8 border-t border-slate-100 dark:border-zinc-900 pt-5">
              <div className="flex items-start gap-3 bg-slate-50/60 dark:bg-zinc-900/30 p-3 rounded-xl border border-slate-100 dark:border-zinc-900">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200">
                    Authorized Access Monitoring
                  </p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500 dark:text-zinc-400">
                    This computer system is private. Access is limited only to verified active staff and compliant ecosystem partners.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Copyright */}
            <p className="mt-8 text-center text-[10px] font-medium tracking-wide text-slate-400 dark:text-zinc-500">
              &copy; {new Date().getFullYear()} Action Against Hunger. All rights reserved.
            </p>

          </div>
        </section>

      </div>
    </main>
  );
};

export default LoginPage;
