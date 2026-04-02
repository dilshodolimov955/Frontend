import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useStudentPortal,
  cn,
  Icons,
} from "./studentPortalShared";

const { ChevronLeft, ChevronRight, Clock } = Icons;

export default function StudentHomePage() {
  const navigate = useNavigate();
  const { lessonsByGroup, darkMode } = useStudentPortal();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekdayLabels = ["D", "S", "C", "P", "J", "S", "Y"];

  const monthLabel = useMemo(() => {
    return selectedDate.toLocaleDateString("uz-UZ", {
      month: "short",
      year: "numeric",
    });
  }, [selectedDate]);

  // Get all lessons with dates
  const allLessons = useMemo(() => {
    return Object.values(lessonsByGroup || {}).flat();
  }, [lessonsByGroup]);

  // Build calendar
  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const leadingDays = (firstDay.getDay() + 6) % 7;

    const cells = [];

    for (let i = leadingDays; i > 0; i -= 1) {
      const date = new Date(year, month - 1, prevMonthDays - i + 1);
      cells.push({ date, day: date.getDate(), muted: true });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      cells.push({ date, day, muted: false });
    }

    while (cells.length % 7 !== 0) {
      const nextDay = cells.length - (leadingDays + daysInMonth) + 1;
      const date = new Date(year, month + 1, nextDay);
      cells.push({ date, day: date.getDate(), muted: true });
    }

    return cells;
  }, [selectedDate]);

  // Get lessons for selected date
  const selectedDayLessons = useMemo(() => {
    return allLessons.filter((lesson) => {
      if (!lesson) return false;
      const lessonDate = new Date(lesson.date);
      return (
        lessonDate.getDate() === selectedDate.getDate() &&
        lessonDate.getMonth() === selectedDate.getMonth() &&
        lessonDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [allLessons, selectedDate]);

  // Check if a date has lessons
  const dateHasLessons = (date) => {
    return allLessons.some((lesson) => {
      if (!lesson) return false;
      const lessonDate = new Date(lesson.date);
      return (
        lessonDate.getDate() === date.getDate() &&
        lessonDate.getMonth() === date.getMonth() &&
        lessonDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const changeMonth = (delta) => {
    setSelectedDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
      {/* Calendar */}
      <div
        className={cn(
          "rounded-2xl border p-4",
          darkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-white"
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <h3
              className={cn(
                "text-sm font-semibold",
                darkMode ? "text-slate-400" : "text-slate-600"
              )}
            >
              Dars jadvali
            </h3>
            <p
              className={cn(
                "mt-1 text-lg font-bold",
                darkMode ? "text-white" : "text-slate-900"
              )}
            >
              {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className={cn(
                "rounded-lg border p-2 transition",
                darkMode
                  ? "border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className={cn(
                "rounded-lg border p-2 transition",
                darkMode
                  ? "border-slate-700 bg-slate-950 text-slate-200 hover:bg-slate-800"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekdayLabels.map((label) => (
            <div
              key={label}
              className={cn(
                "text-center text-xs font-semibold",
                darkMode ? "text-slate-500" : "text-slate-500"
              )}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, index) => {
            const isSelected =
              cell.date.getDate() === selectedDate.getDate() &&
              cell.date.getMonth() === selectedDate.getMonth() &&
              cell.date.getFullYear() === selectedDate.getFullYear();

            const hasLessons = !cell.muted && dateHasLessons(cell.date);

            return (
              <button
                key={`${cell.date.toISOString()}-${index}`}
                onClick={() => setSelectedDate(cell.date)}
                className={cn(
                  "relative flex h-10 items-center justify-center rounded-lg text-sm font-semibold transition",
                  cell.muted
                    ? darkMode
                      ? "bg-slate-950/50 text-slate-600"
                      : "bg-slate-50 text-slate-300"
                    : isSelected
                    ? darkMode
                      ? "bg-slate-700 text-white"
                      : "bg-slate-200 text-slate-900"
                    : darkMode
                    ? "bg-slate-950 text-slate-200 hover:bg-slate-800"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                )}
              >
                {cell.day}
                {hasLessons && (
                  <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lessons list */}
      <div className="space-y-3">
        <h3
          className={cn(
            "text-sm font-semibold",
            darkMode ? "text-slate-400" : "text-slate-600"
          )}
        >
          {selectedDate.toLocaleDateString("uz-UZ", {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </h3>

        {selectedDayLessons.length === 0 ? (
          <div
            className={cn(
              "rounded-2xl border p-8 text-center",
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-slate-50"
            )}
          >
            <p
              className={cn(
                "text-sm",
                darkMode ? "text-slate-400" : "text-slate-500"
              )}
            >
              Bugun darsi yo'q
            </p>
          </div>
        ) : (
          selectedDayLessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() =>
                navigate(`/student/group/${lesson.groupId}/lesson/${lesson.id}`)
              }
              className={cn(
                "block w-full rounded-2xl border p-4 text-left transition hover:shadow-md",
                darkMode
                  ? "border-slate-700 bg-slate-800 hover:bg-slate-700"
                  : "border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
              )}
            >
              <h4
                className={cn(
                  "font-semibold",
                  darkMode ? "text-white" : "text-emerald-900"
                )}
              >
                {lesson.title || "Dars"}
              </h4>
              <div
                className={cn(
                  "mt-2 flex items-center gap-2 text-sm",
                  darkMode ? "text-slate-400" : "text-emerald-700"
                )}
              >
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(lesson.startTime).toLocaleTimeString("uz-UZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  -{" "}
                  {new Date(lesson.endTime).toLocaleTimeString("uz-UZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}