import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { homeworkApi, homeworkResultsApi } from "../../api/crmApi";
import { CalendarClock, FileCheck2, FileClock, FileX2, GraduationCap, Layers3, Sparkles, Users } from "lucide-react";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function HomeworkDetailPage({ homework, onBack, initialTab = "all" }) {
  const navigate = useNavigate();
  const { homeworkId } = useParams();
  const [isPageVisible, setIsPageVisible] = useState(false);

  const [tab, setTab] = useState(initialTab);
  const [studentsByTab, setStudentsByTab] = useState({
    kutayotgan: [],
    qaytarilgan: [],
    qabul: [],
    bajarilmagan: [],
  });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [scoreInput, setScoreInput] = useState("70");
  const [reviewComment, setReviewComment] = useState("");
  const [gradingLoading, setGradingLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const homeworkData = homework || {
    title: "Uyga vazifa",
    deadline: "-",
    id: homeworkId,
  };

  const currentHomeworkId = Number(homeworkData.id || homeworkId);

  const count = (status) => studentsByTab[status]?.length || 0;
  const totalStudents = useMemo(
    () =>
      [
        ...studentsByTab.kutayotgan,
        ...studentsByTab.qaytarilgan,
        ...studentsByTab.qabul,
        ...studentsByTab.bajarilmagan,
      ].length,
    [studentsByTab],
  );

  const getTabItems = (currentTab, source) => {
    return source[currentTab] || [];
  };

  const statusMeta = [
    {
      key: "qabul",
      label: "Qabul qilingan",
      count: count("qabul"),
      active: "bg-emerald-200 text-emerald-900 ring-2 ring-emerald-500",
      idle: "bg-emerald-100 text-emerald-800",
      chip: "bg-white/90 text-emerald-700",
    },
    {
      key: "qaytarilgan",
      label: "Qaytarilgan",
      count: count("qaytarilgan"),
      active: "bg-amber-200 text-amber-900 ring-2 ring-amber-500",
      idle: "bg-amber-100 text-amber-800",
      chip: "bg-white/90 text-amber-700",
    },
    {
      key: "bajarilmagan",
      label: "Bajarilmagan",
      count: count("bajarilmagan"),
      active: "bg-rose-200 text-rose-900 ring-2 ring-rose-500",
      idle: "bg-rose-100 text-rose-800",
      chip: "bg-white/90 text-rose-700",
    },
    {
      key: "kutayotgan",
      label: "Kutayotganlar",
      count: count("kutayotgan"),
      active: "bg-indigo-200 text-indigo-900 ring-2 ring-indigo-500",
      idle: "bg-indigo-100 text-indigo-800",
      chip: "bg-white/90 text-indigo-700",
    },
  ];

  const filtered = useMemo(() => getTabItems(tab, studentsByTab), [studentsByTab, tab]);
  const activeStudent = selectedStudent || filtered[0] || null;

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsPageVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const normalizeStudentRows = (statusKey, list) => {
    if (!Array.isArray(list)) return [];

    if (statusKey === "kutayotgan") {
      return list.map((item) => ({
        id: `pending-${item.id || item.student?.id}`,
        resultId: null,
        studentId: item.student?.id,
        name: item.student?.fullName || "-",
        sentAt: formatDateTime(item.created_at),
        submissionComment: item.title || "",
        reviewComment: "",
        file: item.file || "",
        score: null,
      }));
    }

    if (statusKey === "qabul" || statusKey === "qaytarilgan") {
      return list.map((item) => ({
        id: `result-${item.id || item.student?.id}`,
        resultId: item.id || null,
        studentId: item.student?.id,
        name: item.student?.fullName || "-",
        sentAt: formatDateTime(item.created_at),
        submissionComment: "",
        reviewComment: item.title || "",
        file: item.file || "",
        score: item.score ?? null,
      }));
    }

    return list.map((item) => ({
      id: `not-reviewed-${item.id}`,
      resultId: null,
      studentId: item.id,
      name: item.fullName || "-",
      sentAt: "-",
      submissionComment: "",
      reviewComment: "",
      file: "",
      score: null,
    }));
  };

  const loadStatuses = async () => {
    if (!currentHomeworkId) return;

    try {
      setLoading(true);
      const statuses = await homeworkApi.getStatuses(currentHomeworkId);

      const mapped = {
        kutayotgan: normalizeStudentRows("kutayotgan", statuses.PENDING || []),
        qaytarilgan: normalizeStudentRows("qaytarilgan", statuses.REJECTED || []),
        qabul: normalizeStudentRows("qabul", statuses.APPROVED || []),
        bajarilmagan: normalizeStudentRows("bajarilmagan", statuses.NOT_REVIEWED || []),
      };

      setStudentsByTab(mapped);

      const currentList = getTabItems(tab, mapped);
      if (currentList.length > 0) {
        setSelectedStudent((prev) => {
          if (!prev) return currentList[0];
          return currentList.find((item) => item.studentId === prev.studentId) || currentList[0];
        });
      } else {
        setSelectedStudent(null);
      }
    } catch (error) {
      setStudentsByTab({
        kutayotgan: [],
        qaytarilgan: [],
        qabul: [],
        bajarilmagan: [],
      });
      setSelectedStudent(null);
      showToast(error?.response?.data?.message || "Talabalar ro'yxatini olishda xato", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatuses();
  }, [currentHomeworkId]);

  useEffect(() => {
    const list = getTabItems(tab, studentsByTab);
    if (list.length === 0) {
      setSelectedStudent(null);
      return;
    }

    setSelectedStudent((prev) => {
      if (!prev) return list[0];
      return list.find((item) => item.studentId === prev.studentId) || list[0];
    });
  }, [tab, studentsByTab]);

  const submitGrade = async () => {
    if (!selectedStudent?.studentId) {
      showToast("Talabani tanlang", "warning");
      return;
    }

    const score = Number(scoreInput);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      showToast("Ball 0 dan 100 gacha bo'lishi kerak", "warning");
      return;
    }

    if (!reviewComment.trim()) {
      showToast("O'qituvchi izohini yozing", "warning");
      return;
    }

    try {
      setGradingLoading(true);

      const payload = {
        homeworkId: currentHomeworkId,
        studentId: selectedStudent.studentId,
        title: reviewComment.trim(),
        score,
      };

      let resultId = selectedStudent.resultId;

      if (!resultId) {
        const resultList = await homeworkResultsApi.getByHomework(currentHomeworkId);
        const existing = (Array.isArray(resultList?.data) ? resultList.data : []).find(
          (item) => item.student?.id === selectedStudent.studentId,
        );
        resultId = existing?.id;
      }

      let result;
      if (resultId) {
        result = await homeworkResultsApi.update(resultId, payload);
      } else {
        result = await homeworkResultsApi.create(payload);
      }

      await loadStatuses();
      setTab(result?.status === "APPROVED" ? "qabul" : "qaytarilgan");
      showToast("Baholash saqlandi", "success");
    } catch (error) {
      showToast(error?.response?.data?.message || "Baholashda xato", "error");
    } finally {
      setGradingLoading(false);
    }
  };

  return (
    <>
      {toast ? (
        <div className="fixed right-4 top-4 z-200 max-w-sm">
          <div
            className={`rounded-2xl border px-4 py-3 shadow-lg ${
              toast.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : toast.type === "warning"
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        </div>
      ) : null}

      <div
        className={`min-h-screen bg-[radial-gradient(circle_at_top,#eefbf5,#f6f8fb_40%,#eef2ff_100%)] p-4 sm:p-6 transition-all duration-300 ease-out ${
          isPageVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.99] opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl space-y-5">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-slate-900"
          >
            <span>←</span>
            <span>Orqaga</span>
          </button>

          <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="relative overflow-hidden border-b border-slate-200/80 bg-linear-to-r from-slate-950 via-emerald-950 to-teal-900 px-5 py-6 text-white sm:px-6">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white_0,transparent_25%),radial-gradient(circle_at_80%_10%,#34d399_0,transparent_18%),radial-gradient(circle_at_80%_80%,#22d3ee_0,transparent_16%)]" />
              <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                    <Sparkles size={14} />
                    Teacher panel
                  </div>
                  <h2 className="text-3xl font-black tracking-tight sm:text-4xl">{homeworkData.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
                    Uyga vazifa topshiriqlari, qaytarilgan javoblar va baholashni bir joyda kuzating.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-200">Mavzu</p>
                      <Layers3 size={16} className="text-emerald-200" />
                    </div>
                    <p className="mt-2 text-lg font-bold">{homeworkData.title}</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-200">Tugash vaqti</p>
                      <CalendarClock size={16} className="text-cyan-200" />
                    </div>
                    <p className="mt-2 text-lg font-bold">{homeworkData.deadline}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-b border-slate-200/80 bg-white/70 px-5 py-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-amber-100 bg-amber-50/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-amber-700">Kutayotganlar</p>
                  <FileClock size={18} className="text-amber-500" />
                </div>
                <p className="mt-3 text-3xl font-black text-amber-700">{count("kutayotgan")}</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-rose-700">Qaytarilganlar</p>
                  <FileX2 size={18} className="text-rose-500" />
                </div>
                <p className="mt-3 text-3xl font-black text-rose-700">{count("qaytarilgan")}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-emerald-700">Qabul qilinganlar</p>
                  <FileCheck2 size={18} className="text-emerald-500" />
                </div>
                <p className="mt-3 text-3xl font-black text-emerald-700">{count("qabul")}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">Bajarilmagan</p>
                  <Users size={18} className="text-slate-500" />
                </div>
                <p className="mt-3 text-3xl font-black text-slate-800">{count("bajarilmagan")}</p>
              </div>
            </div>

            <div className="px-4 py-4 sm:px-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-semibold text-slate-700">Uy vazifa statusi</h3>
                <p className="text-3xl font-semibold text-slate-700">
                  Jami: <span className="font-bold text-slate-900">{totalStudents}</span>
                </p>
              </div>

              <div className="md:hidden">
                <select
                  value={tab}
                  onChange={(e) => setTab(e.target.value)}
                  className="w-full rounded-2xl border border-amber-300 bg-white px-4 py-3 text-3xl font-semibold text-slate-900 outline-none ring-1 ring-amber-100 transition focus:border-amber-400"
                >
                  {statusMeta.map((item) => {
                    const studentList = studentsByTab[item.key] || [];
                    const studentNames = studentList.map(s => s.name).join(", ");
                    return (
                      <option key={item.key} value={item.key}>
                        {item.label} ({item.count}) {studentNames ? ` - ${studentNames}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="hidden flex-wrap gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2 md:flex">
                {statusMeta.map((item) => {
                  const active = tab === item.key;
                  const studentList = studentsByTab[item.key] || [];
                  const studentNames = studentList.map(s => s.name).join(", ");
                  
                  return (
                    <div key={item.key} className="group relative">
                      <button
                        onClick={() => setTab(item.key)}
                        className={`inline-flex flex-col items-start gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          active ? item.active : `${item.idle} hover:brightness-95`
                        }`}
                      >
                        <div className="inline-flex items-center gap-3">
                          <span>{item.label}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-black ${active ? "bg-white/90 text-slate-900" : item.chip}`}>
                            {item.count}
                          </span>
                        </div>
                        {item.count > 0 && (
                          <div className="text-xs opacity-80 max-w-xs truncate">
                            {studentNames}
                          </div>
                        )}
                      </button>
                      
                      {item.count > 0 && (
                        <div className="absolute left-0 top-full mt-1 hidden rounded-xl border border-slate-200 bg-white shadow-lg p-3 text-xs text-slate-700 whitespace-nowrap z-10 group-hover:block min-w-max">
                          {studentList.map(s => (
                            <div key={s.id} className="py-1 border-b border-slate-100 last:border-0">
                              {s.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 px-4 pb-4 pt-0 lg:grid-cols-[minmax(0,1fr)_390px] sm:px-5">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500">
                  <div>O'quvchi ismi</div>
                  <div>Uyga vazifa jo'natilgan vaqt</div>
                </div>

                {loading && <div className="px-6 py-6 text-sm text-slate-500">Yuklanmoqda...</div>}

                {!loading && filtered.length === 0 && (
                  <div className="px-6 py-10 text-sm text-slate-500">Bu statusda talabalar topilmadi</div>
                )}

                {!loading &&
                  filtered.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setSelectedStudent(student);
                        setScoreInput(student.score !== null && student.score !== undefined ? String(student.score) : "70");
                        setReviewComment(student.reviewComment || "");
                      }}
                      className={`grid w-full grid-cols-2 border-b border-slate-100 px-6 py-4 text-left text-sm transition last:border-b-0 hover:bg-slate-50 ${
                        selectedStudent?.id === student.id ? "bg-emerald-50/70 shadow-[inset_0_1px_0_rgba(16,185,129,0.15)]" : ""
                      }`}
                    >
                      <div className="font-semibold text-slate-800">{student.name}</div>
                      <div className="text-slate-600">{student.sentAt || "-"}</div>
                    </button>
                  ))}
              </div>

              <aside className="lg:sticky lg:top-4 h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-linear-to-r from-slate-900 via-emerald-900 to-teal-900 px-5 py-5 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">Tanlangan javob</p>
                      <h4 className="mt-1 text-xl font-black">Talaba ma'lumoti</h4>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3 text-emerald-100 backdrop-blur">
                      <GraduationCap size={20} />
                    </div>
                  </div>
                </div>

                {!activeStudent ? (
                  <div className="px-5 py-8 text-sm text-slate-500">Talabani tanlang</div>
                ) : (
                  <div className="space-y-5 px-5 py-5">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-lg font-bold text-slate-900">{activeStudent.name}</p>
                      <p className="mt-1 text-sm text-slate-500">Yuborilgan: {activeStudent.sentAt || "-"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Talaba izohi</p>
                      <p className="mt-2 min-h-14 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                        {activeStudent.submissionComment || "Izoh yo'q"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Fayl</p>
                      {activeStudent.file ? (
                        <a
                          href={activeStudent.file}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <span>📎</span>
                          Faylni ochish
                        </a>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500">Fayl yo'q</p>
                      )}
                    </div>

                    {tab !== "bajarilmagan" ? (
                      <div className="rounded-3xl border border-slate-200 bg-linear-to-b from-white to-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">O'qituvchi izohi</p>
                            <p className="mt-1 text-sm text-slate-500">Baholashdan oldin qisqa izoh qoldiring</p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            Majburiy
                          </span>
                        </div>

                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Uyga vazifa haqida o'qituvchi izohi..."
                          className="mt-3 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                        />

                        <div className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr] sm:items-end">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Baholash (0-100)</p>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={scoreInput}
                              onChange={(e) => setScoreInput(e.target.value)}
                              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={submitGrade}
                            disabled={gradingLoading}
                            className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:opacity-95 disabled:opacity-60"
                          >
                            {gradingLoading ? "Saqlanmoqda..." : "Bahoni saqlash"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        Bu statusda baholash kiritilmaydi.
                      </div>
                    )}
                  </div>
                )}
              </aside>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}