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

  const homeworkData = homework || {
    title: "Uyga vazifa",
    deadline: "-",
    id: homeworkId,
  };

  const currentHomeworkId = Number(homeworkData.id || homeworkId);

  const count = (status) => studentsByTab[status]?.length || 0;

  const filtered = useMemo(() => studentsByTab[tab] || [], [studentsByTab, tab]);

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
      alert(error?.response?.data?.message || "Talabalar ro'yxatini olishda xato");
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
      alert("Talabani tanlang");
      return;
    }

    const score = Number(scoreInput);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      alert("Ball 0 dan 100 gacha bo'lishi kerak");
      return;
    }

    if (!reviewComment.trim()) {
      alert("Admin izohini yozing");
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
      alert("Baholash saqlandi");
    } catch (error) {
      alert(error?.response?.data?.message || "Baholashda xato");
    } finally {
      setGradingLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div onClick={handleBack} className="mb-4 text-gray-600 cursor-pointer">
        ← Orqaga
      </div>

      <h2 className="text-2xl font-bold">{homeworkData.title}</h2>

      <div className="flex gap-20 mt-4 text-sm text-gray-600">
        <div>
          <p>Mavzu</p>
          <p className="font-semibold text-black">{homeworkData.title}</p>
        </div>

        <div>
          <p>Tugash vaqti</p>
          <p className="font-semibold text-black">{homeworkData.deadline}</p>
        </div>
      </div>

      <div className="flex gap-8 mt-8 border-b">
        <button
          onClick={() => setTab("kutayotgan")}
          className={`pb-3 ${tab === "kutayotgan" ? "border-b-2 border-emerald-500 text-emerald-600" : ""}`}
        >
          Kutayotganlar
          <span className="ml-2 bg-yellow-400 text-white text-xs px-2 rounded-full">
            {count("kutayotgan")}
          </span>
        </button>

        <button
          onClick={() => setTab("qaytarilgan")}
          className={`pb-3 ${tab === "qaytarilgan" ? "border-b-2 border-emerald-500 text-emerald-600" : ""}`}
        >
          Qaytarilganlar
        </button>

        <button
          onClick={() => setTab("qabul")}
          className={`pb-3 ${tab === "qabul" ? "border-b-2 border-emerald-500 text-emerald-600" : ""}`}
        >
          Qabul qilinganlar
        </button>

        <button
          onClick={() => setTab("bajarilmagan")}
          className={`pb-3 ${tab === "bajarilmagan" ? "border-b-2 border-emerald-500 text-emerald-600" : ""}`}
        >
          Bajarilmagan
          <span className="ml-2 bg-yellow-400 text-white text-xs px-2 rounded-full">
            {count("bajarilmagan")}
          </span>
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="grid grid-cols-2 px-6 py-4 border-b text-sm text-gray-500 font-medium">
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
                  selectedStudent?.studentId === student.studentId ? "bg-emerald-50" : ""
                }`}
              >
                <div>{student.name}</div>
                <div>{student.sentAt || "-"}</div>
              </button>
            ))}
        </div>

        <div className="bg-white rounded-xl shadow p-4 h-fit">
          <h4 className="text-base font-semibold text-slate-800">Talaba ma'lumoti</h4>

          {!selectedStudent ? (
            <p className="mt-3 text-sm text-slate-500">Talabani tanlang</p>
          ) : (
            <>
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-semibold text-slate-900">{selectedStudent.name}</p>
                <p className="text-slate-500">Yuborilgan: {selectedStudent.sentAt || "-"}</p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-500">Talaba izohi</p>
                <p className="mt-1 rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-700 min-h-12">
                  {selectedStudent.submissionComment || "Izoh yo'q"}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-500">Fayl</p>
                {selectedStudent.file ? (
                  <a
                    href={selectedStudent.file}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-emerald-600 hover:underline"
                  >
                    Faylni ochish
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">Fayl yo'q</p>
                )}
              </div>

              {tab !== "bajarilmagan" && (
                <div className="mt-5 border-t pt-4">
                  <p className="text-xs text-slate-500">Admin izohi</p>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Uyga vazifa haqida admin izohi..."
                    className="mt-1 min-h-20 w-full rounded-lg border px-3 py-2 text-sm"
                  />

                  <p className="text-xs text-slate-500">Baholash (0-100)</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                      className="w-24 rounded-lg border px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={submitGrade}
                      disabled={gradingLoading}
                      className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
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
  );
}