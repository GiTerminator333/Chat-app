import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import TopNavbar from "../components/TopNavbar";
import ThemeModal from "../components/ThemeModal";
import {
  ZapIcon,
  MailIcon,
  LoaderIcon,
  LockIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Link } from "react-router";

function LoginPage() {
  const [step, setStep] = useState("welcome"); // "welcome" | "credentials"
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();
  const { getTheme } = useThemeStore();
  const currentTheme = getTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="w-full flex items-center justify-center">
      <ThemeModal />
      <div className="relative w-[94vw] max-w-6xl h-[85vh] max-h-[780px] min-h-[580px] flex flex-col">
        <BorderAnimatedContainer>
          <div
            className="w-full h-full flex flex-col overflow-hidden backdrop-blur-md transition-colors duration-700 relative"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.85)" }}
          >
            {/* Dynamic Theme Color Background Tint Overlay */}
            <div
              className="absolute inset-0 transition-all duration-700 pointer-events-none z-0"
              style={{ backgroundColor: currentTheme.panelTint || "transparent" }}
            />

            {/* TOP NAVIGATION BAR */}
            <TopNavbar />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden z-10">
              {/* LEFT SIDE: Image Illustration & Header Text */}
              <div className="hidden md:flex md:w-1/2 flex-col justify-between p-8 border-r border-slate-800/80 bg-slate-950/40 relative overflow-hidden">
                <div className="z-10">
                  <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    SECURE GATEWAY
                  </span>
                  <h1 className="text-xl font-bold text-slate-100 mt-1 uppercase tracking-wide">
                    OPEN ZAPCHAT
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
                    Chats, photos, and reactions stay in sync — sign in on the right to continue.
                  </p>
                </div>

                {/* Proportionate Login Illustration Image */}
                <div className="flex items-center justify-center py-4 my-auto z-10">
                  <img
                    src="/login.png"
                    alt="ZapChat Login Illustration"
                    className="w-full max-w-[280px] lg:max-w-[320px] h-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
                  />
                </div>

                <div className="z-10 text-[10px] font-mono text-slate-500 tracking-wider">
                  END-TO-END SESSION · ENCRYPTED IN TRANSIT
                </div>
              </div>

              {/* RIGHT SIDE: Interactive 2-Step Sliding Login Flow */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex items-center justify-center relative overflow-hidden bg-black/40">
                {/* STEP 1: WELCOME SLIDING CARD */}
                <div
                  className={`w-full max-w-[340px] transition-all duration-500 ease-in-out transform ${
                    step === "welcome"
                      ? "translate-x-0 opacity-100 relative z-10"
                      : "-translate-x-full opacity-0 absolute pointer-events-none"
                  }`}
                >
                  <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 shadow-2xl backdrop-blur-xl text-center flex flex-col items-center">
                    {/* Cool Glowing Yellow Zap Logo Container */}
                    <div className="size-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-5">
                      <ZapIcon className="size-7 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.9)] animate-pulse" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-800/90 text-cyan-400 text-[11px] font-medium border border-slate-700/60 mb-3">
                      <ShieldCheckIcon className="size-3.5" />
                      <span>SECURE ENTRY</span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-100 mb-6">
                      Welcome to ZapChat
                    </h2>

                    {/* Continue Button */}
                    <button
                      onClick={() => setStep("credentials")}
                      className={`w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 ${currentTheme.btnClass}`}
                    >
                      <span>Continue</span>
                      <ArrowRightIcon className="size-4 stroke-[2.5]" />
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <ShieldCheckIcon className="size-3.5 text-emerald-500" />
                      <span>Protected session · TLS encryption</span>
                    </div>
                  </div>
                </div>

                {/* STEP 2: CREDENTIALS FORM CARD */}
                <div
                  className={`w-full max-w-[360px] transition-all duration-500 ease-in-out transform ${
                    step === "credentials"
                      ? "translate-x-0 opacity-100 relative z-10"
                      : "translate-x-full opacity-0 absolute pointer-events-none"
                  }`}
                >
                  <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-7 shadow-2xl backdrop-blur-xl">
                    {/* Back button to return to Step 1 */}
                    <button
                      onClick={() => setStep("welcome")}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 mb-5 transition-colors group"
                    >
                      <ArrowLeftIcon className="size-4 group-hover:-translate-x-1 transition-transform" />
                      <span>Back</span>
                    </button>

                    <div className="mb-5">
                      <h2 className="text-xl font-bold text-slate-100">Sign In to Your Account</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Enter your email and password to proceed
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Email Field */}
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1.5 block">Email</label>
                        <div className="relative">
                          <MailIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="johndoe@gmail.com"
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div>
                        <label className="text-xs font-medium text-slate-300 mb-1.5 block">Password</label>
                        <div className="relative">
                          <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                          <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className={`w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 mt-2 ${currentTheme.btnClass}`}
                      >
                        {isLoggingIn ? (
                          <LoaderIcon className="size-5 animate-spin" />
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </form>

                    <div className="mt-5 text-center text-xs text-slate-400">
                      <span>Don't have an account? </span>
                      <Link to="/signup" className={`font-semibold hover:underline ${currentTheme.textClass}`}>
                        Sign Up
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}

export default LoginPage;