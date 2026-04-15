import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  PlayCircle,
  User,
  Users,
} from "lucide-react";
import {
  groupsApi,
  homeworkApi,
  lessonVideosApi,
} from "../../api/crmApi";
import { getAuthUserFromStorage } from "../../utils/authToken";
import { useNavigate } from "react-router-dom";

const lessonTabs = [
  { id: "lessons", label: "Guruh darsliklari" },
  { id: "homework", label: "Uyga vazifa" },
  { id: "videos", label: "Videolar" },
  { id: "exams", label: "Imtihonlar" },
  { id: "journal", label: "Jurnal" },
];

const mainTabs = [
  { id: "info", label: "Ma'lumotlar" },
  { id: "materials", label: "Guruh darsliklari" },
  { id: "attendance", label: "Akademik davomati" },
];

const weekDayMap = {
  MONDAY: "Du",
  TUESDAY: "Se",
  WEDNESDAY: "Chor",
  THURSDAY: "Pay",
  FRIDAY: "Juma",
  SATURDAY: "Shan",
  SUNDAY: "Yak",
};

const dayOrder = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const statusMap = {
  ACTIVE: "Aktiv",
  FREEZE: "Muzlatilgan",
  INACTIVE: "Noaktiv",
};

const emptyGroup = {
  id: null,
  name: "Guruh topilmadi",
  status: "-",
  students: 0,
  room: "-",
  time: "-",
  days: "-",
  weekDays: [],
  lessons: [],
  homework: [],
  videos: [],
  exams: [],
  journal: [],
};

const normalizeDays = (weekDays) => {
  if (!Array.isArray(weekDays)) return "-";
  const sorted = [...weekDays].sort(
    (a, b) => dayOrder.indexOf(String(a)) - dayOrder.indexOf(String(b)),
  );
  return sorted.map((day) => weekDayMap[day] || day).join(", ") || "-";
};

const extractList = (result) => {
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result)) return result;
  return [];
};

function StatusBadge({ text }) {
  return (
    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
      {text}
    </span>
  );
}

function SectionCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
          <Icon size={18} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  );
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const authUser = useMemo(() => getAuthUserFromStorage(), []);
  const [teacherGroups, setTeacherGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState("groups");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedMainTab, setSelectedMainTab] = useState("materials");
  const [selectedLessonTab, setSelectedLessonTab] = useState("lessons");

  useEffect(() => {
    let isMounted = true;

    const loadTeacherGroups = async () => {
      try {
        setLoading(true);

        const groupsResult = await groupsApi.getMy();
        const baseGroups = extractList(groupsResult);

        const groupsWithDetails = await Promise.all(
          baseGroups.map(async (group) => {
            const [lessonsResult, homeworkResult, videosResult] =
              await Promise.allSettled([
                groupsApi.getLessonsByGroup(group.id),
                homeworkApi.getByGroup(group.id),
                lessonVideosApi.getByGroup(group.id),
              ]);

            const lessons =
              lessonsResult.status === "fulfilled"
                ? extractList(lessonsResult.value).map((item) => ({
                    id: item.id,
                    title: item.title || "Dars",
                    createdAt: item.created_at,
                  }))
                : [];

            const homework =
              homeworkResult.status === "fulfilled"
                ? extractList(homeworkResult.value).map((item) => ({
                    id: item.id,
                    title: item.title || "Uyga vazifa",
                  }))
                : [];

            const videos =
              videosResult.status === "fulfilled"
                ? extractList(videosResult.value).map((item) => ({
                    id: item.id,
                    title: item.lesson?.title
                      ? `${item.lesson.title} video`
                      : "Dars videosi",
                  }))
                : [];

            return {
              id: group.id,
              name: group.name || "-",
              status: statusMap[group.status] || group.status || "-",
              students: Number(group.studentsCount || 0),
              room: group.room?.name || `Xona ${group.roomId || "-"}`,
              time: group.startTime || "-",
              days: normalizeDays(group.weekDays),
              weekDays: Array.isArray(group.weekDays) ? group.weekDays : [],
              lessons,
              homework,
              videos,
              exams: [],
              journal: lessons.map((item) => ({
                id: item.id,
                title: `${item.title} dars jurnali`,
              })),
            };
          }),
        );

        if (!isMounted) return;

        setTeacherGroups(groupsWithDetails);
        setSelectedGroupId((prev) => {
          if (
            prev &&
            groupsWithDetails.some((group) => Number(group.id) === Number(prev))
          ) {
            return prev;
          }
          return groupsWithDetails[0]?.id ?? null;
        });
      } catch {
        if (!isMounted) return;
        setTeacherGroups([]);
        setSelectedGroupId(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTeacherGroups();

    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

  const selectedGroup = useMemo(
    () =>
      teacherGroups.find((group) => Number(group.id) === Number(selectedGroupId)) ||
      teacherGroups[0] ||
      null,
    [selectedGroupId, teacherGroups],
  );

  const activeGroup = selectedGroup || emptyGroup;

  const todayLessonsCount = useMemo(() => {
    const dayMap = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const today = dayMap[new Date().getDay()];
    return teacherGroups.filter(
      (group) => Array.isArray(group.weekDays) && group.weekDays.includes(today),
    ).length;
  }, [teacherGroups]);

  const currentList = useMemo(() => {
    if (!activeGroup) return [];
    return activeGroup[selectedLessonTab] || [];
  }, [activeGroup, selectedLessonTab]);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-65 border-r border-slate-200 bg-white shadow-sm">
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
              <LayoutDashboard size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Najot Talim</h1>
              <p className="text-xs text-slate-400">Teacher panel</p>
            </div>
          </div>

          <nav className="px-4 py-5">
            <button
              onClick={() => setSelectedMenu("groups")}
              className={`mb-2 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                selectedMenu === "groups"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3 font-medium">
                <Users size={18} />
                Guruhlar
              </span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/teacher/groups")}
              className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-50"
            >
              <Users size={18} />
              Guruhlarni boshqarish
            </button>

            <button
              type="button"
              onClick={() => navigate("/teacher/create-homework")}
              className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-50"
            >
              <FileText size={18} />
              Homework yaratish
            </button>

            {selectedMenu === "groups" && (
              <div className="mb-4 ml-3 space-y-1 border-l-2 border-emerald-100 pl-4">
                {teacherGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setSelectedMainTab("materials");
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedGroupId === group.id
                        ? "bg-emerald-100 font-semibold text-emerald-700"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {group.name.length > 24 ? `${group.name.slice(0, 24)}...` : group.name}
                  </button>
                ))}
              </div>
            )}

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-600 transition hover:bg-slate-50">
              <User size={18} />
              Profil
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Top cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SectionCard title="Jami guruhlar" value={teacherGroups.length} icon={Users} />
            <SectionCard
              title="Tanlangan guruh talabasi"
              value={activeGroup.students}
              icon={User}
            />
            <SectionCard title="Bugungi darslar" value={todayLessonsCount} icon={BookOpen} />
          </div>

          {loading && (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
              Ma'lumotlar yuklanmoqda...
            </div>
          )}

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50">
                  <ChevronLeft size={18} />
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                      {activeGroup.name}
                    </h2>
                    <StatusBadge text={activeGroup.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeGroup.room} • {activeGroup.time} • {activeGroup.days}
                  </p>
                </div>
              </div>
            </div>

            {/* Top tabs */}
            <div className="border-b border-slate-100 px-6">
              <div className="flex flex-wrap gap-6">
                {mainTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedMainTab(tab.id)}
                    className={`relative py-4 text-sm font-semibold transition ${
                      selectedMainTab === tab.id
                        ? "text-emerald-600"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                    {selectedMainTab === tab.id && (
                      <span className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {selectedMainTab === "info" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-4 text-lg font-bold text-slate-800">Guruh ma'lumotlari</h3>
                    <div className="space-y-3 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-800">Nomi:</span> {activeGroup.name}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Holati:</span> {activeGroup.status}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Talabalar:</span> {activeGroup.students}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Xona:</span> {activeGroup.room}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Vaqt:</span> {activeGroup.time}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Kunlar:</span> {activeGroup.days}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-4 text-lg font-bold text-slate-800">Qisqacha statistika</h3>
                    <div className="space-y-3 text-sm text-slate-600">
                      <p>Darsliklar soni: {activeGroup.lessons.length}</p>
                      <p>Uyga vazifalar soni: {activeGroup.homework.length}</p>
                      <p>Videolar soni: {activeGroup.videos.length}</p>
                      <p>Imtihonlar soni: {activeGroup.exams.length}</p>
                      <p>Jurnal yozuvlari: {activeGroup.journal.length}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMainTab === "materials" && (
                <>
                  {/* Inner tabs */}
                  <div className="mb-6 flex flex-wrap items-center gap-3">
                    {lessonTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedLessonTab(tab.id)}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                          selectedLessonTab === tab.id
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Table */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-[70px_1fr] bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-500">
                      <div>#</div>
                      <div>Mavzu</div>
                    </div>

                    {currentList.length > 0 ? (
                      currentList.map((item, index) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-[70px_1fr] border-t border-slate-100 px-5 py-4 text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <div className="font-medium text-slate-500">{index + 1}</div>
                          <div className="flex items-center gap-3">
                            {selectedLessonTab === "lessons" && <BookOpen size={17} className="text-emerald-600" />}
                            {selectedLessonTab === "homework" && <FileText size={17} className="text-amber-600" />}
                            {selectedLessonTab === "videos" && <PlayCircle size={17} className="text-sky-600" />}
                            {selectedLessonTab === "exams" && <ClipboardCheck size={17} className="text-rose-600" />}
                            {selectedLessonTab === "journal" && <FileText size={17} className="text-violet-600" />}
                            <span>{item.title}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-10 text-center text-sm text-slate-400">
                        Hozircha ma'lumot yo‘q
                      </div>
                    )}
                  </div>
                </>
              )}

              {selectedMainTab === "attendance" && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="mb-4 text-lg font-bold text-slate-800">Akademik davomat</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                      <thead>
                        <tr className="text-left text-slate-500">
                          <th className="px-4 py-2">Talaba</th>
                          <th className="px-4 py-2">20 May</th>
                          <th className="px-4 py-2">22 May</th>
                          <th className="px-4 py-2">24 May</th>
                          <th className="px-4 py-2">26 May</th>
                        </tr>
                      </thead>
                      <tbody>
                        {["Hasan", "Ali", "Vali", "Sardor"].map((student, index) => (
                          <tr key={student} className="rounded-xl bg-white shadow-sm">
                            <td className="rounded-l-xl px-4 py-3 font-medium text-slate-700">
                              {index + 1}. {student}
                            </td>
                            <td className="px-4 py-3 text-emerald-600">Bor</td>
                            <td className="px-4 py-3 text-emerald-600">Bor</td>
                            <td className="px-4 py-3 text-rose-500">Yo‘q</td>
                            <td className="rounded-r-xl px-4 py-3 text-emerald-600">Bor</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}