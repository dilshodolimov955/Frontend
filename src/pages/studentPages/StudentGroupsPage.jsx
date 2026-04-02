import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useStudentPortal,
  PageShell,
  cn,
  formatDate,
  formatDateTime,
  getLessonStatusLabel,
  StatusBadge,
} from "./studentPortalShared";

export default function StudentGroupsPage() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const { groups, fetchGroupLessons, lessonsByGroup, t, darkMode, language } =
    useStudentPortal();
  const [groupTab, setGroupTab] = useState("active");
  const [groupLessons, setGroupLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const selectedGroup = useMemo(
    () => groups.find((group) => String(group.id) === String(groupId)) || null,
    [groups, groupId],
  );

  useEffect(() => {
    if (!groupId) return;

    const loadLessons = async () => {
      setLessonsLoading(true);
      try {
        const lessons = await fetchGroupLessons(groupId);
        setGroupLessons(Array.isArray(lessons) ? lessons : []);
      } catch (error) {
        console.error("Failed to load group lessons", error);
        setGroupLessons([]);
      } finally {
        setLessonsLoading(false);
      }
    };

    if (lessonsByGroup[groupId]) {
      setGroupLessons(lessonsByGroup[groupId]);
    } else {
      loadLessons();
    }
  }, [groupId, lessonsByGroup]);

  const filteredGroups = useMemo(() => {
    return (groups || []).filter((group) => {
      if (groupTab === "finished") {
        const status = String(group?.status || "").toUpperCase();
        return status === "FINISHED" || status === "INACTIVE";
      }
      return true;
    });
  }, [groups, groupTab]);

  const mappedLessons = useMemo(() => {
    const list = Array.isArray(groupLessons) ? groupLessons : [];

    return list.map((lesson) => {
      const firstHomework = Array.isArray(lesson?.homework)
        ? lesson.homework[0]
        : lesson?.homework || null;
      const homeworkStatus = getLessonStatusLabel(
        firstHomework?.status,
        null,
        Array.isArray(lesson?.homework)
          ? lesson.homework.length > 0
          : !!lesson?.homework,
        firstHomework,
      );

      return {
        ...lesson,
        firstHomework,
        homeworkStatus,
        videoCount: Array.isArray(lesson.lessonVideos)
          ? lesson.lessonVideos.length
          : lesson.videoCount || 0,
        deadlineValue:
          firstHomework?.deadlineAt ||
          firstHomework?.deadline ||
          lesson?.deadlineAt ||
          lesson?.deadline,
        lessonDateValue:
          lesson.date ||
          lesson.lessonDate ||
          lesson.startDate ||
          lesson.createdAt,
      };
    });
  }, [groupLessons]);

  const statusOptions = useMemo(
    () => [
      { value: "ALL", label: t.all },
      { value: "Qabul qilingan", label: t.accepted },
      { value: "Berilgan", label: t.assigned },
      { value: "Berilmagan", label: t.notAssigned },
      { value: "Qaytarilgan", label: t.returned },
      { value: "Bajarmagan", label: t.notDone },
      { value: "Kutayotgan", label: t.waiting },
    ],
    [t],
  );

  const statusButtonStyles = {
    ALL: darkMode
      ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
      : "bg-violet-100 text-violet-700 hover:bg-violet-200",
    "Qabul qilingan": darkMode
      ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    Berilgan: darkMode
      ? "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
      : "bg-violet-100 text-violet-700 hover:bg-violet-200",
    Berilmagan: darkMode
      ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
      : "bg-slate-200 text-slate-700 hover:bg-slate-300",
    Qaytarilgan: darkMode
      ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
      : "bg-amber-100 text-amber-700 hover:bg-amber-200",
    Bajarmagan: darkMode
      ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
      : "bg-rose-100 text-rose-700 hover:bg-rose-200",
    Kutayotgan: darkMode
      ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30"
      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  };

  const statusCounts = useMemo(() => {
    return mappedLessons.reduce(
      (acc, lesson) => {
        const key = lesson.homeworkStatus;
        acc.ALL += 1;
        if (acc[key] !== undefined) {
          acc[key] += 1;
        }
        return acc;
      },
      {
        ALL: 0,
        "Qabul qilingan": 0,
        Berilgan: 0,
        Berilmagan: 0,
        Qaytarilgan: 0,
        Bajarmagan: 0,
        Kutayotgan: 0,
      },
    );
  }, [mappedLessons]);

  const filteredLessons = useMemo(() => {
    if (statusFilter === "ALL") return mappedLessons;
    return mappedLessons.filter((lesson) => lesson.homeworkStatus === statusFilter);
  }, [mappedLessons, statusFilter]);

  if (groupId) {
    return (
      <div className="space-y-4">
        <PageShell
          title={selectedGroup?.name || t.groups}
          subtitle={t.lessons}
          right={
            <button
              type="button"
              onClick={() => navigate("/student/groups")}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                darkMode
                  ? "bg-slate-800 text-slate-100 hover:bg-slate-700"
                  : "bg-violet-100 text-violet-700 hover:bg-violet-200"
              )}
            >
              {t.back}
            </button>
          }
        />

        <section
          className={cn(
            "rounded-[28px] border p-4 shadow-sm sm:p-5",
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          )}
        >
          <div
            className={cn(
              "mb-4 rounded-3xl border p-4 sm:p-5",
              darkMode
                ? "border-slate-800 bg-linear-to-r from-slate-900 to-slate-800"
                : "border-slate-200 bg-linear-to-r from-violet-50 to-fuchsia-50"
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className={cn(
                    "text-sm",
                    darkMode ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  {t.groups}
                </p>
                <h3
                  className={cn(
                    "mt-1 text-xl font-black",
                    darkMode ? "text-white" : "text-slate-900"
                  )}
                >
                  {selectedGroup?.course?.name || selectedGroup?.name || "-"}
                </h3>
              </div>
              {selectedGroup ? (
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-semibold",
                    darkMode
                      ? "bg-slate-950 text-slate-100 ring-1 ring-slate-700"
                      : "bg-white text-slate-900 ring-1 ring-slate-200"
                  )}
                >
                  {t.teacher}: {selectedGroup.teacher?.fullName || "-"}
                </div>
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "mb-4 rounded-3xl border p-4",
              darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-slate-50"
            )}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p
                className={cn(
                  "text-sm font-semibold",
                  darkMode ? "text-slate-300" : "text-slate-600"
                )}
              >
                {t.homeworkStatus}
              </p>
              <p className={cn("text-sm font-bold", darkMode ? "text-slate-200" : "text-slate-700")}>
                {t.lessons}: {filteredLessons.length}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const active = statusFilter === option.value;
                const count = statusCounts[option.value] ?? 0;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                      statusButtonStyles[option.value] || statusButtonStyles.ALL,
                      active
                        ? "ring-2 ring-offset-2 ring-offset-transparent ring-violet-500"
                        : "ring-1 ring-transparent"
                    )}
                  >
                    <span>{option.label}</span>
                    <span
                      className={cn(
                        "rounded-lg px-2 py-0.5 text-xs font-bold",
                        darkMode ? "bg-slate-900/70" : "bg-white/80"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              "overflow-hidden rounded-3xl border",
              darkMode ? "border-slate-800 bg-slate-950" : "border-slate-200 bg-white"
            )}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className={cn(darkMode ? "bg-slate-900" : "bg-slate-50") }>
                  <tr>
                    <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>#</th>
                    <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>{t.topic}</th>
                    <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>{t.video}</th>
                    <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>{t.homeworkState}</th>
                    <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>{t.homeworkDeadline}</th>
                    <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>{t.lessonDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {lessonsLoading ? (
                    <tr>
                      <td colSpan={6} className={cn("px-4 py-10 text-center text-[13px]", darkMode ? "text-slate-400" : "text-slate-500")}>{t.loading}</td>
                    </tr>
                  ) : filteredLessons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={cn("px-4 py-10 text-center text-[13px]", darkMode ? "text-slate-400" : "text-slate-500")}>{t.noData}</td>
                    </tr>
                  ) : (
                    filteredLessons.map((lesson, index) => {
                      return (
                        <tr
                          key={lesson.id || index}
                          onClick={() =>
                            navigate(`/student/groups/${groupId}/lesson/${lesson.id}`, {
                              state: {
                                group: selectedGroup,
                                lesson,
                                displayStatus: lesson.homeworkStatus,
                              },
                            })
                          }
                          className={cn(
                            "cursor-pointer border-t transition",
                            darkMode
                              ? "border-slate-800 hover:bg-slate-900"
                              : "border-slate-200 hover:bg-violet-50"
                          )}
                        >
                          <td className={cn("px-4 py-4 text-[13px]", darkMode ? "text-slate-300" : "text-slate-700")}>{index + 1}</td>
                          <td className={cn("px-4 py-4 text-[14px] font-semibold", darkMode ? "text-white" : "text-slate-900")}>{lesson.title || lesson.topic || "-"}</td>
                          <td className={cn("px-4 py-4 text-[13px]", darkMode ? "text-slate-300" : "text-slate-700")}>{lesson.videoCount}</td>
                          <td className={cn("px-4 py-4", darkMode ? "text-slate-300" : "text-slate-700")}>
                            <StatusBadge status={lesson.homeworkStatus} />
                          </td>
                          <td className={cn("px-4 py-4 text-[13px]", darkMode ? "text-slate-300" : "text-slate-700")}>
                            {formatDateTime(lesson.deadlineValue, language)}
                          </td>
                          <td className={cn("px-4 py-4 text-[13px]", darkMode ? "text-slate-300" : "text-slate-700")}>
                            {formatDate(lesson.lessonDateValue, language)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageShell title={t.groups} subtitle={t.openGroup} />

      <section
        className={cn(
          "rounded-[28px] border p-4 shadow-sm",
          darkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-white"
        )}
      >
        <div
          className={cn(
            "flex flex-wrap items-center gap-6 border-b pb-4",
            darkMode ? "border-slate-800" : "border-slate-200"
          )}
        >
          {[
            { key: "active", label: t.active },
            { key: "finished", label: t.finished },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setGroupTab(tab.key)}
              className={cn(
                "border-b-2 px-2 pb-3 text-[14px] font-semibold transition",
                groupTab === tab.key
                  ? "border-violet-600 text-violet-600"
                  : darkMode
                  ? "border-transparent text-slate-400 hover:text-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div
          className={cn(
            "mt-4 overflow-hidden rounded-3xl border",
            darkMode
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-white"
          )}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className={cn(darkMode ? "bg-slate-900" : "bg-slate-50")}>
                <tr>
                  <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>#</th>
                  <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>{t.groupName}</th>
                  <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>{t.direction}</th>
                  <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>{t.teacher}</th>
                  <th className={cn("px-4 py-4 text-[13px] font-black", darkMode ? "text-white" : "text-slate-900")}>{t.startTime}</th>
                </tr>
              </thead>

              <tbody>
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className={cn(
                        "px-4 py-10 text-center text-[13px]",
                        darkMode ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      {t.noGroups}
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group, index) => (
                    <tr
                      key={group.id}
                      onClick={() => navigate(`/student/groups/${group.id}`, { state: { group } })}
                      className={cn(
                        "cursor-pointer border-t transition",
                        darkMode
                          ? "border-slate-800 hover:bg-slate-900"
                          : "border-slate-200 hover:bg-violet-50"
                      )}
                    >
                      <td className={cn("px-4 py-4 text-[13px]", darkMode ? "text-slate-300" : "text-slate-700")}>
                        {index + 1}
                      </td>
                      <td className={cn("px-4 py-4 text-[14px] font-semibold", darkMode ? "text-white" : "text-slate-900")}>
                        {group.name}
                      </td>
                      <td className={cn("px-4 py-4 text-[13px]", darkMode ? "text-slate-300" : "text-slate-700")}>
                        {group.course?.name || "-"}
                      </td>
                      <td className={cn("px-4 py-4 text-[13px]", darkMode ? "text-slate-300" : "text-slate-700")}>
                        {group.teacher?.fullName || group.teacher?.id || "-"}
                      </td>
                      <td className={cn("px-4 py-4 text-[13px]", darkMode ? "text-slate-300" : "text-slate-700")}>
                        {formatDate(group.startDate, language)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}