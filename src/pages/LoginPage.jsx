import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/crmApi";
import { parseAuthToken } from "../utils/authToken";

export default function LoginPage() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast({ show: true, type, message });

    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleLogin = async () => {
    if (!login || !password) {
      showToast("error", "Login va parolni kiriting");
      return;
    }

    try {
      setLoading(true);

      const credentials = {
        email: login,
        password,
      };

      const loginFlows = [
        () => authApi.loginStudent(credentials),
        () => authApi.loginTeacher(credentials),
        () => authApi.loginAdmin(credentials),
      ];

      let result = null;
      let lastError = null;

      for (const flow of loginFlows) {
        try {
          result = await flow();
          if (result?.accessToken) break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!result?.accessToken) {
        throw lastError || new Error("Token kelmadi");
      }

      localStorage.setItem("crm_access_token", result.accessToken);
      showToast("success", "Tizimga muvaffaqiyatli kirdingiz");
      const parsed = parseAuthToken(result.accessToken);
      const nextRoute = parsed?.role === "STUDENT" ? "/student-dashboard" : "/dashboard";

      setTimeout(() => {
        navigate(nextRoute);
      }, 900);
    } catch (error) {
      showToast(
        "error",
        error?.response?.data?.message || "Login yoki parol noto'g'ri",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.20),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.20),_transparent_30%),linear-gradient(135deg,_#07111f_0%,_#0b172a_45%,_#111827_100%)]" />

      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />

      <div
        className={`fixed top-5 right-5 z-50 transition-all duration-500 ${
          toast.show
            ? "translate-y-0 opacity-100"
            : "-translate-y-3 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`min-w-[260px] rounded-2xl border px-5 py-4 text-white shadow-2xl backdrop-blur-xl ${
            toast.type === "error"
              ? "border-red-400/30 bg-red-500/80"
              : "border-emerald-400/30 bg-emerald-500/80"
          }`}
        >
          <p className="text-sm font-semibold tracking-wide">{toast.message}</p>
        </div>
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        <div className="hidden lg:flex items-center justify-center p-10">
          <div className="relative h-[86%] w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <img
              src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop"
              alt="office"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#07111f]/90 via-[#07111f]/35 to-transparent" />

            <div className="absolute left-8 right-8 bottom-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                CRM Platform
              </div>

              <h1 className="mt-5 text-5xl font-black leading-tight text-white">
                Najot Talim
              </h1>

              <p className="mt-4 max-w-lg text-base leading-7 text-white/75">
                Zamonaviy boshqaruv paneliga xavfsiz kirish. Tezkor, qulay va
                professional tizim.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[520px] rounded-[32px] border border-white/10 bg-white/10 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-7 text-white sm:p-10">
              <div className="mb-8">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-xl font-black text-slate-900 shadow-lg">
                  NT
                </div>

                <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Xush kelibsiz
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/70 sm:text-base">
                  Akkauntingizga kiring va dashboard orqali tizimni boshqaring.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/85">
                    Login
                  </label>
                  <div className="group flex items-center rounded-2xl border border-white/10 bg-white/10 px-4 transition-all duration-300 focus-within:border-emerald-400/60 focus-within:bg-white/15 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]">
                    <span className="mr-3 text-lg text-white/45">@</span>
                    <input
                      type="text"
                      value={login}
                      onChange={(e) => setLogin(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Email yoki login kiriting"
                      className="h-14 w-full bg-transparent text-white placeholder:text-white/35 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/85">
                    Parol
                  </label>
                  <div className="group flex items-center rounded-2xl border border-white/10 bg-white/10 px-4 transition-all duration-300 focus-within:border-cyan-400/60 focus-within:bg-white/15 focus-within:shadow-[0_0_0_4px_rgba(34,211,238,0.12)]">
                    <span className="mr-3 text-lg text-white/45">✦</span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Parolni kiriting"
                      className="h-14 w-full bg-transparent text-white placeholder:text-white/35 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="group relative mt-3 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 px-6 py-4 text-base font-bold text-slate-900 shadow-[0_12px_35px_rgba(16,185,129,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(34,211,238,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative z-10">
                    {loading ? "Kirilmoqda..." : "Kirish"}
                  </span>
                </button>
              </div>

              <div className="mt-7 flex items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-white/45 sm:text-sm">
                <span>Xavfsiz ulanish</span>
                <span>Modern CRM Login</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}