import { Bell, Camera, Layers, LogOut, Menu, User, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getAuthUserFromStorage } from "../../utils/authToken";

const navItems = [
  {
    to: "/teacher/groups",
    label: "Guruhlar",
    icon: Users,
    matcher: (pathname) => pathname.startsWith("/teacher/groups"),
  },
  {
    to: "/teacher/create-homework",
    label: "Yig'ilayotgan guruhlar",
    icon: Layers,
    matcher: (pathname) => pathname.startsWith("/teacher/create-homework"),
  },
];

export default function TeacherLayout() {
  const navigate = useNavigate();
  const authUser = useMemo(() => getAuthUserFromStorage(), []);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState("");
  const profileButtonRef = useRef(null);
  const profilePanelRef = useRef(null);
  const fileInputRef = useRef(null);

  const photoStorageKey = useMemo(
    () => `teacher_profile_photo_${authUser?.id || "guest"}`,
    [authUser?.id],
  );

  useEffect(() => {
    if (!authUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (authUser.role !== "TEACHER") {
      navigate("/dashboard", { replace: true });
    }
  }, [authUser, navigate]);

  useEffect(() => {
    const savedPhoto = localStorage.getItem(photoStorageKey);
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  }, [photoStorageKey]);

  useEffect(() => {
    if (!showProfilePanel) return undefined;

    const handleClickOutside = (event) => {
      if (
        profilePanelRef.current &&
        !profilePanelRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowProfilePanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfilePanel]);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;
      setProfilePhoto(result);
      localStorage.setItem(photoStorageKey, result);
    };
    reader.readAsDataURL(file);
  };

  const logout = () => {
    localStorage.removeItem("crm_access_token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#eef3f0]">
      <div className="flex min-h-screen">
        <aside className="flex w-62.5 flex-col border-r border-slate-200 bg-white shadow-sm">
          <div className="flex h-18 items-center gap-3 border-b border-slate-100 px-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Users size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-slate-800">Najot Talim</h1>
            </div>
            <Menu size={16} className="ml-auto text-slate-400" />
          </div>

          <div className="px-3 py-4">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Teacher panel
            </p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`
                    }
                    end={item.to === "/teacher/groups"}
                  >
                    <Icon size={16} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 p-3">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={16} />
              Chiqish
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-18 items-center justify-between border-b border-slate-200 bg-white px-5">
            <div className="text-sm font-medium text-slate-500">Teacher panel</div>
            <div className="flex items-center gap-4">
              <button type="button" className="text-slate-400">
                <Bell size={18} />
              </button>
              <div className="relative">
                <button
                  ref={profileButtonRef}
                  type="button"
                  onClick={() => setShowProfilePanel((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1"
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-emerald-700">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Teacher profile" className="h-full w-full object-cover" />
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                  <p className="max-w-45 truncate text-sm font-medium text-slate-700">
                    {authUser?.fullName || "Teacher"}
                  </p>
                </button>

                {showProfilePanel && (
                  <div
                    ref={profilePanelRef}
                    className="absolute right-0 top-12 z-50 w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
                  >
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                      <div className="h-14 w-14 overflow-hidden rounded-2xl bg-emerald-100">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Teacher profile" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-emerald-700">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-800">
                          {authUser?.fullName || "Teacher"}
                        </p>
                        <p className="truncate text-xs text-slate-500">{authUser?.email || "Email mavjud emas"}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <span className="text-slate-500">Rol</span>
                        <span className="font-semibold text-slate-800">{authUser?.role || "TEACHER"}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                        <span className="text-slate-500">ID</span>
                        <span className="font-semibold text-slate-800">{authUser?.id || "-"}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <Camera size={16} />
                        Rasm yuklash
                      </button>
                      <p className="mt-1 text-center text-xs text-slate-400">Faqat rasm, maksimal 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 p-4 md:p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
