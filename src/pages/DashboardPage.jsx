import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomsPage from "./RoomsPage";
import EmployeesPage from "./XodimlarPage";
import TeachersPage from "./TeachersPage";
import StudentsPage from "./StudentsPage";
import GroupsPage from "./GroupsPage";
import GroupDetailsPage from "./GroupDetrailsPage";
import { coursesApi, groupsApi, studentsApi } from "../api/crmApi";
import { getAuthUserFromStorage } from "../utils/authToken";
import profileImage from "../assets/profile.jpg";

const menuItems = [
  { id: 1, key: "home", icon: "🏠" },
  { id: 2, key: "teachers", icon: "👨‍🏫" },
  { id: 3, key: "groups", icon: "📚" },
  { id: 4, key: "students", icon: "🎓" },
  { id: 5, key: "management", icon: "⚙️" },
];

const managementItems = [
  { id: 1, key: "courses", icon: "📘" },
  { id: 2, key: "rooms", icon: "🚪" },
  { id: 3, key: "employees", icon: "👤" },
  { id: 4, key: "teachers", icon: "👨‍🏫" },
];

const statsData = [
  { id: 1, key: "activeStudents", icon: "🎓" },
  { id: 2, key: "groups", icon: "👥" },
  { id: 3, key: "frozen", icon: "❄️" },
];

const percent = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const paymentBreakdown = [
  { key: "paid", value: 12500000, color: "from-emerald-500 to-teal-500" },
  { key: "pending", value: 3800000, color: "from-amber-500 to-orange-500" },
  { key: "balance", value: 2100000, color: "from-rose-500 to-red-500" },
];

const modeOptions = [
  { key: "light", label: "Light", icon: "☀️" },
  { key: "dark", label: "Dark", icon: "🌙" },
  { key: "neon", label: "Neon", icon: "⚡" },
];

const WEEKDAY_ENUMS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

const categories = [
  { id: 1, name: "Web dasturlash" },
  { id: 2, name: "English" },
  { id: 3, name: "Xalqaro" },
  { id: 4, name: "3D grafik dizayn" },
];

const translations = {
  uz: {
    brand: "Najot Talim",
    greeting: "Salom",
    logout: "Chiqish",
    home: "Asosiy",
    teachers: "O‘qituvchilar",
    groups: "Guruhlar",
    students: "Talabalar",
    management: "Boshqaruv",
    courses: "Kurslar",
    rooms: "Xonalar",
    employees: "Hodimlar",
    activeStudents: "Faol talabalar",
    frozen: "Muzlatilganlar",
    archived: "Arxivdagilar",
    monthlyPayments: "Joriy oy to‘lovlari",
    paid: "To‘langan",
    pending: "Kutilmoqda",
    balance: "Qoldiq",
    schedule: "Bugungi dars jadvali",
    noScheduleToday: "Bugun dars yo‘q",
    today: "Bugun",
    addCourse: "Kurs qo‘shish",
    editCourse: "Kursni tahrirlash",
    cancel: "Bekor qilish",
    save: "Saqlash",
    courseName: "Nomi",
    courseNamePlaceholder: "Kurs nomi",
    courseDurationMin: "Dars davomiyligi (min)",
    courseDurationMonth: "Kurs davomiyligi (oy)",
    price: "Narx",
    pricePlaceholder: "Masalan: 250000",
    description: "Tavsif",
    descriptionPlaceholder: "Kurs haqida qisqacha...",
    choose: "Tanlang",
    courseCategoriesTable: "Kurs kategoriyalari",
    noComment: "Izoh yo‘q",
    menu: "Boshqaruv menyusi",
    profile: "Profil",
    system: "Tizim boshqaruvi",
    darkMode: "Tungi rejim",
  },
  en: {
    brand: "Najot Talim",
    greeting: "Hello",
    logout: "Logout",
    home: "Home",
    teachers: "Teachers",
    groups: "Groups",
    students: "Students",
    management: "Management",
    courses: "Courses",
    rooms: "Rooms",
    employees: "Employees",
    activeStudents: "Active students",
    frozen: "Frozen",
    monthlyPayments: "Monthly payments",
    paid: "Paid",
    pending: "Pending",
    balance: "Balance",
    schedule: "Today’s schedule",
    noScheduleToday: "No classes today",
    today: "Today",
    addCourse: "Add course",
    editCourse: "Edit course",
    cancel: "Cancel",
    save: "Save",
    courseName: "Name",
    courseNamePlaceholder: "Course name",
    courseDurationMin: "Lesson duration (min)",
    courseDurationMonth: "Course duration (month)",
    price: "Price",
    pricePlaceholder: "Example: 250000",
    description: "Description",
    descriptionPlaceholder: "Short description...",
    choose: "Select",
    courseCategoriesTable: "Course categories",
    noComment: "No description",
    menu: "Management menu",
    profile: "Profile",
    system: "System control",
    darkMode: "Dark mode",
  },
  ru: {
    brand: "Najot Talim",
    greeting: "Здравствуйте",
    logout: "Выйти",
    home: "Главная",
    teachers: "Учителя",
    groups: "Группы",
    students: "Студенты",
    management: "Управление",
    courses: "Курсы",
    rooms: "Комнаты",
    employees: "Сотрудники",
    activeStudents: "Активные студенты",
    frozen: "Замороженные",
    monthlyPayments: "Платежи за месяц",
    paid: "Оплачено",
    pending: "Ожидается",
    balance: "Остаток",
    schedule: "Расписание на сегодня",
    noScheduleToday: "Сегодня занятий нет",
    today: "Сегодня",
    addCourse: "Добавить курс",
    editCourse: "Редактировать курс",
    cancel: "Отмена",
    save: "Сохранить",
    courseName: "Название",
    courseNamePlaceholder: "Название курса",
    courseDurationMin: "Длительность урока (мин)",
    courseDurationMonth: "Длительность курса (месяц)",
    price: "Цена",
    pricePlaceholder: "Например: 250000",
    description: "Описание",
    descriptionPlaceholder: "Кратко о курсе...",
    choose: "Выберите",
    courseCategoriesTable: "Категории курсов",
    noComment: "Нет описания",
    menu: "Меню управления",
    profile: "Профиль",
    system: "Управление системой",
    darkMode: "Тёмный режим",
  },
};

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  theme,
  type = "text",
}) {
  return (
    <div>
      <label className={`mb-2 block text-sm font-semibold ${theme.text}`}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${theme.input}`}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, items, theme, choose }) {
  return (
    <div>
      <label className={`mb-2 block text-sm font-semibold ${theme.text}`}>
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full rounded-2xl border px-4 py-3 outline-none transition ${theme.input}`}
      >
        <option value="">{choose}</option>
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function DashboardPage({ initialMenu = "home", panelMode = "admin" }) {
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(initialMenu);
  const [activeManagement, setActiveManagement] = useState("courses");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showManagementPanel, setShowManagementPanel] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [themeMode, setThemeMode] = useState("light");
  const [language, setLanguage] = useState("uz");
  const [showCourseDrawer, setShowCourseDrawer] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [courseSaving, setCourseSaving] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    activeStudents: 0,
    groups: 0,
    frozen: 0,
    totalStudents: 0,
    activeGroups: 0,
    totalGroups: 0,
  });
  const [scheduleData, setScheduleData] = useState({
    groups: [],
    coursesById: {},
  });

  const totalPayments = useMemo(
    () => paymentBreakdown.reduce((sum, item) => sum + item.value, 0),
    [],
  );

  const darkMode = themeMode !== "light";

  const [formData, setFormData] = useState({
    title: "",
    durationMin: "",
    durationMonth: "",
    price: "",
    description: "",
  });

  const managementButtonRef = useRef(null);
  const managementPanelRef = useRef(null);
  const profileButtonRef = useRef(null);
  const profilePanelRef = useRef(null);

  const t = useMemo(() => translations[language], [language]);
  const authUser = useMemo(() => getAuthUserFromStorage(), []);
  const isTeacherPanel = panelMode === "teacher" || authUser?.role === "TEACHER";
  const visibleMenuItems = useMemo(() => {
    if (isTeacherPanel) {
      return menuItems.filter((item) => ["home", "groups"].includes(item.key));
    }
    return menuItems;
  }, [isTeacherPanel]);

  useEffect(() => {
    if (authUser?.role === "TEACHER" && panelMode !== "teacher") {
      navigate("/teacher", { replace: true });
    }
  }, [authUser?.role, navigate, panelMode]);

  useEffect(() => {
    if (!isTeacherPanel) return;
    if (!["home", "groups"].includes(activeMenu)) {
      setActiveMenu("groups");
    }
  }, [activeMenu, isTeacherPanel]);

  const greetingName = useMemo(() => {
    const baseName =
      authUser?.fullName || authUser?.email?.split("@")[0] || "Foydalanuvchi";
    const parts = String(baseName).trim().split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return `${parts[parts.length - 1]} ${parts.slice(0, -1).join(" ")}`;
    }

    return baseName;
  }, [authUser]);

  const greetingText = `${t.greeting}, ${greetingName}!`;

  const profileName = authUser?.fullName || "Dilshod Olimov";
  const profileEmail = authUser?.email || "dilshodolimovv7@gmail.com";
  const profileRole = authUser?.role || "ADMIN";
  const profilePhoto = authUser?.photo || profileImage;

  const todaySchedule = useMemo(() => {
    const todayEnum = WEEKDAY_ENUMS[new Date().getDay()];

    const toEndTime = (startTime, durationMinutes) => {
      if (!startTime || !durationMinutes) return "-";

      const [hour = 0, minute = 0] = String(startTime)
        .split(":")
        .map((n) => Number(n));
      const startMinutes = hour * 60 + minute;
      const endMinutes = startMinutes + Number(durationMinutes || 0);
      const endHour = Math.floor(endMinutes / 60) % 24;
      const endMinute = endMinutes % 60;

      return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
    };

    return (scheduleData.groups || [])
      .filter(
        (group) =>
          Array.isArray(group.weekDays) && group.weekDays.includes(todayEnum),
      )
      .map((group) => {
        const course = scheduleData.coursesById[group.courseId];
        const duration = Number(course?.durationLesson || 0);
        return {
          id: group.id,
          name: group.name || "-",
          startTime: group.startTime || "-",
          endTime: toEndTime(group.startTime, duration),
        };
      })
      .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  }, [scheduleData]);

  const trendCards = useMemo(
    () => [
      {
        id: "conversion",
        title: "Konversiya",
        value: `${percent(dashboardStats.activeStudents, Math.max(dashboardStats.totalStudents, 1))}%`,
        note: "Faol talaba ulushi",
        tone: "from-emerald-500 to-teal-500",
      },
      {
        id: "groupHealth",
        title: "Guruh holati",
        value: `${percent(dashboardStats.activeGroups, Math.max(dashboardStats.totalGroups, 1))}%`,
        note: "Aktiv guruhlar",
        tone: "from-cyan-500 to-blue-500",
      },
      {
        id: "load",
        title: "Bandlik",
        value: `${Math.min(95, 30 + todaySchedule.length * 12)}%`,
        note: "Bugungi jadval yuklamasi",
        tone: "from-violet-500 to-fuchsia-500",
      },
    ],
    [dashboardStats.activeGroups, dashboardStats.activeStudents, dashboardStats.totalGroups, dashboardStats.totalStudents, todaySchedule.length],
  );

  const recentActivities = useMemo(
    () => [
      {
        id: 1,
        title: "Yangi guruhlar monitoringi",
        description: `${dashboardStats.groups} ta guruh nazoratda`,
        time: "Hozir",
      },
      {
        id: 2,
        title: "Dars jadvali sinxronlandi",
        description: `${todaySchedule.length} ta dars bugungi ro'yxatda`,
        time: "12 daqiqa oldin",
      },
      {
        id: 3,
        title: "Talabalar ko'rsatkichlari yangilandi",
        description: `${dashboardStats.activeStudents} faol talaba`,
        time: "38 daqiqa oldin",
      },
    ],
    [dashboardStats.activeStudents, dashboardStats.groups, todaySchedule.length],
  );

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      const result = await coursesApi.getAll();
      const list = Array.isArray(result?.data) ? result.data : [];
      setCourses(
        list.map((course) => ({
          id: course.id,
          title: course.name,
          durationMin: String(course.durationLesson ?? ""),
          durationMonth: String(course.durationMonth ?? ""),
          price: String(course.price ?? ""),
          description: course.description || t.noComment,
        })),
      );
    } catch {
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    const loadDashboardStats = async () => {
      const [studentsRes, groupsRes, coursesRes] = await Promise.allSettled([
        studentsApi.getAll(),
        groupsApi.getAll(),
        coursesApi.getAll(),
      ]);

      const students =
        studentsRes.status === "fulfilled" &&
        Array.isArray(studentsRes.value?.data)
          ? studentsRes.value.data
          : [];
      const groups =
        groupsRes.status === "fulfilled" && Array.isArray(groupsRes.value?.data)
          ? groupsRes.value.data
          : [];
      const visibleGroups =
        authUser?.role === "TEACHER"
          ? groups.filter((group) => Number(group.teacherId) === Number(authUser?.id))
          : groups;
      const courses =
        coursesRes.status === "fulfilled" &&
        Array.isArray(coursesRes.value?.data)
          ? coursesRes.value.data
          : [];

      setScheduleData({
        groups: visibleGroups,
        coursesById: Object.fromEntries(courses.map((course) => [course.id, course])),
      });

      setDashboardStats({
        activeStudents: students.filter((student) => student.status === "ACTIVE").length,
        groups: visibleGroups.length,
        frozen: visibleGroups.filter((group) => group.status === "FREEZE").length,
        totalStudents: students.length,
        activeGroups: visibleGroups.filter((group) => group.status === "ACTIVE").length,
        totalGroups: visibleGroups.length,
      });
    };

    loadDashboardStats();
  }, [authUser?.id, authUser?.role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showManagementPanel &&
        managementPanelRef.current &&
        !managementPanelRef.current.contains(event.target) &&
        managementButtonRef.current &&
        !managementButtonRef.current.contains(event.target)
      ) {
        setShowManagementPanel(false);
      }

      if (
        showProfilePanel &&
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
  }, [showManagementPanel, showProfilePanel]);

  const themePalette = {
    light: {
      app: "bg-slate-100",
      appGradient: "from-[#f8fafc] via-[#eef2ff] to-[#f5f3ff]",
      sidebar: "border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_10px_50px_rgba(15,23,42,0.08)]",
      main: "",
      card: "border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
      text: "text-slate-900",
      soft: "text-slate-500",
      menu: "text-slate-700",
      hover: "hover:bg-slate-100",
      topBtn: "border-slate-200 bg-white/80 text-slate-700 hover:bg-white",
      active: "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-[0_12px_30px_rgba(139,92,246,0.28)]",
      select: "border-slate-200 bg-white/80 text-slate-700",
      subpanel: "border-white/80 bg-white/95 backdrop-blur-2xl",
      submenuActive: "bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 border border-violet-100",
      submenuText: "text-slate-700",
      rowBorder: "border-slate-200",
      input: "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-400",
      overlay: "bg-slate-900/30 backdrop-blur-sm",
      tab: "bg-white text-slate-600 border-slate-200",
      tabActive: "bg-violet-100 text-violet-700 border-violet-200",
      chip: "bg-slate-50 text-slate-600 border-slate-200",
      tableHead: "bg-slate-50/90",
      drawer: "bg-white border-slate-200 text-slate-900",
      accentText: "text-violet-600",
      accentBg: "from-violet-600 to-fuchsia-600",
      modeRing: "ring-violet-300/70",
    },
    dark: {
      app: "bg-slate-950",
      appGradient: "from-slate-950 via-slate-950 to-violet-950/30",
      sidebar: "border-white/10 bg-white/5 backdrop-blur-xl",
      main: "",
      card: "border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]",
      text: "text-white",
      soft: "text-slate-400",
      menu: "text-slate-200",
      hover: "hover:bg-white/10",
      topBtn: "border-white/10 bg-white/10 text-white hover:bg-white/15",
      active: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_12px_30px_rgba(139,92,246,0.35)]",
      select: "border-white/10 bg-white/10 text-white",
      subpanel: "border-white/10 bg-slate-950/95 backdrop-blur-2xl",
      submenuActive: "bg-gradient-to-r from-violet-600/25 to-fuchsia-600/25 text-white border border-violet-400/20",
      submenuText: "text-slate-200",
      rowBorder: "border-white/10",
      input: "border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-violet-400",
      overlay: "bg-slate-950/60 backdrop-blur-sm",
      tab: "bg-white/5 text-slate-300 border-white/10",
      tabActive: "bg-violet-600 text-white border-violet-500",
      chip: "bg-white/5 text-slate-200 border-white/10",
      tableHead: "bg-white/5",
      drawer: "bg-slate-950 border-white/10 text-white",
      accentText: "text-violet-300",
      accentBg: "from-violet-500 to-fuchsia-500",
      modeRing: "ring-violet-500/60",
    },
    neon: {
      app: "bg-[#050816]",
      appGradient: "from-[#050816] via-[#071225] to-[#031b1c]",
      sidebar: "border-cyan-400/20 bg-[#071327]/80 backdrop-blur-xl shadow-[0_15px_70px_rgba(6,182,212,0.16)]",
      main: "",
      card: "border-cyan-400/20 bg-[#08172c]/75 backdrop-blur-xl shadow-[0_20px_80px_rgba(6,182,212,0.14)]",
      text: "text-cyan-50",
      soft: "text-cyan-200/70",
      menu: "text-cyan-100/90",
      hover: "hover:bg-cyan-400/10",
      topBtn: "border-cyan-300/20 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-400/20",
      active: "bg-gradient-to-r from-cyan-500 to-lime-400 text-[#04202a] shadow-[0_14px_35px_rgba(34,211,238,0.35)]",
      select: "border-cyan-300/20 bg-cyan-500/10 text-cyan-50",
      subpanel: "border-cyan-400/20 bg-[#071327]/95 backdrop-blur-2xl",
      submenuActive: "bg-gradient-to-r from-cyan-500/25 to-lime-400/25 text-cyan-50 border border-cyan-400/30",
      submenuText: "text-cyan-100/90",
      rowBorder: "border-cyan-400/20",
      input: "border-cyan-300/20 bg-cyan-500/10 text-cyan-50 placeholder:text-cyan-200/50 focus:border-cyan-300",
      overlay: "bg-[#020617]/60 backdrop-blur-sm",
      tab: "bg-cyan-500/10 text-cyan-100 border-cyan-300/20",
      tabActive: "bg-cyan-400/25 text-cyan-50 border-cyan-300/40",
      chip: "bg-cyan-500/10 text-cyan-100 border-cyan-300/20",
      tableHead: "bg-cyan-500/10",
      drawer: "bg-[#050f1f] border-cyan-400/20 text-cyan-50",
      accentText: "text-cyan-300",
      accentBg: "from-cyan-500 to-lime-400",
      modeRing: "ring-cyan-300/70",
    },
  };

  const theme = themePalette[themeMode];

  const resetForm = () => {
    setEditingCourseId(null);
    setFormData({
      title: "",
      durationMin: "",
      durationMonth: "",
      price: "",
      description: "",
    });
  };

  const openAddDrawer = () => {
    resetForm();
    setShowCourseDrawer(true);
  };

  const openEditDrawer = (course) => {
    setEditingCourseId(course.id);
    setFormData({
      title: course.title,
      durationMin: course.durationMin,
      durationMonth: course.durationMonth,
      price: course.price,
      description: course.description,
    });
    setShowCourseDrawer(true);
  };

  const closeDrawer = () => {
    setShowCourseDrawer(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveCourse = async () => {
    if (
      !formData.title.trim() ||
      !formData.durationMin.trim() ||
      !formData.durationMonth.trim() ||
      !formData.price.trim()
    ) {
      return;
    }

    try {
      setCourseSaving(true);
      const payload = {
        name: formData.title.trim(),
        durationLesson: Number(formData.durationMin),
        durationMonth: Number(formData.durationMonth),
        price: formData.price,
        description: formData.description || t.noComment,
      };

      if (editingCourseId) {
        await coursesApi.update(editingCourseId, payload);
      } else {
        await coursesApi.create(payload);
      }

      await loadCourses();
      closeDrawer();
      resetForm();
    } catch (error) {
      alert(error?.response?.data?.message || "Kursni saqlashda xato");
    } finally {
      setCourseSaving(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await coursesApi.remove(id);
      await loadCourses();
    } catch (error) {
      alert(error?.response?.data?.message || "Kursni o‘chirishda xato");
    }
  };

  const renderCoursesSection = () => {
    return (
      <div className="space-y-7">
        <div className={`${theme.card} rounded-[28px] border p-6`}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className={`text-2xl font-black ${theme.text}`}>{t.courses}</h2>
              <p className={`mt-1 text-sm ${theme.soft}`}>
                Kurslarni zamonaviy boshqaruv panelidan nazorat qiling
              </p>
            </div>

            <button
              onClick={openAddDrawer}
              className="rounded-2xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-[0_14px_35px_rgba(139,92,246,0.35)] transition hover:scale-[1.02]"
            >
              + {t.addCourse}
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {coursesLoading && (
              <div className={`${theme.card} rounded-3xl border p-5 ${theme.soft}`}>
                Kurslar yuklanmoqda...
              </div>
            )}

            {!coursesLoading &&
              courses.map((course) => (
                <div
                  key={course.id}
                  className={`${theme.card} group relative overflow-hidden rounded-[26px] border p-5 transition hover:-translate-y-1`}
                >
                  <div className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-violet-400/70 to-transparent" />
                  <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <h3 className={`text-xl font-bold ${theme.text}`}>{course.title}</h3>
                      <p className={`mt-1 text-sm leading-6 ${theme.soft}`}>
                        {course.description}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200/60 bg-red-50/70 text-sm transition hover:scale-105"
                      >
                        🗑️
                      </button>
                      <button
                        onClick={() => openEditDrawer(course)}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/70 text-sm transition hover:scale-105"
                      >
                        ✏️
                      </button>
                    </div>
                  </div>

                  <div className="relative mt-6 flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1.5 text-xs ${theme.chip}`}>
                      {course.durationMin} min
                    </span>
                    <span className={`rounded-full border px-3 py-1.5 text-xs ${theme.chip}`}>
                      {course.durationMonth} oy
                    </span>
                    <span className={`rounded-full border px-3 py-1.5 text-xs ${theme.chip}`}>
                      {Number(course.price).toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className={`${theme.card} rounded-[28px] border p-6`}>
          <h3 className={`mb-4 text-xl font-bold ${theme.text}`}>{t.courseCategoriesTable}</h3>

          <div className={`overflow-hidden rounded-3xl border ${theme.rowBorder}`}>
            <table className="w-full text-sm">
              <thead className={theme.tableHead}>
                <tr>
                  <th className={`px-4 py-4 text-left font-bold ${theme.text}`}>#</th>
                  <th className={`px-4 py-4 text-left font-bold ${theme.text}`}>Nomi</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((item) => (
                  <tr key={item.id} className={`border-t ${theme.rowBorder}`}>
                    <td className={`px-4 py-4 ${theme.text}`}>{item.id}</td>
                    <td className={`px-4 py-4 ${theme.text}`}>{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showCourseDrawer && (
          <div className={`fixed inset-0 z-120 ${theme.overlay}`}>
            <div className={`absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l shadow-2xl ${theme.drawer}`}>
              <div className={`sticky top-0 z-10 flex items-center justify-between border-b px-6 py-5 backdrop-blur-xl ${theme.drawer}`}>
                <h2 className="text-xl font-black">
                  {editingCourseId ? t.editCourse : t.addCourse}
                </h2>
                <button
                  onClick={closeDrawer}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5 p-6">
                <InputField
                  label={t.courseName}
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder={t.courseNamePlaceholder}
                  theme={theme}
                />

                <SelectField
                  label={t.courseDurationMin}
                  name="durationMin"
                  value={formData.durationMin}
                  onChange={handleFormChange}
                  choose={t.choose}
                  items={[
                    { value: "60", label: "60 min" },
                    { value: "90", label: "90 min" },
                    { value: "120", label: "120 min" },
                  ]}
                  theme={theme}
                />

                <SelectField
                  label={t.courseDurationMonth}
                  name="durationMonth"
                  value={formData.durationMonth}
                  onChange={handleFormChange}
                  choose={t.choose}
                  items={[
                    { value: "3", label: "3 oy" },
                    { value: "6", label: "6 oy" },
                    { value: "9", label: "9 oy" },
                    { value: "12", label: "12 oy" },
                  ]}
                  theme={theme}
                />

                <InputField
                  label={t.price}
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  placeholder={t.pricePlaceholder}
                  theme={theme}
                />

                <div>
                  <label className={`mb-2 block text-sm font-semibold ${theme.text}`}>
                    {t.description}
                  </label>
                  <textarea
                    rows="4"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder={t.descriptionPlaceholder}
                    className={`w-full resize-none rounded-2xl border px-4 py-3 outline-none ${theme.input}`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t p-6">
                <button
                  onClick={closeDrawer}
                  className="rounded-2xl border border-slate-200 px-5 py-3 font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSaveCourse}
                  disabled={courseSaving}
                  className="rounded-2xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 py-3 font-semibold text-white shadow-[0_14px_35px_rgba(139,92,246,0.35)]"
                >
                  {courseSaving ? "Saqlanmoqda..." : t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderManagementContent = () => {
    if (activeManagement === "courses") return renderCoursesSection();
    if (activeManagement === "rooms") return <RoomsPage theme={theme} darkMode={darkMode} />;
    if (activeManagement === "employees") return <EmployeesPage theme={theme} darkMode={darkMode} />;
    if (activeManagement === "teachers") {
      return <TeachersPage theme={theme} darkMode={darkMode} currentUser={authUser} />;
    }
    return null;
  };

  const handleStatCardClick = (key) => {
    if (key === "activeStudents") {
      setSelectedGroup(null);
      setShowManagementPanel(false);
      setActiveMenu("students");
      return;
    }

    if (key === "groups") {
      setSelectedGroup(null);
      setShowManagementPanel(false);
      setActiveMenu("groups");
    }
  };

  const renderContent = () => {
    if (activeMenu === "home") {
      return (
        <>
          <div className="mb-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className={`${theme.card} relative overflow-hidden rounded-[30px] border p-5 xl:p-6`}>
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="absolute -bottom-12 left-20 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />

              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.3em] ${theme.accentText}`}>
                    Command Center
                  </p>
                  <h3 className={`mt-2 text-3xl font-black ${theme.text}`}>
                    Real vaqt monitoring
                  </h3>
                  <p className={`mt-2 text-sm ${theme.soft}`}>
                    KPI, to'lov, guruhlar va jadval bir joyda boshqariladi.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setActiveMenu("groups");
                      setSelectedGroup(null);
                    }}
                    className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${theme.topBtn}`}
                  >
                    + Guruhlar
                  </button>
                  {!isTeacherPanel && (
                    <button
                      onClick={() => {
                        setActiveMenu("students");
                        setSelectedGroup(null);
                      }}
                      className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${theme.topBtn}`}
                    >
                      + Talabalar
                    </button>
                  )}
                  {!isTeacherPanel && (
                    <button
                      onClick={() => {
                        setActiveMenu("management");
                        setActiveManagement("courses");
                      }}
                      className="rounded-2xl bg-linear-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(139,92,246,0.28)]"
                    >
                      + Kurs qo'shish
                    </button>
                  )}
                </div>
              </div>

              <div className="relative mt-5 grid gap-3 sm:grid-cols-3">
                {trendCards.map((card) => (
                  <div
                    key={card.id}
                    className={`rounded-3xl border p-4 ${darkMode ? "border-white/10 bg-white/5" : "border-white/80 bg-white/70"}`}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${theme.soft}`}>
                      {card.title}
                    </p>
                    <h4 className={`mt-2 text-2xl font-black ${theme.text}`}>{card.value}</h4>
                    <p className={`mt-1 text-xs ${theme.soft}`}>{card.note}</p>
                    <div className={`mt-3 h-2 overflow-hidden rounded-full ${darkMode ? "bg-white/10" : "bg-slate-100"}`}>
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${card.tone}`}
                        style={{ width: card.value }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${theme.card} rounded-[30px] border p-5 xl:p-6`}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className={`text-2xl font-black ${theme.text}`}>Activity Feed</h3>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                  LIVE
                </span>
              </div>

              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`rounded-2xl border p-4 ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white/80"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-semibold ${theme.text}`}>{activity.title}</p>
                      <span className={`text-xs ${theme.soft}`}>{activity.time}</span>
                    </div>
                    <p className={`mt-1 text-sm ${theme.soft}`}>{activity.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statsData.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleStatCardClick(item.key)}
                className={`${theme.card} group relative overflow-hidden rounded-[28px] border p-5 text-left transition hover:-translate-y-1.5 ${
                  {
                    activeStudents: "cursor-pointer",
                    groups: "cursor-pointer",
                  }[item.key] || "cursor-default"
                }`}
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-violet-500/15 blur-2xl transition group-hover:scale-110" />
                <div className="relative">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${theme.accentBg} text-2xl text-white shadow-[0_10px_30px_rgba(139,92,246,0.28)]`}>
                    {item.icon}
                  </div>
                  <p className={`mb-2 text-sm ${theme.soft}`}>{t[item.key]}</p>
                  <h3 className={`text-3xl font-black ${theme.text}`}>{dashboardStats[item.key] ?? 0}</h3>

                  <div className="mt-4 space-y-2">
                    <div className={`h-2 w-full overflow-hidden rounded-full ${darkMode ? "bg-white/10" : "bg-slate-100"}`}>
                      <div
                        className="h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500"
                        style={{
                          width: `${
                            item.key === "activeStudents"
                              ? percent(
                                  dashboardStats.activeStudents,
                                  dashboardStats.totalStudents,
                                )
                              : item.key === "groups"
                              ? 100
                              : item.key === "frozen"
                              ? percent(dashboardStats.frozen, dashboardStats.totalGroups)
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <p className={`text-xs font-semibold ${theme.soft}`}>
                      {item.key === "activeStudents"
                        ? `${
                            percent(
                              dashboardStats.activeStudents,
                              dashboardStats.totalStudents,
                            )
                          }% faol`
                        : item.key === "groups"
                        ? `${dashboardStats.totalGroups || 0} ta guruh`
                        : item.key === "frozen"
                        ? `${percent(dashboardStats.frozen, dashboardStats.totalGroups)}% muzlatilgan`
                        : ""}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid gap-5 2xl:grid-cols-[1.15fr_0.85fr]">
            <div className={`${theme.card} rounded-[30px] border p-5 xl:p-6`}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className={`text-2xl font-black ${theme.text}`}>{t.monthlyPayments}</h2>
                  <p className={`mt-1 text-sm ${theme.soft}`}>{t.system}</p>
                </div>
                <div className={`rounded-full bg-linear-to-r ${theme.accentBg} px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(139,92,246,0.28)]`}>
                  Premium
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
                  {paymentBreakdown.map((item) => {
                    const valuePercent = percent(item.value, totalPayments);

                    return (
                      <div
                        key={item.key}
                        className={`rounded-3xl border p-4 shadow-sm ${
                          item.key === "paid"
                            ? darkMode
                              ? "border-emerald-500/20 bg-emerald-500/10"
                              : "border-emerald-200/60 bg-emerald-50/90"
                            : item.key === "pending"
                            ? darkMode
                              ? "border-amber-500/20 bg-amber-500/10"
                              : "border-amber-200/60 bg-amber-50/90"
                            : darkMode
                            ? "border-rose-500/20 bg-rose-500/10"
                            : "border-rose-200/60 bg-rose-50/90"
                        }`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-sm text-slate-500">{t[item.key]}</p>
                          <span className="text-xs font-bold text-slate-400">{valuePercent}%</span>
                        </div>
                        <h3
                          className={`text-xl font-black ${
                            item.key === "paid"
                              ? "text-emerald-600"
                              : item.key === "pending"
                              ? "text-amber-600"
                              : "text-rose-500"
                          }`}
                        >
                          {item.value.toLocaleString()} so‘m
                        </h3>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/60">
                          <div
                            className={`h-full rounded-full bg-linear-to-r ${item.color}`}
                            style={{ width: `${Math.max(valuePercent, 8)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={`rounded-3xl border p-4 ${darkMode ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
                  <p className={`text-sm font-semibold ${theme.soft}`}>To‘lovlar grafigi</p>
                  <div className="mt-4 flex h-48 items-end gap-3 rounded-2xl bg-linear-to-b from-white/70 to-slate-50/70 p-4">
                    {paymentBreakdown.map((item) => {
                      const valuePercent = percent(item.value, totalPayments);

                      return (
                        <div key={item.key} className="flex flex-1 flex-col items-center gap-2">
                          <div
                            className={`w-full rounded-t-2xl bg-linear-to-t ${item.color} shadow-[0_10px_25px_rgba(0,0,0,0.08)]`}
                            style={{ height: `${Math.max(valuePercent * 1.2, 24)}%` }}
                          />
                          <span className={`text-xs font-semibold ${theme.soft}`}>{t[item.key]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className={`${theme.card} rounded-[30px] border p-5 xl:p-6`}>
                <h2 className={`mb-4 text-2xl font-black ${theme.text}`}>{t.schedule}</h2>
                <div className="max-h-52 space-y-3 overflow-y-auto pr-1">
                  {todaySchedule.length === 0 && (
                    <div className={`rounded-3xl border p-4 text-sm ${theme.rowBorder} ${theme.soft}`}>
                      {t.noScheduleToday}
                    </div>
                  )}

                  {todaySchedule.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between rounded-3xl border p-4 ${theme.rowBorder}`}
                    >
                      <div>
                        <h3 className={`text-lg font-bold ${theme.text}`}>{lesson.name}</h3>
                        <p className={theme.soft}>
                          {lesson.startTime} - {lesson.endTime}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                        {t.today}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`${theme.card} rounded-[30px] border p-5 xl:p-6`}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className={`text-2xl font-black ${theme.text}`}>Guruhlar bo‘yicha foizlar</h2>
                    <p className={`mt-1 text-sm ${theme.soft}`}>Holat taqsimoti ko‘rinishda</p>
                  </div>
                  <div className="rounded-full bg-linear-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(16,185,129,0.22)]">
                    {dashboardStats.totalGroups || 0} ta guruh
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    {
                      label: "Aktiv",
                      value: dashboardStats.activeGroups,
                      total: dashboardStats.totalGroups,
                      color: "from-emerald-500 to-teal-500",
                      bg: darkMode ? "bg-emerald-500/10" : "bg-emerald-50",
                    },
                    {
                      label: "Muzlatilgan",
                      value: dashboardStats.frozen,
                      total: dashboardStats.totalGroups,
                      color: "from-amber-500 to-orange-500",
                      bg: darkMode ? "bg-amber-500/10" : "bg-amber-50",
                    },
                    {
                      label: "Muzlatilgan",
                      value: dashboardStats.frozen,
                      total: dashboardStats.totalGroups,
                      color: "from-rose-500 to-red-500",
                      bg: darkMode ? "bg-rose-500/10" : "bg-rose-50",
                    },
                  ].map((item) => {
                    const valuePercent = percent(item.value, item.total);

                    return (
                      <div
                        key={item.label}
                        className={`rounded-3xl border p-4 ${item.bg} ${darkMode ? "border-white/10" : "border-slate-200"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-sm font-semibold ${theme.soft}`}>{item.label}</p>
                          <span className="text-xs font-bold text-slate-400">{valuePercent}%</span>
                        </div>
                        <p className={`mt-2 text-2xl font-black ${theme.text}`}>{item.value}</p>
                        <div className={`mt-3 h-2 overflow-hidden rounded-full ${darkMode ? "bg-white/10" : "bg-white"}`}>
                          <div
                            className={`h-full rounded-full bg-linear-to-r ${item.color}`}
                            style={{ width: `${valuePercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeMenu === "teachers") {
      if (isTeacherPanel) return null;
      return <TeachersPage theme={theme} darkMode={darkMode} currentUser={authUser} />;
    }

    if (activeMenu === "groups") {
      if (selectedGroup) {
        return (
          <GroupDetailsPage
            theme={theme}
            darkMode={darkMode}
            group={selectedGroup}
            onBack={() => setSelectedGroup(null)}
          />
        );
      }

      return (
        <GroupsPage
          theme={theme}
          darkMode={darkMode}
          currentUser={authUser}
          onOpenGroupDetails={(group) => {
            setSelectedGroup(group);
            setActiveMenu("groups");
          }}
        />
      );
    }

    if (activeMenu === "students") {
      if (isTeacherPanel) return null;
      return (
        <StudentsPage
          theme={theme}
          darkMode={darkMode}
          onOpenGroupDetails={(group) => {
            setSelectedGroup(group);
            setActiveMenu("groups");
          }}
        />
      );
    }

    if (activeMenu === "management") {
      if (isTeacherPanel) return null;
      return renderManagementContent();
    }

    return null;
  };

  return (
    <div className={`h-screen overflow-hidden bg-linear-to-br ${theme.appGradient} ${theme.app}`}>
      <div className="relative flex h-full min-h-0">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[10%] top-0 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-[10%] h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <aside className={`relative z-20 m-4 flex h-[calc(100vh-2rem)] w-64 flex-col overflow-visible rounded-4xl border p-4 ${theme.sidebar}`}>
          <div className="mb-6 flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${theme.accentBg} text-xl text-white shadow-[0_14px_35px_rgba(139,92,246,0.35)]`}>
              N
            </div>
            <div>
              <h1 className={`text-[34px] leading-none font-black tracking-tight ${theme.accentText}`}>{t.brand}</h1>
              <p className={`text-xs ${theme.soft}`}>CRM Dashboard</p>
            </div>
          </div>

          <nav className="space-y-2">
            {visibleMenuItems.map((item) => {
              if (item.key === "management") {
                if (isTeacherPanel) return null;
                return (
                  <button
                    key={item.id}
                    ref={managementButtonRef}
                    onClick={() => {
                      setActiveMenu("management");
                      setShowManagementPanel((prev) => !prev);
                    }}
                    className={`w-full rounded-2xl px-3.5 py-3 text-left transition ${
                      activeMenu === "management" ? theme.active : `${theme.menu} ${theme.hover}`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-[17px] font-semibold">{t[item.key]}</span>
                      </div>
                      <span className="text-sm">{showManagementPanel ? "◂" : "▸"}</span>
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.key);
                    setShowManagementPanel(false);
                  }}
                  className={`w-full rounded-2xl px-3.5 py-3 text-left transition ${
                    activeMenu === item.key ? theme.active : `${theme.menu} ${theme.hover}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[17px] font-semibold">{t[item.key]}</span>
                  </div>
                </button>
              );
            })}
          </nav>

          {showManagementPanel && !isTeacherPanel && (
            <div
              ref={managementPanelRef}
              className={`absolute left-[calc(100%-6px)] top-62 z-110 w-64 rounded-3xl border p-3.5 shadow-[0_35px_80px_rgba(15,23,42,0.25)] ${theme.subpanel}`}
            >
              <div className="mb-4 flex items-center gap-3">
                <button
                  onClick={() => setShowManagementPanel(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_12px_25px_rgba(139,92,246,0.35)]"
                >
                  ‹
                </button>
                <div>
                  <h3 className={`text-lg font-black ${theme.text}`}>{t.menu}</h3>
                  <p className={`text-xs ${theme.soft}`}>Quick management access</p>
                </div>
              </div>

              <div className="space-y-2">
                {managementItems.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setActiveMenu("management");
                      setActiveManagement(sub.key);
                      setShowManagementPanel(false);
                    }}
                    className={`w-full rounded-[20px] border px-3.5 py-3 text-left transition ${
                      activeManagement === sub.key && activeMenu === "management"
                        ? theme.submenuActive
                        : `border-transparent ${theme.submenuText} hover:bg-slate-100/70`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{sub.icon}</span>
                      <span className="font-semibold">{t[sub.key]}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={`mt-auto rounded-3xl border p-3 ${theme.card}`}>
            <div className="flex items-center gap-3">
              <img src={profilePhoto} alt="Profile" className="h-12 w-12 rounded-2xl object-cover" />
              <div className="min-w-0">
                <p className={`truncate text-lg font-bold ${theme.text}`}>{profileName}</p>
                <p className={`truncate text-xs ${theme.soft}`}>{profileEmail}</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-3.5 w-full rounded-2xl bg-linear-to-r from-rose-500 to-red-500 py-2.5 font-semibold text-white shadow-[0_14px_35px_rgba(239,68,68,0.28)] transition hover:scale-[1.01]"
            >
              {t.logout}
            </button>
          </div>
        </aside>

        <main className={`relative z-10 flex-1 min-h-0 p-4 pl-0 ${theme.main}`}>
          <div className={`${theme.card} flex h-[calc(100vh-2rem)] min-h-0 flex-col overflow-hidden rounded-4xl border p-5 md:p-6`}>
            <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className={`text-sm font-semibold uppercase tracking-[0.25em] ${theme.accentText}`}>Najot Talim</p>
                <h2 className={`mt-2 text-3xl font-black ${theme.text}`}>{greetingText}</h2>
              </div>

              <div className="relative flex flex-wrap items-center gap-3">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`rounded-2xl border px-4 py-3 outline-none ${theme.select}`}
                >
                  <option value="uz">O'zbekcha</option>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>

                <button
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition ${theme.topBtn}`}
                >
                  🔔
                </button>

                <div className={`flex items-center gap-1 rounded-2xl border p-1 ${theme.select}`}>
                  {modeOptions.map((mode) => {
                    const active = themeMode === mode.key;
                    return (
                      <button
                        key={mode.key}
                        onClick={() => setThemeMode(mode.key)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          active
                            ? `bg-linear-to-r ${theme.accentBg} text-white shadow ring-2 ${theme.modeRing}`
                            : `${theme.menu} hover:opacity-80`
                        }`}
                      >
                        <span className="mr-1">{mode.icon}</span>
                        {mode.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  ref={profileButtonRef}
                  onClick={() => setShowProfilePanel((prev) => !prev)}
                  className="group relative"
                >
                  <div className="rounded-[22px] bg-linear-to-r from-violet-600 to-fuchsia-600 p-0.5 shadow-[0_14px_35px_rgba(139,92,246,0.35)] transition group-hover:scale-105">
                    <img
                      src={profilePhoto}
                      alt="User"
                      className="h-14 w-14 rounded-[20px] object-cover"
                    />
                  </div>
                </button>

                {showProfilePanel && (
                  <div
                    ref={profilePanelRef}
                    className={`absolute right-0 top-19.5 z-95 w-85 overflow-hidden rounded-[28px] border shadow-[0_35px_80px_rgba(15,23,42,0.25)] ${theme.subpanel}`}
                  >
                    <div className="relative overflow-hidden p-5">
                      <div className="absolute inset-x-0 top-0 h-28 bg-linear-to-r from-violet-600 to-fuchsia-600" />
                      <div className="relative mt-8 flex items-end gap-4">
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="h-24 w-24 rounded-[26px] border-4 border-white object-cover shadow-xl"
                        />
                        <div className="pb-1">
                          <p className="text-sm font-semibold text-white/90">{t.profile}</p>
                          <h3 className="text-xl font-black text-white">{profileName}</h3>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-5 pt-2">
                      <div className={`rounded-[22px] border p-4 ${theme.card}`}>
                        <p className={`text-xs uppercase tracking-[0.2em] ${theme.soft}`}>Email</p>
                        <p className={`mt-1 font-semibold ${theme.text}`}>{profileEmail}</p>
                      </div>

                      <div className={`rounded-[22px] border p-4 ${theme.card}`}>
                        <p className={`text-xs uppercase tracking-[0.2em] ${theme.soft}`}>Role</p>
                        <p className={`mt-1 font-semibold ${theme.text}`}>{profileRole}</p>
                      </div>

                      <button
                        onClick={() => navigate("/")}
                        className="w-full rounded-2xl bg-linear-to-r from-rose-500 to-red-500 py-3 font-semibold text-white shadow-[0_14px_35px_rgba(239,68,68,0.28)]"
                      >
                        {t.logout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
