import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FileText,
  PlayCircle,
  Users,
  User,
} from "lucide-react";
import { groupsApi, homeworkApi, lessonVideosApi } from "../../api/crmApi";
import { getAuthUserFromStorage } from "../../utils/authToken";

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
  { id: "attendance", label: "Akademik davomat" },
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

const extractList = (result) => {
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result)) return result;
  return [];
};

const normalizeDays = (weekDays) => {
  if (!Array.isArray(weekDays)) return [];
  return [...weekDays].sort(
    (a, b) => dayOrder.indexOf(String(a)) - dayOrder.indexOf(String(b)),
  );
};

const formatDayLabels = (weekDays) =>
  normalizeDays(weekDays).map((day) => weekDayMap[day] || day);

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tone}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <Icon size={18} />
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
    </div>
  );
}

export default function TeacherHomePage() {
  const navigate = useNavigate();
  const authUser = useMemo(() => getAuthUserFromStorage(), []);
  const [teacherGroups, setTeacherGroups] = useState([]);
  const [loading, setLoading] = useState(true);
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
            const [lessonsResult, homeworkResult, videosResult] = await Promise.allSettled([
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
                    title: item.lesson?.title ? `${item.lesson.title} video` : "Dars videosi",
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
          if (prev && groupsWithDetails.some((group) => Number(group.id) === Number(prev))) {
            return prev;
          }
          return groupsWithDetails[0]?.id ?? null;
        });
      } catch {
        if (!isMounted) return;
        setTeacherGroups([]);
        setSelectedGroupId(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadTeacherGroups();

    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

  const selectedGroup = useMemo(
    () => teacherGroups.find((group) => Number(group.id) === Number(selectedGroupId)) || teacherGroups[0] || null,
    [selectedGroupId, teacherGroups],
  );

  const activeGroup = selectedGroup;

  const todayLessonsCount = useMemo(() => {
    const dayMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const today = dayMap[new Date().getDay()];
    return teacherGroups.filter((group) => Array.isArray(group.weekDays) && group.weekDays.includes(today)).length;
  }, [teacherGroups]);

  const totalHomework = useMemo(
    () => teacherGroups.reduce((sum, group) => sum + group.homework.length, 0),
    [teacherGroups],
  );

  const currentList = useMemo(() => {
    if (!activeGroup) return [];
    return activeGroup[selectedLessonTab] || [];
  }, [activeGroup, selectedLessonTab]);

  const openGroup = (group) => {
    navigate(`/teacher/groups/${group.id}`, { state: { group } });
  };

  const selectedDays = formatDayLabels(activeGroup?.weekDays);

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="relative overflow-hidden bg-linear-to-r from-slate-950 via-emerald-950 to-teal-900 px-5 py-6 text-white sm:px-6">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_25%),radial-gradient(circle_at_80%_10%,#34d399_0,transparent_18%),radial-gradient(circle_at_80%_80%,#22d3ee_0,transparent_16%)]" />
          <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-end">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                Teacher panel
              </p>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                Guruhlar, dars vaqtlari va uyga vazifalar bir joyda. Kerakli guruhni tanlab ichiga kiring.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-200">Dars vaqti</p>
                  <CalendarDays size={16} className="text-emerald-200" />
                </div>
                <p className="mt-2 text-lg font-bold">{activeGroup?.time || "-"}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-200">Tanlangan guruh</p>
                  <Users size={16} className="text-cyan-200" />
                </div>
                <p className="mt-2 text-lg font-bold">{activeGroup?.name || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b border-slate-200/80 bg-white/70 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Jami guruhlar" value={teacherGroups.length} icon={Users} tone="border-emerald-100 bg-emerald-50/80 text-emerald-700" />
          <StatCard label="Bugungi darslar" value={todayLessonsCount} icon={CalendarDays} tone="border-sky-100 bg-sky-50/80 text-sky-700" />
          <StatCard label="Uyga vazifalar" value={totalHomework} icon={FileText} tone="border-amber-100 bg-amber-50/80 text-amber-700" />
          <StatCard label="Faol guruh" value={activeGroup?.students || 0} icon={User} tone="border-slate-200 bg-slate-50/90 text-slate-700" />
        </div>

        <div className="grid gap-4 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">Guruhlar</h2>
              <p className="mt-1 text-sm text-slate-500">Bosib ichiga kiring</p>
            </div>

            {loading ? (
              <div className="px-5 py-8 text-sm text-slate-500">Ma'lumotlar yuklanmoqda...</div>
            ) : teacherGroups.length === 0 ? (
              <div className="px-5 py-8 text-sm text-slate-500">Hozircha guruhlar yo'q</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {teacherGroups.map((group) => {
                  const active = Number(group.id) === Number(activeGroup?.id);
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50 ${
                        active ? "bg-emerald-50/70" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{group.name}</p>
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            {group.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {group.days.map((day) => weekDayMap[day] || day).join(", ") || "-"} • {group.time}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">Talabalar: {group.students}</p>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-slate-300" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (teacherGroups.length === 0) return;
                    const currentIndex = teacherGroups.findIndex((group) => Number(group.id) === Number(activeGroup?.id));
                    const nextIndex = currentIndex > 0 ? currentIndex - 1 : teacherGroups.length - 1;
                    setSelectedGroupId(teacherGroups[nextIndex]?.id ?? null);
                  }}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50"
                >
                  <ChevronRight size={18} className="rotate-180" />
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800">{activeGroup?.name || "Guruh topilmadi"}</h2>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {activeGroup?.status || "-"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {activeGroup?.room || "-"} • {activeGroup?.time || "-"} • {activeGroup?.days.map((day) => weekDayMap[day] || day).join(", ") || "-"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedDays.length > 0 ? (
                  selectedDays.map((day) => {
                    const active = activeGroup?.days?.includes(
                      Object.keys(weekDayMap).find((key) => weekDayMap[key] === day),
                    );
                    return (
                      <span
                        key={day}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">Kalendar yo'q</span>
                )}
              </div>
            </div>

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

            <div className="p-6">
              {selectedMainTab === "info" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-4 text-lg font-bold text-slate-800">Guruh ma'lumotlari</h3>
                    <div className="space-y-3 text-sm text-slate-600">
                      <p><span className="font-semibold text-slate-800">Nomi:</span> {activeGroup?.name || "-"}</p>
                      <p><span className="font-semibold text-slate-800">Holati:</span> {activeGroup?.status || "-"}</p>
                      <p><span className="font-semibold text-slate-800">Talabalar:</span> {activeGroup?.students || 0}</p>
                      <p><span className="font-semibold text-slate-800">Xona:</span> {activeGroup?.room || "-"}</p>
                      <p><span className="font-semibold text-slate-800">Vaqt:</span> {activeGroup?.time || "-"}</p>
                      <p><span className="font-semibold text-slate-800">Kunlar:</span> {activeGroup?.days.map((day) => weekDayMap[day] || day).join(", ") || "-"}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-4 text-lg font-bold text-slate-800">Qisqacha statistika</h3>
                    <div className="space-y-3 text-sm text-slate-600">
                      <p>Darsliklar soni: {activeGroup?.lessons.length || 0}</p>
                      <p>Uyga vazifalar soni: {activeGroup?.homework.length || 0}</p>
                      <p>Videolar soni: {activeGroup?.videos.length || 0}</p>
                      <p>Imtihonlar soni: {activeGroup?.exams.length || 0}</p>
                      <p>Jurnal yozuvlari: {activeGroup?.journal.length || 0}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMainTab === "materials" && (
                <>
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
                      <div className="px-5 py-10 text-center text-sm text-slate-400">Hozircha ma'lumot yo‘q</div>
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
                        { ["Hasan", "Ali", "Vali", "Sardor"].map((student, index) => (
                          <tr key={student} className="rounded-xl bg-white shadow-sm">
                            <td className="rounded-l-xl px-4 py-3 font-medium text-slate-700">{index + 1}. {student}</td>
                            <td className="px-4 py-3 text-emerald-600">Bor</td>
                            <td className="px-4 py-3 text-emerald-600">Bor</td>
                            <td className="px-4 py-3 text-rose-500">Yo‘q</td>
                            <td className="rounded-r-xl px-4 py-3 text-emerald-600">Bor</td>
                          </tr>
                        )) }
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
