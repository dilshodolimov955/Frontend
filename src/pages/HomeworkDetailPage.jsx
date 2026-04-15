import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { homeworkApi, homeworkResultsApi } from "../api/crmApi";

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

export default function HomeworkDetailPage({ homework, onBack }) {
  const navigate = useNavigate();
  const { homeworkId } = useParams();

  const [tab, setTab] = useState("kutayotgan");
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
  const totalUploaded =
    count("kutayotgan") + count("qaytarilgan") + count("qabul");
  const totalStudents = totalUploaded + count("bajarilmagan");
  const completionPercent = totalStudents
    ? Math.round((totalUploaded / totalStudents) * 100)
    : 0;

  const filtered = useMemo(() => studentsByTab[tab] || [], [studentsByTab, tab]);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

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

      const currentList = mapped[tab] || [];
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
    const list = studentsByTab[tab] || [];
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

      <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="mx-auto max-w-350 space-y-5">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
        >
          <span>←</span>
          <span>Orqaga</span>
        </button>

        <div className="rounded-3xl border border-slate-200 bg-linear-to-r from-white via-emerald-50 to-cyan-50 p-5 sm:p-6">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">{homeworkData.title}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
              <p className="text-xs text-slate-500">Mavzu</p>
              <p className="mt-1 text-base font-bold text-slate-900">{homeworkData.title}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3">
              <p className="text-xs text-slate-500">Tugash vaqti</p>
              <p className="mt-1 text-base font-bold text-slate-900">
                {formatDateTime(homeworkData.deadline) === "-" ? homeworkData.deadline : formatDateTime(homeworkData.deadline)}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs text-emerald-700">Yuklangan javoblar</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{totalUploaded}</p>
            </div>
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
              <p className="text-xs text-cyan-700">Bajarilish foizi</p>
              <p className="mt-1 text-2xl font-black text-cyan-700">{completionPercent}%</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
          <button
            onClick={() => setTab("kutayotgan")}
            className={`inline-flex flex-col items-start gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === "kutayotgan"
                ? "bg-emerald-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="inline-flex items-center gap-2">
              <span>Kutayotganlar</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${tab === "kutayotgan" ? "bg-white/25 text-white" : "bg-amber-100 text-amber-700"}`}>
                {count("kutayotgan")}
              </span>
            </div>
            {count("kutayotgan") > 0 && (
              <span className="text-xs opacity-80 truncate">{studentsByTab.kutayotgan?.map(s => s.name).join(", ")}</span>
            )}
          </button>

          <button
            onClick={() => setTab("qaytarilgan")}
            className={`inline-flex flex-col items-start gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === "qaytarilgan"
                ? "bg-emerald-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="inline-flex items-center gap-2">
              <span>Qaytarilganlar</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${tab === "qaytarilgan" ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"}`}>
                {count("qaytarilgan")}
              </span>
            </div>
            {count("qaytarilgan") > 0 && (
              <span className="text-xs opacity-80 truncate">{studentsByTab.qaytarilgan?.map(s => s.name).join(", ")}</span>
            )}
          </button>

          <button
            onClick={() => setTab("qabul")}
            className={`inline-flex flex-col items-start gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === "qabul"
                ? "bg-emerald-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="inline-flex items-center gap-2">
              <span>Qabul qilinganlar</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${tab === "qabul" ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"}`}>
                {count("qabul")}
              </span>
            </div>
            {count("qabul") > 0 && (
              <span className="text-xs opacity-80 truncate">{studentsByTab.qabul?.map(s => s.name).join(", ")}</span>
            )}
          </button>

          <button
            onClick={() => setTab("bajarilmagan")}
            className={`inline-flex flex-col items-start gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === "bajarilmagan"
                ? "bg-emerald-500 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <div className="inline-flex items-center gap-2">
              <span>Bajarilmagan</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${tab === "bajarilmagan" ? "bg-white/25 text-white" : "bg-rose-100 text-rose-700"}`}>
                {count("bajarilmagan")}
              </span>
            </div>
            {count("bajarilmagan") > 0 && (
              <span className="text-xs opacity-80 truncate">{studentsByTab.bajarilmagan?.map(s => s.name).join(", ")}</span>
            )}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 px-6 py-4 text-sm font-semibold text-slate-500">
              <div>O'quvchi ismi</div>
              <div>Uyga vazifa jo'natilgan vaqt</div>
            </div>

          {loading && (
            <div className="px-6 py-6 text-sm text-gray-500">Yuklanmoqda...</div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="px-6 py-6 text-sm text-gray-500">Bu statusda talabalar topilmadi</div>
          )}

          {!loading &&
            filtered.map((student) => (
              <button
                type="button"
                key={student.id}
                onClick={() => {
                  setSelectedStudent(student);
                  if (student.score !== null && student.score !== undefined) {
                    setScoreInput(String(student.score));
                  } else {
                    setScoreInput("70");
                  }
                  setReviewComment(student.reviewComment || "");
                }}
                className={`w-full grid grid-cols-2 px-6 py-4 border-b text-sm text-left hover:bg-gray-50 ${
                  selectedStudent?.studentId === student.studentId
                    ? "bg-emerald-50 ring-1 ring-inset ring-emerald-200"
                    : ""
                }`}
              >
                <div className="font-semibold text-slate-800">{student.name}</div>
                <div className="text-slate-600">{student.sentAt || "-"}</div>
              </button>
            ))}
          </div>

          <div className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h4 className="text-lg font-bold text-slate-800">Talaba ma'lumoti</h4>

          {!selectedStudent ? (
            <p className="mt-3 text-sm text-slate-500">Talabani tanlang</p>
          ) : (
            <>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-lg font-bold text-slate-900">{selectedStudent.name}</p>
                <p className="text-slate-500">Yuborilgan: {selectedStudent.sentAt || "-"}</p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500">Talaba izohi</p>
                <p className="mt-1 min-h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {selectedStudent.submissionComment || "Izoh yo'q"}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500">Fayl</p>
                {selectedStudent.file ? (
                  <a
                    href={selectedStudent.file}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <span>📎</span>
                    Faylni ochish
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">Fayl yo'q</p>
                )}
              </div>

              {tab !== "bajarilmagan" && (
                <div className="mt-5 border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold text-slate-500">O'qituvchi izohi</p>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Uyga vazifa haqida o'qituvchi izohi..."
                    className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />

                  <p className="mt-3 text-xs font-semibold text-slate-500">Baholash (0-100)</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={submitGrade}
                      disabled={gradingLoading}
                      className="rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:opacity-90 disabled:opacity-60"
                    >
                      {gradingLoading ? "Saqlanmoqda..." : "Bahoni saqlash"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}