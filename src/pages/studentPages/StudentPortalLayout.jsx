import React, { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { studentApi } from "../../api/crmApi";
import profileImage from "../../assets/profile-user.jpg";
import {
  StudentPortalContext,
  translations,
  cn,
  Icons,
} from "./studentPortalShared";

const { Home, Users, Settings, GraduationCap, Bell, LogOut, Moon, Sun, Languages } =
  Icons;

function Sidebar({ sidebarOpen, setSidebarOpen, student, t, darkMode }) {
  const navItems = [
    { to: "/student/home", label: t.home, icon: Home },
    { to: "/student/groups", label: t.groups, icon: Users },
    { to: "/student/settings", label: t.settings, icon: Settings },
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[2px] transition lg:hidden",
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-65 border-r transition-transform duration-300 lg:translate-x-0",
          darkMode
            ? "border-slate-800 bg-slate-950"
                : "border-slate-200 bg-slate-50",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div
            className={cn(
              "border-b px-4 py-5",
              darkMode ? "border-slate-800" : "border-slate-200"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p
                  className={cn(
                    "text-[15px] font-black tracking-wide",
                    darkMode ? "text-white" : "text-slate-900"
                  )}
                >
                  {t.brand}
                </p>
                <p
                  className={cn(
                    "text-[11px]",
                    darkMode ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  {t.brandSub}
                </p>
              </div>
            </div>
          </div>



          <nav className="flex-1 space-y-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                      isActive
                        ? darkMode
                          ? "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30"
                          : "bg-linear-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                        : darkMode
                        ? "text-slate-300 hover:bg-slate-900 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl",
                          isActive
                            ? "bg-white/20 text-white"
                            : darkMode
                            ? "bg-slate-900 text-slate-400"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

function Header({
  title,
  t,
  student,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  setSidebarOpen,
}) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b backdrop-blur",
        darkMode
          ? "border-slate-800 bg-slate-950/95"
          : "border-slate-200 bg-white/95"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-7">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl transition lg:hidden",
              darkMode
                ? "bg-slate-900 text-slate-200 hover:bg-slate-800"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            ☰
          </button>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-600">
              Najot Ta’lim
            </p>
            <h1
              className={cn(
                "text-[18px] font-black",
                darkMode ? "text-white" : "text-slate-900"
              )}
            >
              {title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1 rounded-2xl border p-1",
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            )}
          >
            <Languages className="ml-2 h-4 w-4 text-violet-500" />
            {["uz", "en", "ru"].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "rounded-xl px-2.5 py-1.5 text-[11px] font-bold uppercase transition",
                  language === lang
                    ? "bg-linear-to-r from-violet-600 to-fuchsia-500 text-white"
                    : darkMode
                    ? "text-slate-300 hover:bg-slate-800"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={() => setDarkMode((prev) => !prev)}
            className={cn(
              "flex h-10 items-center gap-2 rounded-2xl border px-3 transition",
              darkMode
                ? "border-slate-800 bg-slate-900 text-slate-100"
                : "border-slate-200 bg-white text-slate-700"
            )}
          >
            {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="text-xs font-semibold">{t.darkMode}</span>
          </button>

          <button
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-2xl border transition",
              darkMode
                ? "border-slate-800 bg-slate-900 text-slate-200"
                : "border-slate-200 bg-white text-slate-700"
            )}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-linear-to-r from-violet-600 to-fuchsia-500 px-1 text-[9px] font-bold text-white">
              3
            </span>
          </button>

          <button
            onClick={() => navigate("/student/settings")}
            className={cn(
              "flex items-center gap-2 rounded-2xl border px-2 py-1.5 transition",
              darkMode
                ? "border-slate-800 bg-slate-900 text-slate-100"
                : "border-slate-200 bg-white text-slate-700"
            )}
          >
            <div className="h-8 w-8 overflow-hidden rounded-xl bg-slate-200">
              <img
                src={student?.photo || profileImage}
                alt="profile"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="hidden max-w-30 truncate text-xs font-semibold sm:block">
              {student?.fullName || "Student"}
            </span>
          </button>

          <button
            onClick={() => {
              const ok = window.confirm(t.logoutConfirm);
              if (ok) {
                localStorage.removeItem("token");
                localStorage.removeItem("access_token");
                window.location.href = "/";
              }
            }}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
              darkMode
                ? "border-slate-800 bg-slate-900 text-slate-200"
                : "border-slate-200 bg-white text-slate-700"
            )}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default function StudentPortalLayout() {
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [groups, setGroups] = useState([]);
  const [lessonsByGroup, setLessonsByGroup] = useState({});
  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("student_portal_dark_mode");
    return saved ? JSON.parse(saved) : false;
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("student_portal_language") || "uz";
  });

  const t = translations[language] || translations.uz;

  useEffect(() => {
    localStorage.setItem("student_portal_dark_mode", JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("student_portal_language", language);
  }, [language]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profileResult, groupsResult] = await Promise.all([
          studentApi.getMyProfile(),
          studentApi.getMyGroups(),
        ]);

        const profile = profileResult?.data ?? profileResult ?? null;
        const groupList = Array.isArray(groupsResult?.data)
          ? groupsResult.data
          : Array.isArray(groupsResult)
          ? groupsResult
          : [];

        setStudent(profile);
        setGroups(groupList);
      } catch (error) {
        console.error("Student portal load failed", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const fetchGroupLessons = async (groupId) => {
    if (!groupId) return [];
    if (lessonsByGroup[groupId]) return lessonsByGroup[groupId];

    try {
      const result = await studentApi.getMyGroupLessons(groupId);
      const lessonList = Array.isArray(result?.data) ? result.data : [];
      setLessonsByGroup((prev) => ({ ...prev, [groupId]: lessonList }));
      return lessonList;
    } catch (error) {
      console.error("Student lessons load failed", error);
      return [];
    }
  };

  useEffect(() => {
    if (!groups.length) return;

    const loadAllLessons = async () => {
      const lessonsMap = {};

      for (const group of groups) {
        if (!group?.id) continue;
        try {
          const result = await studentApi.getMyGroupLessons(group.id);
          lessonsMap[group.id] = Array.isArray(result?.data) ? result.data : [];
        } catch (error) {
          console.error("Student group lessons load failed", error);
          lessonsMap[group.id] = [];
        }
      }

      setLessonsByGroup((prev) => ({ ...prev, ...lessonsMap }));
    };

    loadAllLessons();
  }, [groups]);

  const pageTitle = useMemo(() => {
    if (location.pathname.includes("/student/groups/") && location.pathname.includes("/lesson/")) {
      return t.lessonInfo;
    }
    if (location.pathname.includes("/student/groups/")) return t.lessons;
    if (location.pathname.includes("/student/groups")) return t.groups;
    if (location.pathname.includes("/student/settings")) return t.settings;
    return t.home;
  }, [location.pathname, t]);

  const contextValue = {
    student,
    setStudent,
    groups,
    setGroups,
    lessonsByGroup,
    setLessonsByGroup,
    fetchGroupLessons,
    loading,
    darkMode,
    setDarkMode,
    language,
    setLanguage,
    t,
  };

  return (
    <StudentPortalContext.Provider value={contextValue}>
      <div className={darkMode ? "dark" : ""}>
        <div
          className={cn(
            "min-h-screen",
            darkMode ? "bg-slate-950" : "bg-slate-100"
          )}
        >
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            student={student}
            t={t}
            darkMode={darkMode}
          />

          <div className="lg:pl-65">
            <Header
              title={pageTitle}
              t={t}
              student={student}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              language={language}
              setLanguage={setLanguage}
              setSidebarOpen={setSidebarOpen}
            />

            <main className="px-4 py-4 sm:px-5 lg:px-7">
              {loading ? (
                <div
                  className={cn(
                    "rounded-[28px] border p-8 text-center text-sm",
                    darkMode
                      ? "border-slate-800 bg-slate-900 text-slate-300"
                      : "border-slate-200 bg-white text-slate-600"
                  )}
                >
                  {t.loading}
                </div>
              ) : (
                <Outlet />
              )}
            </main>
          </div>
        </div>
      </div>
    </StudentPortalContext.Provider>
  );
}