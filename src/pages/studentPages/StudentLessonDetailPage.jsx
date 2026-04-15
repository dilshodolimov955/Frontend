import React, { useEffect, useId, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { studentApi } from "../../api/crmApi";
import {
  useStudentPortal,
  PageShell,
  cn,
  StatusBadge,
  formatDateTime,
  deriveHomeworkDueDate,
  getLessonStatusLabel,
  VideoPreview,
  Icons,
} from "./studentPortalShared";

const { FileText, Calendar, PlayCircle, ExternalLink, ArrowLeft, Sparkles, AlertCircle } =
  Icons;

function HomeworkSubmitForm({ homework, onSubmitted }) {
  const { t, darkMode } = useStudentPortal();
  const fileInputId = useId();
  const [comment, setComment] = useState(homework?.submissionText || "");
  const [file, setFile] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const ratingSummary = useMemo(() => {
    if (!rating) return null;
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
    return {
      text: `Siz darsni ${rating} yulduz bilan baholadingiz`,
      stars,
    };
  }, [rating]);

  useEffect(() => {
    setComment(homework?.submissionText || "");
  }, [homework?.submissionText, homework?.id]);

  useEffect(() => {
    setRating(Number(homework?.submissionRating || 0));
  }, [homework?.id, homework?.submissionRating]);

  useEffect(() => {
    setHoverRating(0);
  }, [homework?.id]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!homework?.id) return;

    if (rating < 1 || rating > 5) {
      setMessage("Darsni baholang: 1 dan 5 gacha yulduz tanlang.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        title: comment.trim() || homework.title || "Uyga vazifa javobi",
        homeworkId: homework.id,
        rating,
      };

      const hasOldSubmission = Boolean(
        homework?.submissionAt || homework?.submissionText || homework?.submissionFile
      );

      const result = hasOldSubmission
        ? await studentApi.updateHomeworkResponse(payload, file)
        : await studentApi.submitHomeworkResponse(payload, file);

      if (result?.success || result?.data || result) {
        setMessage(result?.message || "Javob yuborildi.");
        setFile(null);
        if (typeof onSubmitted === "function") {
          await onSubmitted();
        }
      } else {
        setMessage("Yuborishda xatolik yuz berdi.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Yuborishda xatolik. Iltimos qaytadan urinib ko‘ring.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!homework) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border p-4 sm:p-5",
        darkMode
          ? "border-slate-800 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950"
          : "border-slate-200 bg-linear-to-br from-white via-violet-50 to-fuchsia-50"
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full blur-2xl",
          darkMode ? "bg-violet-500/18" : "bg-violet-300/60"
        )}
      />

      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-violet-500" />
        <p className={cn("text-[13px] font-bold", darkMode ? "text-white" : "text-slate-900")}>
          {t.uploadHomework}
        </p>
      </div>

      <div className="space-y-4">
        {ratingSummary ? (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3",
              darkMode
                ? "border-violet-500/30 bg-linear-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10"
                : "border-violet-200 bg-linear-to-r from-violet-50 via-fuchsia-50 to-pink-50"
            )}
          >
            <p className={cn("text-sm font-semibold", darkMode ? "text-violet-200" : "text-violet-700")}>
              {ratingSummary.text}
            </p>
            <p className="mt-1 text-lg tracking-[0.18em] text-amber-500">{ratingSummary.stars}</p>
          </div>
        ) : null}

        <div>
          <label className={cn("block text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-700")}>
            Student darsni baholang
          </label>
          <div className="mt-2 flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={cn(
                  "text-[30px] leading-none transition duration-200",
                  star <= (hoverRating || rating)
                    ? "scale-110 text-amber-500"
                    : darkMode
                    ? "text-slate-600 hover:text-slate-400"
                    : "text-slate-300 hover:text-slate-500"
                )}
                aria-label={`${star} yulduz`}
              >
                ★
              </button>
            ))}
          </div>
          <p className={cn("mt-1 text-[12px]", darkMode ? "text-slate-400" : "text-slate-500")}>
            Tanlov: {rating || 0}/5
          </p>
        </div>

        <div>
          <label className={cn("block text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-700")}>
            {t.comment}
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Uyga vazifa uchun izohni kiriting..."
            className={cn(
              "mt-2 min-h-32 w-full rounded-2xl border p-3 text-sm outline-none transition",
              darkMode
                ? "border-slate-700 bg-slate-950/80 text-slate-100 focus:border-violet-400 focus:ring-3 focus:ring-violet-500/25"
                : "border-slate-300 bg-white/90 text-slate-900 focus:border-violet-400 focus:ring-3 focus:ring-violet-200"
            )}
          />
        </div>

        <div>
          <label className={cn("block text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-700")}>
            {t.selectFile}
          </label>
          <input id={fileInputId} type="file" onChange={handleFileChange} className="hidden" />
          <label
            htmlFor={fileInputId}
            className={cn(
              "mt-2 flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3 text-sm transition",
              darkMode
                ? "border-violet-500/40 bg-slate-950/80 text-slate-200 hover:border-violet-400"
                : "border-violet-300 bg-white/90 text-slate-700 hover:border-violet-500"
            )}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base",
                  darkMode ? "bg-violet-500/20" : "bg-violet-100"
                )}
              >
                📎
              </span>
              <span className="truncate">
                {file ? file.name : "Faylni tanlang yoki bu yerga bosing"}
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 rounded-xl px-3 py-1.5 text-[12px] font-semibold",
                darkMode ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700"
              )}
            >
              Browse
            </span>
          </label>
          <p className={cn("mt-2 text-[12px]", darkMode ? "text-slate-400" : "text-slate-500")}>
            PNG, JPG, PDF yoki DOC fayl yuklashingiz mumkin.
          </p>
          {file ? (
            <p className={cn("mt-2 text-[12px] font-medium", darkMode ? "text-emerald-300" : "text-emerald-700")}>
              {t.selectedFile}: {file.name}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={cn(
              "rounded-2xl px-5 py-3 text-sm font-bold transition active:scale-[0.99]",
              darkMode
                ? "bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white hover:opacity-90"
                : "bg-linear-to-r from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-lg shadow-violet-300/50 hover:opacity-90"
            )}
          >
            {submitting ? t.submitting : t.finishSubmit}
          </button>
          {message ? (
            <span
              className={cn(
                "rounded-xl px-3 py-2 text-sm",
                darkMode ? "bg-slate-800 text-slate-300" : "bg-white/80 text-slate-700 ring-1 ring-slate-200"
              )}
            >
              {message}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function StudentLessonDetailPage() {
  const { groupId, lessonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { groups, lessonsByGroup, fetchGroupLessons, t, darkMode, language } = useStudentPortal();

  const group =
    location.state?.group || groups.find((item) => String(item.id) === String(groupId));

  const initialLesson = location.state?.lesson || null;
  const initialStatus = location.state?.displayStatus || "Berilmagan";

  const [lesson, setLesson] = useState(initialLesson);
  const [displayStatus, setDisplayStatus] = useState(initialStatus);
  const [lessonVideos, setLessonVideos] = useState(
    Array.isArray(initialLesson?.lessonVideos) ? initialLesson.lessonVideos : []
  );
  const [homeworkList, setHomeworkList] = useState(
    Array.isArray(initialLesson?.homework) ? initialLesson.homework : []
  );
  const [loading, setLoading] = useState(true);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const [videosResult, homeworkResult] = await Promise.all([
        studentApi.getMyGroupLessonVideos(groupId),
        studentApi.getMyGroupHomework(groupId, lessonId),
      ]);

      const videos = Array.isArray(videosResult?.data) ? videosResult.data : [];
      const homeworkData = homeworkResult?.data;
      const homeworks = Array.isArray(homeworkData)
        ? homeworkData
        : homeworkData
        ? [homeworkData]
        : [];

      const filteredVideos = videos.filter(
        (video) =>
          String(video.lesson?.id) === String(lessonId) ||
          String(video.lessonId) === String(lessonId)
      );

      setLessonVideos(filteredVideos);
      setHomeworkList(homeworks);

      const firstHomework = homeworks[0] || null;
      const examLike =
        String(initialLesson?.title || "").toLowerCase().includes("exam") ||
        String(initialLesson?.title || "").toLowerCase().includes("imtihon");

      const fallbackType = examLike ? "EXAM" : null;

      setDisplayStatus(
        getLessonStatusLabel(
          firstHomework?.status,
          fallbackType,
          homeworks.length > 0,
          firstHomework
        )
      );

      if (!initialLesson) {
        setLesson({
          id: lessonId,
          title: `Lesson ${lessonId}`,
          lessonVideos: filteredVideos,
          homework: homeworks,
        });
      } else {
        setLesson((prev) => ({
          ...prev,
          lessonVideos: filteredVideos,
          homework: homeworks,
        }));
      }
    } catch (error) {
      console.error("Lesson detail load failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const wrapped = async () => {
      if (!mounted) return;
      await loadDetails();
    };

    wrapped();
    return () => {
      mounted = false;
    };
  }, [groupId, lessonId, initialLesson]);

  const firstHomework = useMemo(() => homeworkList[0] || null, [homeworkList]);
  const highlightedDeadline = useMemo(() => {
    const dueDate = deriveHomeworkDueDate(firstHomework);
    return dueDate ? formatDateTime(dueDate, language) : null;
  }, [firstHomework, language]);
  const [groupLessons, setGroupLessons] = useState([]);

  useEffect(() => {
    if (!groupId) return;

    const cached = lessonsByGroup[groupId];
    if (Array.isArray(cached)) {
      setGroupLessons(cached);
      return;
    }

    const loadGroupLessons = async () => {
      try {
        const lessons = await fetchGroupLessons(groupId);
        setGroupLessons(Array.isArray(lessons) ? lessons : []);
      } catch (error) {
        console.error("Group lessons load failed", error);
        setGroupLessons([]);
      }
    };

    loadGroupLessons();
  }, [groupId, lessonsByGroup, fetchGroupLessons]);

  const sidebarLessons = useMemo(() => {
    return [...groupLessons].sort((a, b) => {
      const aTime = new Date(a?.created_at || a?.createdAt || 0).getTime();
      const bTime = new Date(b?.created_at || b?.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }, [groupLessons]);

  return (
    <div className="space-y-4">
      <PageShell
        title={lesson?.title || lesson?.topic || t.lessonInfo}
        subtitle={group?.name || "-"}
        right={
          <button
            onClick={() => navigate(`/student/groups/${groupId}`, { state: { group } })}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition",
              darkMode
                ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                : "bg-slate-900 text-white hover:bg-slate-800"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            {t.back}
          </button>
        }
      />

      <section
        className={cn(
          "rounded-[28px] border p-4 shadow-sm sm:p-5",
          darkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-slate-100"
        )}
      >
        <div
          className={cn(
            "mb-5 rounded-3xl border p-4 sm:p-5",
            darkMode
              ? "border-slate-800 bg-linear-to-r from-slate-900 via-slate-900 to-slate-800"
                : "border-slate-200 bg-linear-to-r from-slate-100 to-stone-100"
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold",
                  darkMode
                    ? "bg-slate-800 text-violet-300"
                    : "bg-white text-slate-700 ring-1 ring-slate-200"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t.lessonInfo}
              </div>
              <h3 className={cn("mt-3 text-lg font-black sm:text-xl", darkMode ? "text-white" : "text-slate-900")}>
                {lesson?.title || lesson?.topic || t.noData}
              </h3>
              <p className={cn("mt-1 text-xs", darkMode ? "text-slate-400" : "text-slate-500")}>
                {group?.name || "-"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={displayStatus} />
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-semibold",
                  darkMode ? "bg-slate-950 text-slate-300" : "bg-white text-slate-700 ring-1 ring-slate-200"
                )}
              >
                <PlayCircle className="h-4 w-4" />
                {t.video}: {lessonVideos.length}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div
            className={cn(
              "mt-4 rounded-2xl border p-5 text-sm",
              darkMode
                ? "border-slate-800 bg-slate-950 text-slate-300"
                : "border-slate-200 bg-slate-50 text-slate-600"
            )}
          >
            {t.loading}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              {highlightedDeadline ? (
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-5 py-4 text-base font-semibold",
                    darkMode
                      ? "border border-red-500/40 bg-red-500/20 text-red-100"
                      : "bg-orange-600 text-white"
                  )}
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>Uyga vazifa muddati: {highlightedDeadline}</span>
                </div>
              ) : null}

              <div
                className={cn(
                  "rounded-3xl border p-4",
                  darkMode
                    ? "border-slate-800 bg-linear-to-b from-slate-950 to-slate-900"
                    : "border-slate-200 bg-linear-to-b from-white to-stone-50"
                )}
              >
                <div className="mb-3 flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-violet-500" />
                  <p className={cn("text-[13px] font-bold", darkMode ? "text-white" : "text-slate-900")}>
                    {t.video}
                  </p>
                </div>

                {lessonVideos.length > 0 ? (
                  <div className="space-y-4">
                    {lessonVideos.map((video) => (
                      <div key={video.id} className="space-y-2">
                        <VideoPreview video={video} t={t} />
                        <div className="flex items-center justify-between gap-3">
                          <p className={cn("text-sm font-medium", darkMode ? "text-slate-200" : "text-slate-700")}>
                            {video.title || lesson?.title || `${t.video} #${video.id}`}
                          </p>
                          <a
                            href={video.file || video.url || video.video}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:underline"
                          >
                            {t.openVideo}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-500")}>
                    {t.noData}
                  </p>
                )}
              </div>

              <div
                className={cn(
                  "rounded-3xl border p-4",
                  darkMode
                    ? "border-slate-800 bg-linear-to-b from-slate-950 to-slate-900"
                    : "border-slate-200 bg-linear-to-b from-white to-stone-50"
                )}
              >
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-500" />
                  <p className={cn("text-[13px] font-bold", darkMode ? "text-white" : "text-slate-900")}>
                    {t.homeworkState}
                  </p>
                </div>

                {homeworkList.length > 0 ? (
                  <div className="space-y-3">
                    {homeworkList.map((homework) => {
                      const homeworkStatus = getLessonStatusLabel(
                        homework?.status,
                        null,
                        true,
                        homework
                      );

                      return (
                        <div
                          key={homework.id}
                          className={cn(
                            "rounded-2xl border p-4",
                            darkMode
                              ? "border-slate-800 bg-slate-900"
                              : "border-slate-200 bg-white"
                          )}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className={cn("text-sm font-bold", darkMode ? "text-white" : "text-slate-900")}>
                                {homework.title || lesson?.title || t.noData}
                              </p>
                              <p className={cn("mt-1 text-xs", darkMode ? "text-slate-400" : "text-slate-500")}>
                                {t.homeworkDeadline}:{" "}
                                {formatDateTime(
                                  homework.deadlineAt ||
                                    homework.deadline ||
                                    homework.created_at ||
                                    homework.createdAt,
                                  language
                                )}
                              </p>
                            </div>
                            <StatusBadge status={homeworkStatus} />
                          </div>

                          {homework.description ? (
                            <p className={cn("mt-3 text-sm leading-6", darkMode ? "text-slate-300" : "text-slate-700")}>
                              {homework.description}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className={cn(
                      "rounded-2xl border p-4",
                      darkMode
                        ? "border-slate-800 bg-slate-900"
                        : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <p className={cn("text-sm", darkMode ? "text-slate-400" : "text-slate-500")}>
                      {t.noHomework}
                    </p>
                  </div>
                )}
              </div>

              {firstHomework?.comment ? (
                <div
                  className={cn(
                    "rounded-3xl border p-4",
                    darkMode
                      ? "border-slate-800 bg-linear-to-b from-slate-950 to-slate-900"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <p className={cn("mb-2 text-[13px] font-bold", darkMode ? "text-white" : "text-slate-900")}>
                    O'qituvchi izohi
                  </p>
                  <p className={cn("text-sm leading-6", darkMode ? "text-slate-300" : "text-slate-700")}>
                    {firstHomework.comment}
                  </p>
                </div>
              ) : null}

              {firstHomework?.score !== null && firstHomework?.score !== undefined ? (
                <div
                  className={cn(
                    "rounded-3xl border p-4",
                    darkMode
                      ? "border-slate-800 bg-linear-to-b from-slate-950 to-slate-900"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <p className={cn("mb-2 text-[13px] font-bold", darkMode ? "text-white" : "text-slate-900")}>
                    Qo'yilgan ball
                  </p>
                  <p className={cn("text-sm leading-6", darkMode ? "text-slate-300" : "text-slate-700")}>
                    {firstHomework.score} / 100
                  </p>
                </div>
              ) : null}

              {firstHomework?.submissionText ? (
                <div
                  className={cn(
                    "rounded-3xl border p-4",
                    darkMode
                      ? "border-slate-800 bg-linear-to-b from-slate-950 to-slate-900"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <p className={cn("mb-2 text-[13px] font-bold", darkMode ? "text-white" : "text-slate-900")}>
                    {t.mySubmission}
                  </p>
                  <p className={cn("text-sm leading-6", darkMode ? "text-slate-300" : "text-slate-700")}>
                    {firstHomework.submissionText}
                  </p>
                </div>
              ) : null}

              {firstHomework?.notification ? (
                <div
                  className={cn(
                    "rounded-3xl border p-4",
                    darkMode
                      ? "border-slate-800 bg-linear-to-b from-slate-950 to-slate-900"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <p className={cn("mb-2 text-[13px] font-bold", darkMode ? "text-white" : "text-slate-900")}>
                    Holat bo'yicha xabar
                  </p>
                  <p className={cn("text-sm leading-6", darkMode ? "text-slate-300" : "text-slate-700")}>
                    {firstHomework.notification}
                  </p>
                </div>
              ) : null}

              <HomeworkSubmitForm homework={firstHomework} onSubmitted={loadDetails} />
            </div>

            <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
              <div
                className={cn(
                  "rounded-3xl border p-4",
                  darkMode
                    ? "border-slate-800 bg-linear-to-b from-slate-950 to-slate-900"
                    : "border-slate-200 bg-white"
                )}
              >
                <p className={cn("mb-3 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>
                  {t.lessons}
                </p>

                <div className="max-h-130 space-y-2 overflow-y-auto pr-1">
                  {sidebarLessons.length > 0 ? (
                    sidebarLessons.map((item) => {
                      const active = String(item.id) === String(lessonId);
                      const dateValue = item?.created_at || item?.createdAt;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            navigate(`/student/groups/${groupId}/lesson/${item.id}`, {
                              state: { group, lesson: item },
                            })
                          }
                          className={cn(
                            "w-full rounded-2xl border px-4 py-3 text-left transition",
                            active
                              ? darkMode
                                ? "border-violet-500/60 bg-violet-500/10"
                                : "border-amber-300 bg-amber-100"
                              : darkMode
                              ? "border-slate-800 bg-slate-900 hover:bg-slate-800"
                              : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                          )}
                        >
                          <p className={cn("line-clamp-2 text-sm font-bold", darkMode ? "text-white" : "text-slate-900")}>
                            {item.title || item.topic || t.noData}
                          </p>
                          <p className={cn("mt-1 text-sm", darkMode ? "text-slate-400" : "text-slate-600")}>
                            Dars sanasi: {formatDateTime(dateValue, language)}
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <div
                      className={cn(
                        "rounded-2xl border p-4 text-sm",
                        darkMode
                          ? "border-slate-800 bg-slate-900 text-slate-400"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      )}
                    >
                      {t.noData}
                    </div>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  "rounded-3xl border p-4",
                  darkMode
                    ? "border-slate-800 bg-linear-to-b from-slate-950 to-slate-900"
                    : "border-slate-200 bg-white"
                )}
              >
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <p className={cn("text-[13px] font-bold", darkMode ? "text-white" : "text-slate-900")}>
                    {t.lessonInfo}
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className={darkMode ? "text-slate-400" : "text-slate-500"}>{t.topic}</span>
                    <span className={darkMode ? "text-white" : "text-slate-900"}>
                      {lesson?.title || lesson?.topic || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className={darkMode ? "text-slate-400" : "text-slate-500"}>{t.status}</span>
                    <StatusBadge status={displayStatus} />
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className={darkMode ? "text-slate-400" : "text-slate-500"}>{t.lessonDate}</span>
                    <span className={darkMode ? "text-white" : "text-slate-900"}>
                      {formatDateTime(lesson?.created_at || lesson?.createdAt, language)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className={darkMode ? "text-slate-400" : "text-slate-500"}>{t.homeworkDeadline}</span>
                    <span className={darkMode ? "text-white" : "text-slate-900"}>
                      {formatDateTime(
                        firstHomework?.deadlineAt ||
                          firstHomework?.deadline ||
                          lesson?.deadlineAt ||
                          lesson?.deadline,
                        language
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className={darkMode ? "text-slate-400" : "text-slate-500"}>{t.attachments}</span>
                    <span className={darkMode ? "text-white" : "text-slate-900"}>
                      {lessonVideos.length}
                    </span>
                  </div>

                  {firstHomework?.score !== null && firstHomework?.score !== undefined ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className={darkMode ? "text-slate-400" : "text-slate-500"}>Ball</span>
                      <span className={darkMode ? "text-white" : "text-slate-900"}>
                        {firstHomework.score} / 100
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}