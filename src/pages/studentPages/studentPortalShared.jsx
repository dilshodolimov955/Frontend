import React, { createContext, useContext } from "react";
import {
  Home,
  Users,
  Settings,
  GraduationCap,
  Bell,
  LogOut,
  Moon,
  Sun,
  Languages,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  Hourglass,
  FileText,
  Clock3,
  Sparkles,
  PlayCircle,
  ExternalLink,
  Search,
  Calendar,
  Save,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const StudentPortalContext = createContext(null);

export function useStudentPortal() {
  const context = useContext(StudentPortalContext);
  if (!context) {
    throw new Error("useStudentPortal must be used inside StudentPortalContext");
  }
  return context;
}

export const Icons = {
  Home,
  Users,
  Settings,
  GraduationCap,
  Bell,
  LogOut,
  Moon,
  Sun,
  Languages,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  Hourglass,
  FileText,
  Clock3,
  Sparkles,
  PlayCircle,
  ExternalLink,
  Search,
  Calendar,
  Save,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
};

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const translations = {
  uz: {
    brand: "NAJOT TA’LIM",
    brandSub: "Student portal",
    home: "Bosh sahifa",
    groups: "Guruhlarim",
    settings: "Sozlamalar",
    portal: "Portal",
    description:
      "Darslar, guruhlar va vazifalar endi alohida sahifalarda qulay ko‘rinadi.",
    activeGroups: "Faol guruhlar",
    todayLessons: "Bugungi darslar",
    profileId: "Profil ID",
    schedule: "Dars jadvali",
    active: "Faol",
    finished: "Tugagan",
    groupName: "Guruh nomi",
    direction: "Yo'nalishi",
    teacher: "O'qituvchi",
    startTime: "Boshlash vaqti",
    homeworkStatus: "Uy vazifa statusi",
    all: "Barchasi",
    assigned: "Berilgan",
    notAssigned: "Berilmagan",
    returned: "Qaytarilgan",
    notDone: "Bajarmagan",
    waiting: "Kutayotgan",
    accepted: "Qabul qilingan",
    exam: "Imtihon",
    searchTopic: "Mavzu qidirish...",
    topic: "Mavzu",
    video: "Video",
    homeworkState: "Uyga vazifa holati",
    homeworkDeadline: "Uyga vazifa tugash vaqti",
    lessonDate: "Dars sanasi",
    personalInfo: "Shaxsiy ma’lumotlar",
    profilePhoto: "Profil rasmi",
    uploadPhoto: "Rasm yuklash",
    fullName: "To‘liq ism",
    email: "Email",
    newPassword: "Yangi parol",
    save: "Saqlash",
    saving: "Saqlanmoqda...",
    login: "Login",
    notifications: "Bildirishnoma",
    hhId: "HH ID",
    noGroups: "Guruh topilmadi",
    noData: "Ma’lumot topilmadi",
    loading: "Yuklanmoqda...",
    darkMode: "Tungi rejim",
    language: "Til",
    openDetail: "Ichiga kirish",
    lessonInfo: "Dars ma'lumotlari",
    teacherComment: "O‘qituvchi izohi",
    mySubmission: "Mening jo‘natmalarim",
    attachments: "Fayllar soni",
    logoutConfirm: "Chiqasizmi?",
    yes: "Ha",
    no: "Yo‘q",
    status: "Status",
    saveSuccess: "Ma'lumot muvaffaqiyatli saqlandi",
    saveError: "Saqlashda xatolik yuz berdi",
    uploadHomework: "Uyga vazifa yuborish",
    comment: "Izoh",
    selectFile: "Fayl",
    finishSubmit: "Yuborishni yakunlash",
    submitting: "Yuborilmoqda...",
    openVideo: "Videoni ochish",
    noHomework: "Bu dars uchun uyga vazifa biriktirilmagan.",
    selectedFile: "Tanlangan fayl",
    back: "Ortga",
    lessons: "Darslar",
    openGroup: "Guruhga kirish",
    openLesson: "Darsga kirish",
  },
  en: {
    brand: "NAJOT TA’LIM",
    brandSub: "Student portal",
    home: "Home",
    groups: "My Groups",
    settings: "Settings",
    portal: "Portal",
    description:
      "Lessons, groups and tasks are shown on separate pages in a cleaner view.",
    activeGroups: "Active groups",
    todayLessons: "Today's lessons",
    profileId: "Profile ID",
    schedule: "Schedule",
    active: "Active",
    finished: "Finished",
    groupName: "Group name",
    direction: "Direction",
    teacher: "Teacher",
    startTime: "Start time",
    homeworkStatus: "Homework status",
    all: "All",
    assigned: "Assigned",
    notAssigned: "Not assigned",
    returned: "Returned",
    notDone: "Not done",
    waiting: "Waiting",
    accepted: "Accepted",
    exam: "Exam",
    searchTopic: "Search topic...",
    topic: "Topic",
    video: "Video",
    homeworkState: "Homework status",
    homeworkDeadline: "Homework deadline",
    lessonDate: "Lesson date",
    personalInfo: "Personal information",
    profilePhoto: "Profile photo",
    uploadPhoto: "Upload photo",
    fullName: "Full name",
    email: "Email",
    newPassword: "New password",
    save: "Save",
    saving: "Saving...",
    login: "Login",
    notifications: "Notifications",
    hhId: "HH ID",
    noGroups: "No groups found",
    noData: "No data found",
    loading: "Loading...",
    darkMode: "Dark mode",
    language: "Language",
    openDetail: "Open detail",
    lessonInfo: "Lesson details",
    teacherComment: "Teacher comment",
    mySubmission: "My submissions",
    attachments: "Files count",
    logoutConfirm: "Do you want to logout?",
    yes: "Yes",
    no: "No",
    status: "Status",
    saveSuccess: "Saved successfully",
    saveError: "Error while saving",
    uploadHomework: "Submit homework",
    comment: "Comment",
    selectFile: "File",
    finishSubmit: "Finish submit",
    submitting: "Submitting...",
    openVideo: "Open video",
    noHomework: "No homework attached to this lesson.",
    selectedFile: "Selected file",
    back: "Back",
    lessons: "Lessons",
    openGroup: "Open group",
    openLesson: "Open lesson",
  },
  ru: {
    brand: "NAJOT TA’LIM",
    brandSub: "Студенческий портал",
    home: "Главная",
    groups: "Мои группы",
    settings: "Настройки",
    portal: "Портал",
    description:
      "Уроки, группы и задания теперь показаны по отдельным страницам.",
    activeGroups: "Активные группы",
    todayLessons: "Сегодняшние занятия",
    profileId: "ID профиля",
    schedule: "Расписание",
    active: "Активные",
    finished: "Завершённые",
    groupName: "Название группы",
    direction: "Направление",
    teacher: "Учитель",
    startTime: "Время начала",
    homeworkStatus: "Статус домашнего задания",
    all: "Все",
    assigned: "Задано",
    notAssigned: "Не задано",
    returned: "Возвращено",
    notDone: "Не выполнено",
    waiting: "Ожидается",
    accepted: "Принято",
    exam: "Экзамен",
    searchTopic: "Поиск темы...",
    topic: "Тема",
    video: "Видео",
    homeworkState: "Статус задания",
    homeworkDeadline: "Срок задания",
    lessonDate: "Дата урока",
    personalInfo: "Личная информация",
    profilePhoto: "Фото профиля",
    uploadPhoto: "Загрузить фото",
    fullName: "Полное имя",
    email: "Email",
    newPassword: "Новый пароль",
    save: "Сохранить",
    saving: "Сохранение...",
    login: "Логин",
    notifications: "Уведомления",
    hhId: "HH ID",
    noGroups: "Группы не найдены",
    noData: "Данные не найдены",
    loading: "Загрузка...",
    darkMode: "Тёмный режим",
    language: "Язык",
    openDetail: "Открыть",
    lessonInfo: "Данные урока",
    teacherComment: "Комментарий учителя",
    mySubmission: "Мои отправки",
    attachments: "Количество файлов",
    logoutConfirm: "Выйти?",
    yes: "Да",
    no: "Нет",
    status: "Статус",
    saveSuccess: "Успешно сохранено",
    saveError: "Ошибка при сохранении",
    uploadHomework: "Отправить домашнее задание",
    comment: "Комментарий",
    selectFile: "Файл",
    finishSubmit: "Завершить отправку",
    submitting: "Отправка...",
    openVideo: "Открыть видео",
    noHomework: "Для этого урока домашнее задание не прикреплено.",
    selectedFile: "Выбранный файл",
    back: "Назад",
    lessons: "Уроки",
    openGroup: "Открыть группу",
    openLesson: "Открыть урок",
  },
};

export const homeworkStatusMap = {
  COMPLETED: "Qabul qilingan",
  APPROVED: "Qabul qilingan",
  ACCEPTED: "Qabul qilingan",
  PENDING: "Kutayotgan",
  WAITING: "Kutayotgan",
  NOT_REVIEWED: "Bajarmagan",
  DELAY: "Qaytarilgan",
  RETURNED: "Qaytarilgan",
  REJECTED: "Qaytarilgan",
  MISSED: "Bajarmagan",
  FAILED: "Bajarmagan",
  NOT_DONE: "Bajarmagan",
  NOT_ASSIGNED: "Berilmagan",
  ASSIGNED: "Berilgan",
};

export const statusStyles = {
  "Qabul qilingan":
    "bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white",
  "Berilgan": "bg-linear-to-r from-violet-600 to-fuchsia-500 text-white",
  "Berilmagan": "bg-slate-500 text-white dark:bg-slate-600 dark:text-white",
  "Qaytarilgan": "bg-amber-500 text-white dark:bg-amber-600 dark:text-white",
  "Bajarmagan": "bg-red-500 text-white dark:bg-red-600 dark:text-white",
  "Kutayotgan": "bg-indigo-500 text-white dark:bg-indigo-600 dark:text-white",
  Imtihon: "bg-violet-500 text-white dark:bg-violet-600 dark:text-white",
};

export const statusIcons = {
  "Qabul qilingan": CheckCircle2,
  "Berilgan": FileText,
  "Berilmagan": XCircle,
  "Qaytarilgan": RotateCcw,
  "Bajarmagan": AlertCircle,
  "Kutayotgan": Hourglass,
  Imtihon: Sparkles,
};

export function formatDate(value, language = "uz") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const localeMap = {
    uz: "uz-UZ",
    en: "en-US",
    ru: "ru-RU",
  };

  return date.toLocaleDateString(localeMap[language] || "uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value, language = "uz") {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const localeMap = {
    uz: "uz-UZ",
    en: "en-US",
    ru: "ru-RU",
  };

  return date.toLocaleString(localeMap[language] || "uz-UZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function deriveHomeworkDueDate(homework) {
  if (!homework) return null;
  if (homework.deadlineAt || homework.deadline) {
    const prepared = new Date(homework.deadlineAt || homework.deadline);
    return Number.isNaN(prepared.getTime()) ? null : prepared;
  }

  const baseDate = new Date(homework.created_at || homework.createdAt);
  if (Number.isNaN(baseDate.getTime())) return null;

  const hours = Number(homework.durationTime ?? 16);
  return new Date(baseDate.getTime() + hours * 60 * 60 * 1000);
}

export function getLessonStatusLabel(
  status,
  fallbackType,
  hasHomework = false,
  homework = null
) {
  if (fallbackType === "EXAM") return "Imtihon";

  const mappedStatus = homeworkStatusMap[status] || "";

  if (status && mappedStatus) return mappedStatus;
  if (hasHomework) return "Bajarmagan";
  return "Berilmagan";
}

export function StatusBadge({ status }) {
  const Icon = statusIcons[status] || Clock3;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-bold",
        statusStyles[status] || "bg-slate-500 text-white"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

export function PageShell({ title, subtitle, right, children }) {
  const { darkMode } = useStudentPortal();

  return (
    <div className="space-y-4">
      <section
        className={cn(
          "rounded-[28px] border p-4 shadow-sm sm:p-5",
          darkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-white"
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              className={cn(
                "text-[23px] font-black",
                darkMode ? "text-white" : "text-slate-900"
              )}
            >
              {title}
            </h2>
            {subtitle ? (
              <p
                className={cn(
                  "mt-2 text-sm leading-6",
                  darkMode ? "text-slate-400" : "text-slate-500"
                )}
              >
                {subtitle}
              </p>
            ) : null}
          </div>

          {right ? <div>{right}</div> : null}
        </div>
      </section>

      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value }) {
  const { darkMode } = useStudentPortal();

  return (
    <div
      className={cn(
        "rounded-[24px] border p-4 shadow-sm",
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p
            className={cn(
              "text-xs font-medium",
              darkMode ? "text-slate-400" : "text-slate-500"
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "text-xl font-black",
              darkMode ? "text-white" : "text-slate-900"
            )}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function StatusFilterDropdown({ value, onChange, options }) {
  const { darkMode } = useStudentPortal();
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const currentOption =
    options.find((option) => option.value === value) || options[0];

  const toneClass = {
    emerald: "bg-emerald-500 text-white",
    slate: "bg-slate-500 text-white",
    amber: "bg-amber-500 text-white",
    red: "bg-red-500 text-white",
    indigo: "bg-indigo-500 text-white",
    sky: "bg-violet-500 text-white",
    violet: "bg-violet-500 text-white",
    default: darkMode
      ? "bg-slate-900 text-slate-200 border border-slate-700"
      : "bg-white text-slate-700 border border-slate-300",
  };

  return (
    <div className="relative w-full sm:w-[220px]" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-[13px] font-semibold",
          currentOption.tone ? toneClass[currentOption.tone] : toneClass.default
        )}
      >
        <span>{currentOption.label}</span>
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border shadow-2xl",
            darkMode
              ? "border-slate-700 bg-slate-950"
              : "border-slate-200 bg-white"
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-semibold transition",
                option.tone
                  ? toneClass[option.tone]
                  : darkMode
                  ? "bg-slate-950 text-slate-200 hover:bg-slate-900"
                  : "bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              <span>{option.label}</span>
              {value === option.value ? <CheckCircle2 className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VideoPreview({ video, t }) {
  const { darkMode } = useStudentPortal();
  const videoUrl = video?.file || video?.url || video?.video || "";
  if (!videoUrl) return null;

  const isDirectVideo = /\.(mp4|webm|ogg|mov)$/i.test(videoUrl);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border",
        darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"
      )}
    >
      {isDirectVideo ? (
        <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: "16 / 9", maxHeight: "62vh" }}>
          <video controls className="h-full w-full object-contain">
            <source src={videoUrl} />
          </video>
        </div>
      ) : (
        <div className="p-4">
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:underline"
          >
            <PlayCircle className="h-4 w-4" />
            {t.openVideo}
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
    </div>
  );
}