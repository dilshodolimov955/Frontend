import { useEffect, useMemo, useRef, useState } from "react";
import HomeworkDetailPage from "./HomeworkDetailPage";
import {attendanceApi,groupsApi,homeworkApi,lessonsApi,lessonVideosApi,studentGroupApi,studentsApi,teachersApi,} from "../api/crmApi";

const defaultTeachers = [];

const getInitial = (name = "") => {
  const normalized = String(name || "").trim();
  if (!normalized) return "";
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const makeDateHeaders = () => {
  const today = new Date();
  return Array.from({ length: 9 }, (_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (8 - index));
    return {
      day: date.toLocaleDateString("uz-UZ", { weekday: "short" }),
      num: date.getDate(),
      key: `date-${date.toISOString().slice(0, 10)}`,
      lessonId: null,
    };
  });
};

const lessonDateLabel = (createdAt) => {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return { day: "", num: "" };
  }
  return {
    day: date.toLocaleDateString("uz-UZ", { weekday: "short" }),
    num: date.getDate(),
  };
};

export default function GroupDetailsPage({
  theme = {
    card: "bg-white",
    text: "text-slate-900",
    soft: "text-slate-500",
    chip: "bg-slate-50 text-slate-700 border-slate-200",
    rowBorder: "border-slate-200",
  },
  darkMode = false,
  group,
  onBack,
}) {
  const normalizeDays = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  };

  const normalizeGroup = (incomingGroup) => {
    const fallback = {
      name: "Bootcamp Full Stack (NodeJS+ReactJS) N25",
      course: "Backend",
      price: "0",
      status: "ACTIVE",
      days: ["Juma", "Chorshanba"],
      time: "09:00",
      duration: "90 minut",
      room: "2-xona",
    };

    if (!incomingGroup) return fallback;

    return {
      ...fallback,
      ...incomingGroup,
      days: normalizeDays(incomingGroup.days ?? incomingGroup.weekDays),
      course:
        typeof incomingGroup.course === "string"
          ? incomingGroup.course
          : incomingGroup.course?.name || fallback.course,
    };
  };

  const normalizeStudentList = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map((student) => ({
      id: student?.id,
      name:
        student?.name || student?.fullName || student?.student?.fullName || "-",
      phone: student?.phone || student?.email || student?.student?.email || "-",
      active: true,
    }));
  };

  const fileRef = useRef(null);
  const homeworkFileRef = useRef(null);
  const homeworkOpenTimerRef = useRef(null);

  const [groupDeleted, setGroupDeleted] = useState(false);

  const [groupData, setGroupData] = useState(() => normalizeGroup(group));

  const [students, setStudents] = useState(() =>
    normalizeStudentList(group?.students),
  );
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSavingMap, setAttendanceSavingMap] = useState({});
  const [homeworksLoading, setHomeworksLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  const [homeworkSaving, setHomeworkSaving] = useState(false);
  const [deletingHomeworkId, setDeletingHomeworkId] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoLessonId, setVideoLessonId] = useState("");
  const [showVideoUploadModal, setShowVideoUploadModal] = useState(false);
  const [videoDraftFile, setVideoDraftFile] = useState(null);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [teachers, setTeachers] = useState(
    group?.teacher
      ? [{ id: group?.teacherId || 1, name: group.teacher, phone: "-" }]
      : defaultTeachers,
  );
  const [homeworks, setHomeworks] = useState([]);
  const [videos, setVideos] = useState([]);

  const [attendance, setAttendance] = useState({});

  const groupDays = useMemo(
    () => normalizeDays(groupData?.days),
    [groupData?.days],
  );

  const dateHeaders = useMemo(() => {
    if (!Array.isArray(lessons) || lessons.length === 0) {
      return makeDateHeaders().map((item) => ({
        ...item,
        key: `${item.day}-${item.num}`,
        lessonId: null,
      }));
    }

    return [...lessons]
      .sort(
        (a, b) =>
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime(),
      )
      .slice(-9)
      .map((lesson) => {
        const label = lessonDateLabel(lesson.created_at);
        return {
          day: label.day,
          num: label.num,
          key: `lesson-${lesson.id}`,
          lessonId: lesson.id,
        };
      });
  }, [lessons]);

  useEffect(() => {
    if (!group?.id) return;

    const loadStudentsAndAttendance = async () => {
      try {
        setStudentsLoading(true);
        setAttendanceLoading(true);

        const [studentsResult, lessonsResult] = await Promise.allSettled([
          groupsApi.getStudentsByGroup(group.id),
          groupsApi.getLessonsByGroup(group.id),
        ]);

        const list =
          studentsResult.status === "fulfilled" &&
          Array.isArray(studentsResult.value?.data)
            ? studentsResult.value.data
            : [];

        const lessonList =
          lessonsResult.status === "fulfilled" &&
          Array.isArray(lessonsResult.value?.data)
            ? lessonsResult.value.data
            : [];

        setLessons(lessonList);
        setStudents(
          list
            .map((student) => ({
              id: student.id,
              name: student.fullName,
              phone: student.email || "-",
              active: true,
            }))
            .sort((a, b) =>
              String(a.name || "").localeCompare(String(b.name || "")),
            ),
        );

        if (lessonList.length === 0) {
          setAttendance({});
          return;
        }

        const attendanceByStudent = {};

        await Promise.all(
          lessonList.map(async (lesson) => {
            try {
              const attendanceResult = await attendanceApi.getByLesson(
                lesson.id,
              );
              const rows = Array.isArray(attendanceResult?.data)
                ? attendanceResult.data
                : [];

              rows.forEach((row) => {
                const studentId = row?.student?.id;
                if (!studentId) return;
                if (!attendanceByStudent[studentId]) {
                  attendanceByStudent[studentId] = {};
                }
                attendanceByStudent[studentId][`lesson-${lesson.id}`] =
                  row.isPresent ? "Bor" : "Yo'q";
              });
            } catch {
              // Ignore single lesson attendance load failure and keep UI usable.
            }
          }),
        );

        setAttendance(attendanceByStudent);
      } catch {
        // Keep existing data when possible instead of blanking the whole page.
        setLessons([]);
        setAttendance({});
      } finally {
        setStudentsLoading(false);
        setAttendanceLoading(false);
      }
    };

    loadStudentsAndAttendance();
  }, [group?.id]);

  useEffect(() => {
    setGroupData(normalizeGroup(group));
    setStudents(normalizeStudentList(group?.students));
    setTeachers(
      group?.teacher
        ? [
            {
              id: group?.teacherId || 1,
              name: group?.teacher || "-",
              phone: "-",
            },
          ]
        : defaultTeachers,
    );
  }, [group]);

  useEffect(() => {
    loadHomeworks();
    loadVideos();
  }, [group?.id]);

  useEffect(() => {
    if (!showVideoUploadModal) return;
    if (videoLessonId) return;
    if (!Array.isArray(lessons) || lessons.length === 0) return;
    setVideoLessonId(String(lessons[0].id));
  }, [showVideoUploadModal, lessons, videoLessonId]);

  useEffect(() => {
    if (showVideoUploadModal) return;
    setVideoDraftFile(null);
    setVideoDragActive(false);
  }, [showVideoUploadModal]);

  useEffect(() => {
    setAttendance((prev) => {
      const next = {};

      students.forEach((student) => {
        next[student.id] = prev[student.id] || {};
        dateHeaders.forEach((d) => {
          if (!(d.key in next[student.id])) {
            next[student.id][d.key] = "";
          }
        });
      });

      return next;
    });
  }, [students, dateHeaders]);

  const [activeMainTab, setActiveMainTab] = useState("malumotlar");
  const [activeLessonTab, setActiveLessonTab] = useState("darsliklar");
  const [lessonPage, setLessonPage] = useState("list");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [groupDeleteLoading, setGroupDeleteLoading] = useState(false);
  const [teacherAssigning, setTeacherAssigning] = useState(false);
  const [studentAssigning, setStudentAssigning] = useState(false);
  const [teacherOptionsLoading, setTeacherOptionsLoading] = useState(false);
  const [studentOptionsLoading, setStudentOptionsLoading] = useState(false);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [openPersonMenu, setOpenPersonMenu] = useState(null);

  useEffect(() => {
    if (!showTeacherModal) return;
    loadTeacherOptions();
  }, [showTeacherModal]);

  useEffect(() => {
    if (!showStudentModal) return;
    loadStudentOptions();
  }, [showStudentModal, students]);

  const [selectedHomework, setSelectedHomework] = useState(null);
  const [isHomeworkOpening, setIsHomeworkOpening] = useState(false);
  const [openingHomeworkTitle, setOpeningHomeworkTitle] = useState("");
  const [homeworkInitialTab, setHomeworkInitialTab] = useState("all");

  const [editForm, setEditForm] = useState({
    name: groupData.name,
    course: groupData.course,
    price: groupData.price,
    status: groupData.status || "ACTIVE",
    days: groupDays.join(", "),
    time: groupData.lessonTime || groupData.time,
    duration: groupData.duration,
    room: groupData.room,
  });

  useEffect(() => {
    setActiveMainTab("malumotlar");
    setLessonPage("list");
  }, [group?.id]);

  const [homeworkForm, setHomeworkForm] = useState({
    lessonId: "",
    title: "",
    durationTime: "16",
    file: null,
  });
  const [lessonForm, setLessonForm] = useState({
    title: "",
  });
  const [lessonSaving, setLessonSaving] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    if (!successToast) return;
    const timer = setTimeout(() => setSuccessToast(""), 2600);
    return () => clearTimeout(timer);
  }, [successToast]);

  useEffect(() => {
    return () => {
      if (homeworkOpenTimerRef.current) {
        clearTimeout(homeworkOpenTimerRef.current);
      }
    };
  }, []);

  const actionBtnClass = darkMode
    ? "px-3 py-2 rounded-xl border border-slate-700 text-slate-200 hover:bg-slate-800 transition text-sm"
    : "px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition text-sm";
  const topActionBtnClass = darkMode
    ? "inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
    : "inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow";

  const infoCardClass = darkMode
    ? `${theme.card} border border-slate-700/80 rounded-3xl p-4 shadow-[0_14px_40px_rgba(15,23,42,0.35)] min-h-0`
    : `${theme.card} border border-slate-200/80 rounded-3xl p-4 shadow-[0_12px_35px_rgba(15,23,42,0.08)] min-h-0`;
  const innerBorderClass = darkMode ? "border-slate-700" : "border-slate-200";
  const personCardClass = darkMode
    ? "group flex items-center justify-between gap-3 rounded-2xl border border-slate-700/90 bg-slate-900/70 px-3 py-2.5 min-w-0 transition hover:bg-slate-800/80 hover:border-slate-600"
    : "group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 min-w-0 transition hover:bg-slate-50 hover:border-slate-300";
  const avatarClass = darkMode
    ? "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 bg-gradient-to-br from-slate-700 to-slate-800 text-slate-100"
    : "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700";

  const inputClass = darkMode
    ? "w-full rounded-2xl border border-slate-600 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
    : "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20";

  const tabClass = (active) =>
    active
      ? "pb-3 text-sm font-medium border-b-2 border-emerald-500 text-emerald-600"
      : darkMode
        ? "pb-3 text-sm font-medium border-b-2 border-transparent text-slate-400"
        : "pb-3 text-sm font-medium border-b-2 border-transparent text-slate-500";

  const subTabClass = (active) =>
    active
      ? "px-4 py-2 rounded-xl bg-white border border-emerald-300 text-slate-900 text-sm font-medium shadow-sm"
      : darkMode
        ? "px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium"
        : "px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm font-medium";

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

  const formatPrettyDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("uz-UZ", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytesValue) => {
    const bytes = Number(bytesValue);
    if (!Number.isFinite(bytes) || bytes <= 0) return "-";

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getVideoSize = async (fileUrl) => {
    if (!fileUrl) return "-";

    try {
      const response = await fetch(fileUrl, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");
      return formatFileSize(contentLength);
    } catch {
      return "-";
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const loadHomeworks = async () => {
    if (!group?.id) {
      setHomeworks([]);
      return;
    }

    try {
      setHomeworksLoading(true);
      const result = await homeworkApi.getByGroup(group.id);
      const list = Array.isArray(result?.data) ? result.data : [];

      const mapped = await Promise.all(
        list.map(async (item) => {
          const statuses = await homeworkApi.getStatuses(item.id);
          const pending = statuses.PENDING.length;
          const approved = statuses.APPROVED.length;
          const rejected = statuses.REJECTED.length;
          const notReviewed = statuses.NOT_REVIEWED.length;
          const total = pending + approved + rejected + notReviewed;

          const createdAt = item.created_at ? new Date(item.created_at) : null;
          const deadlineDate = createdAt
            ? new Date(
                createdAt.getTime() +
                  Number(item.durationTime || 16) * 60 * 60 * 1000,
              )
            : null;

          return {
            id: item.id,
            title: item.title,
            lessonId: item.lessonId,
            file: item.file || "",
            total,
            submitted: pending + approved + rejected,
            checked: approved + rejected,
            pending,
            approved,
            rejected,
            notReviewed,
            assignedAt: formatDateTime(item.created_at),
            deadline: formatDateTime(deadlineDate),
            lessonDate: formatDate(item.lesson?.created_at || item.created_at),
            createdAt: item.created_at,
            createdAtTs: item.created_at
              ? new Date(item.created_at).getTime()
              : Number.NEGATIVE_INFINITY,
          };
        }),
      );

      // Sort by newest first
      mapped.sort((a, b) => {
        const byDate = (b.createdAtTs || Number.NEGATIVE_INFINITY) -
          (a.createdAtTs || Number.NEGATIVE_INFINITY);
        if (byDate !== 0) return byDate;
        return Number(b.id || 0) - Number(a.id || 0);
      });

      setHomeworks(mapped);
    } catch {
      setHomeworks([]);
    } finally {
      setHomeworksLoading(false);
    }
  };

  const loadVideos = async () => {
    if (!group?.id) {
      setVideos([]);
      return;
    }

    try {
      setVideosLoading(true);
      const result = await lessonVideosApi.getByGroup(group.id);
      const list = Array.isArray(result?.data) ? result.data : [];

      const mappedVideos = await Promise.all(
        list.map(async (item) => {
          const fileName = item.file ? String(item.file).split("/").pop() : "Video";
          const inferredOrder = Number(String(fileName || "").split("-")[0]);
          const inferredDate = Number.isFinite(inferredOrder)
            ? new Date(inferredOrder)
            : null;

          return {
            id: item.id,
            name: fileName,
            lessonName: item.lesson?.title || "-",
            status: "Tayyor",
            lessonDate: formatDate(item.lesson?.created_at),
            size: await getVideoSize(item.file),
            uploadedAt: formatPrettyDateTime(item.created_at || inferredDate),
            file: item.file,
            createdAtTs: item.created_at
              ? new Date(item.created_at).getTime()
              : Number.NEGATIVE_INFINITY,
            sortKey: Number.isFinite(inferredOrder)
              ? inferredOrder
              : Number(item.id || 0),
          };
        }),
      );

      // Sort by newest first
      mappedVideos.sort((a, b) => {
        const byDate = (b.createdAtTs || Number.NEGATIVE_INFINITY) -
          (a.createdAtTs || Number.NEGATIVE_INFINITY);
        if (byDate !== 0) return byDate;
        return Number(b.sortKey || 0) - Number(a.sortKey || 0);
      });

      setVideos(mappedVideos);
    } catch {
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  const setAttendanceValue = async (studentId, header, next) => {
    if (!header?.lessonId) {
      alert("Bu sana uchun dars topilmadi");
      return;
    }

    const key = header.key;
    const loadingKey = `${studentId}-${header.lessonId}`;
    const current = attendance[studentId]?.[key] || "";

    if (current === next) {
      return;
    }

    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [key]: next,
      },
    }));
    setAttendanceSavingMap((prev) => ({ ...prev, [loadingKey]: true }));

    try {
      await attendanceApi.update({
        lessonId: header.lessonId,
        studentId,
        isPresent: next === "Bor",
      });
    } catch (error) {
      if (error?.response?.status === 404) {
        await attendanceApi.create({
          lessonId: header.lessonId,
          studentId,
          isPresent: next === "Bor",
        });
      } else {
        setAttendance((prev) => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [key]: current,
          },
        }));
        alert(error?.response?.data?.message || "Davomatni saqlashda xato");
      }
    } finally {
      setAttendanceSavingMap((prev) => {
        const copy = { ...prev };
        delete copy[loadingKey];
        return copy;
      });
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: groupData.name || "",
      course: groupData.course || "",
      price: groupData.price || "",
      status: groupData.status || "ACTIVE",
      days: groupDays.join(", "),
      time: groupData.lessonTime || groupData.time || "",
      duration: groupData.duration || "",
      room: groupData.room || "",
    });
    setShowEditModal(true);
  };

  const saveGroupEdit = async () => {
    try {
      if (group?.id) {
        await groupsApi.update(group.id, { status: editForm.status });
      }

      setGroupData((prev) => ({
        ...prev,
        name: editForm.name,
        course: editForm.course,
        price: editForm.price,
        status: editForm.status,
        days: editForm.days
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        time: editForm.time,
        duration: editForm.duration,
        room: editForm.room,
      }));
      setShowEditModal(false);
    } catch (error) {
      alert(error?.response?.data?.message || "Statusni yangilashda xato");
    }
  };

  const loadGroupStudents = async () => {
    if (!group?.id) {
      setStudents([]);
      return;
    }

    try {
      const studentsResult = await groupsApi.getStudentsByGroup(group.id);
      const list = Array.isArray(studentsResult?.data)
        ? studentsResult.data
        : [];

      setStudents(
        list
          .map((student) => ({
            id: student.id,
            name: student.fullName,
            phone: student.email || "-",
            active: true,
          }))
          .sort((a, b) =>
            String(a.name || "").localeCompare(String(b.name || "")),
          ),
      );
    } catch {
      setStudents([]);
    }
  };

  const loadTeacherOptions = async () => {
    try {
      setTeacherOptionsLoading(true);
      const result = await teachersApi.getAll();
      const list = Array.isArray(result?.data) ? result.data : [];
      setTeacherOptions(list);
    } catch {
      setTeacherOptions([]);
    } finally {
      setTeacherOptionsLoading(false);
    }
  };

  const loadStudentOptions = async () => {
    try {
      setStudentOptionsLoading(true);
      const result = await studentsApi.getAll();
      const list = Array.isArray(result?.data) ? result.data : [];
      const inGroupStudentIds = new Set(
        students.map((student) => Number(student.id)),
      );

      setStudentOptions(
        list.filter((student) => !inGroupStudentIds.has(Number(student.id))),
      );
    } catch {
      setStudentOptions([]);
    } finally {
      setStudentOptionsLoading(false);
    }
  };

  const addTeacher = async () => {
    if (!group?.id) {
      alert("Guruh tanlanmagan");
      return;
    }

    if (!selectedTeacherId) {
      alert("O‘qituvchini tanlang");
      return;
    }

    try {
      setTeacherAssigning(true);
      await groupsApi.update(group.id, {
        teacherId: Number(selectedTeacherId),
      });

      const selectedTeacher = teacherOptions.find(
        (teacher) => Number(teacher.id) === Number(selectedTeacherId),
      );

      if (selectedTeacher) {
        setTeachers([
          {
            id: selectedTeacher.id,
            name: selectedTeacher.fullName,
            phone: selectedTeacher.phone || selectedTeacher.email || "-",
          },
        ]);
      }

      setSelectedTeacherId("");
      setShowTeacherModal(false);
    } catch (error) {
      alert(
        error?.response?.data?.message || "O‘qituvchini biriktirishda xato",
      );
    } finally {
      setTeacherAssigning(false);
    }
  };

  const addStudent = async () => {
    if (!group?.id) {
      alert("Guruh tanlanmagan");
      return;
    }

    if (!selectedStudentId) {
      alert("Talabani tanlang");
      return;
    }

    try {
      setStudentAssigning(true);
      await studentGroupApi.create({
        groupId: Number(group.id),
        studentId: Number(selectedStudentId),
      });

      await loadGroupStudents();
      await loadStudentOptions();
      setSelectedStudentId("");
      setShowStudentModal(false);
      alert("Talaba guruhga muvaffaqiyatli qo‘shildi");
    } catch (error) {
      alert(
        error?.response?.data?.message || "Talabani guruhga qo'shishda xato",
      );
    } finally {
      setStudentAssigning(false);
    }
  };

  const addHomework = async () => {
    if (!group?.id) {
      alert("Guruh tanlanmagan");
      return;
    }

    if (!homeworkForm.lessonId) {
      alert("Darsni tanlang");
      return;
    }

    if (!homeworkForm.title.trim()) {
      alert("Sarlavha kiriting");
      return;
    }

    try {
      setHomeworkSaving(true);
      await homeworkApi.create({
        groupId: Number(group.id),
        lessonId: Number(homeworkForm.lessonId),
        title: homeworkForm.title.trim(),
        durationTime: Number(homeworkForm.durationTime || 16),
        file: homeworkForm.file || undefined,
      });

      await loadHomeworks();
      setHomeworkForm({
        lessonId: "",
        title: "",
        durationTime: "16",
        file: null,
      });
      if (homeworkFileRef.current) {
        homeworkFileRef.current.value = "";
      }
      setLessonPage("list");
      setActiveLessonTab("uyga-vazifa");
    } catch (error) {
      alert(error?.response?.data?.message || "Uyga vazifa yaratishda xato");
    } finally {
      setHomeworkSaving(false);
    }
  };

  const addLesson = async () => {
    if (!group?.id) {
      alert("Guruh tanlanmagan");
      return;
    }

    if (!lessonForm.title.trim()) {
      alert("Mavzuni kiriting");
      return;
    }

    try {
      setLessonSaving(true);
      await lessonsApi.create({
        groupId: Number(group.id),
        title: lessonForm.title.trim(),
      });

      await loadGroupStudents();

      const lessonsResult = await groupsApi.getLessonsByGroup(group.id);
      setLessons(Array.isArray(lessonsResult?.data) ? lessonsResult.data : []);

      setLessonForm({
        title: "",
      });
      setSuccessToast("Dars muvaffaqiyatli yaratildi");
    } catch (error) {
      alert(error?.response?.data?.message || "Dars yaratishda xato");
    } finally {
      setLessonSaving(false);
    }
  };

  const handleVideoUpload = async (file) => {
    if (!group?.id) {
      alert("Guruh tanlanmagan");
      return;
    }

    if (!videoLessonId) {
      alert("Darsni tanlang");
      return;
    }

    if (!file) return;

    try {
      setVideoUploading(true);
      await lessonVideosApi.create({
        groupId: Number(group.id),
        lessonId: Number(videoLessonId),
        file,
      });
      await loadVideos();
      setVideoDraftFile(null);
      setShowVideoUploadModal(false);
    } catch (error) {
      alert(error?.response?.data?.message || "Video yuklashda xato");
    } finally {
      setVideoUploading(false);
    }
  };

  const handleVideoPick = (file) => {
    if (!file) return;
    setVideoDraftFile(file);
  };

  const openHomeworkDetail = (homework) => {
    openHomeworkDetailWithTab(homework, "all");
  };

  const openHomeworkDetailWithTab = (homework, tabName = "all") => {
    if (!homework?.id) return;

    setOpeningHomeworkTitle(homework.title || "Uyga vazifa");
    setIsHomeworkOpening(true);
    setHomeworkInitialTab(tabName);

    if (homeworkOpenTimerRef.current) {
      clearTimeout(homeworkOpenTimerRef.current);
    }

    homeworkOpenTimerRef.current = setTimeout(() => {
      setSelectedHomework(homework);
      setIsHomeworkOpening(false);
      homeworkOpenTimerRef.current = null;
    }, 260);
  };

  const deleteTeacher = (id) => {
    const isOk = window.confirm("Rostan ham o‘qituvchini o‘chirmoqchimisiz?");
    if (!isOk) return;
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
    setOpenPersonMenu(null);
  };

  const deleteStudent = async (id) => {
    const isOk = window.confirm("Rostan ham talabani o‘chirmoqchimisiz?");
    if (!isOk) return;

    if (!group?.id) {
      alert("Guruh tanlanmagan");
      return;
    }

    try {
      await studentGroupApi.remove({
        groupId: Number(group.id),
        studentId: Number(id),
      });

      await loadGroupStudents();
      setAttendance((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      setOpenPersonMenu(null);
    } catch (error) {
      alert(
        error?.response?.data?.message || "Talabani guruhdan o‘chirishda xato",
      );
    }
  };

  const editTeacher = async (id) => {
    const target = teachers.find((teacher) => teacher.id === id);
    if (!target) return;

    const nextName = window.prompt("O‘qituvchi ismi", target.name || "");
    if (nextName === null) return;

    const fullName = nextName.trim();
    if (!fullName) {
      alert("O‘qituvchi ismi bo‘sh bo‘lishi mumkin emas");
      return;
    }

    try {
      await teachersApi.update(id, { fullName });
      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === id
            ? {
                ...teacher,
                name: fullName,
              }
            : teacher,
        ),
      );
      setOpenPersonMenu(null);
    } catch (error) {
      alert(error?.response?.data?.message || "O‘qituvchini tahrirlashda xato");
    }
  };

  const editStudent = (id) => {
    const target = students.find((student) => student.id === id);
    if (!target) return;

    const nextName = window.prompt("Talaba ismi", target.name || "");
    if (nextName === null) return;
    const nextPhone = window.prompt("Telefon", target.phone || "");
    if (nextPhone === null) return;

    setStudents((prev) =>
      prev
        .map((student) =>
          student.id === id
            ? {
                ...student,
                name: nextName.trim() || student.name,
                phone: nextPhone.trim() || "-",
              }
            : student,
        )
        .sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || "")),
        ),
    );
    setOpenPersonMenu(null);
  };

  const deleteHomework = async (id) => {
    const isOk = window.confirm("Rostan ham uyga vazifani o‘chirmoqchimisiz?");
    if (!isOk) return;

    try {
      setDeletingHomeworkId(id);
      await homeworkApi.remove(Number(id));
      setSuccessToast("Uyga vazifa muvaffaqiyatli o‘chirildi");
      await loadHomeworks();
    } catch (error) {
      alert(error?.response?.data?.message || "Uyga vazifani o‘chirishda xato");
    } finally {
      setDeletingHomeworkId(null);
    }
  };

  const deleteGroup = async () => {
    const isOk = window.confirm("Rostan ham guruhni o‘chirmoqchimisiz?");
    if (!isOk) return;

    if (!group?.id) {
      alert("Guruh ID topilmadi");
      return;
    }

    try {
      setGroupDeleteLoading(true);
      await groupsApi.remove(group.id);
      setGroupDeleted(true);
    } catch (error) {
      alert(error?.response?.data?.message || "Guruhni o'chirishda xato");
    } finally {
      setGroupDeleteLoading(false);
    }
  };

  if (isHomeworkOpening) {
    return (
      <div className="relative min-h-[70vh] w-full overflow-hidden rounded-3xl border border-white/60 bg-[radial-gradient(circle_at_top_left,#ecfeff_0%,#eef6ff_38%,#f8fafc_100%)] p-4 sm:p-6">
        <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="relative mx-auto mt-6 max-w-3xl rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_20px_80px_rgba(2,132,199,0.13)] backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Homework transition
            </p>
          </div>
          <h3 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">
            {openingHomeworkTitle || "Uyga vazifa ochilmoqda"}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Topshirganlar ro'yxati va baholash oynasi tayyorlanmoqda...
          </p>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-[pulse_0.9s_ease-in-out_infinite] rounded-full bg-linear-to-r from-emerald-500 via-cyan-500 to-sky-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {successToast && (
        <div className="fixed right-4 top-4 z-[130] max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-lg">
          <p className="text-sm font-semibold text-emerald-700">{successToast}</p>
        </div>
      )}

      <div className="h-dvh w-full overflow-hidden">
        <div className="h-full flex flex-col gap-3 p-3 overflow-hidden">
          <div className="shrink-0 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 min-w-0">
            <div className="flex items-start sm:items-center gap-3 flex-wrap min-w-0">
              <button onClick={onBack} className={`${actionBtnClass} shrink-0`}>
                ← Orqaga
              </button>

              <div className="min-w-0">
                <h2
                  className={`text-lg sm:text-xl font-bold truncate ${theme.text}`}
                >
                  {groupData.name}
                </h2>
                <p className={`text-xs sm:text-sm mt-1 truncate ${theme.soft}`}>
                  Guruh ma'lumotlari
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={openEditModal} className={topActionBtnClass}>
                <span aria-hidden="true">✏️</span>
                <span>Tahrirlash</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTeacherId("");
                  setShowTeacherModal(true);
                }}
                className={topActionBtnClass}
              >
                <span aria-hidden="true">👨‍🏫</span>
                <span>O‘qituvchi qo‘shish</span>
              </button>

              <button
                onClick={() => {
                  setSelectedStudentId("");
                  setShowStudentModal(true);
                }}
                className={topActionBtnClass}
              >
                <span aria-hidden="true">🎓</span>
                <span>O‘quvchi qo‘shish</span>
              </button>

              <button
                disabled={groupDeleteLoading}
                onClick={deleteGroup}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-r from-rose-500 to-red-500 text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                title="Guruhni o‘chirish"
              >
                {groupDeleteLoading ? "..." : "🗑️"}
              </button>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3 border-b border-slate-200 overflow-x-auto">
            <button
              onClick={() => {
                setActiveMainTab("malumotlar");
                setLessonPage("list");
              }}
              className={tabClass(activeMainTab === "malumotlar")}
            >
              Ma&apos;lumotlar
            </button>
            <button
              onClick={() => {
                setActiveMainTab("guruh-darsliklari");
                setLessonPage("list");
              }}
              className={tabClass(activeMainTab === "guruh-darsliklari")}
            >
              Guruh darsliklari
            </button>
            <button
              onClick={() => {
                setActiveMainTab("akademik-davomat");
                setLessonPage("list");
              }}
              className={tabClass(activeMainTab === "akademik-davomat")}
            >
              Akademik davomat
            </button>
          </div>

          {activeMainTab !== "guruh-darsliklari" && (
            <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-3 overflow-hidden">
              <div className="min-h-0 overflow-hidden flex flex-col gap-3">
                <div className={infoCardClass}>
                  <div className="flex items-center justify-between gap-3 mb-3 min-w-0">
                    <h3
                      className={`text-sm sm:text-base font-semibold ${theme.text}`}
                    >
                      Ma&apos;lumotlar
                    </h3>

                    <span
                      className={`px-3 py-1 rounded-full text-xs border shrink-0 ${theme.chip}`}
                    >
                      {groupData.course}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm min-w-0">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className={`rounded-2xl border px-3 py-3 ${theme.chip}`}>
                        <p className={`text-[11px] uppercase tracking-wide ${theme.soft}`}>
                          O‘qituvchi
                        </p>
                        <p className={`mt-1 text-base sm:text-lg font-bold truncate ${theme.text}`}>
                          {teachers[0]?.name || "-"}
                        </p>
                      </div>

                      <div className={`rounded-2xl border px-3 py-3 ${theme.chip}`}>
                        <p className={`text-[11px] uppercase tracking-wide ${theme.soft}`}>
                          Talabalar
                        </p>
                        <p className={`mt-1 text-base sm:text-lg font-bold ${theme.text}`}>
                          {students.length} ta
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className={theme.soft}>O‘tish kunlari</p>
                      <p
                        className={`font-medium wrap-break-word ${theme.text}`}
                      >
                        {groupDays.join(", ")}
                      </p>
                    </div>

                    <div>
                      <p className={theme.soft}>O‘tish vaqti</p>
                      <p
                        className={`font-medium wrap-break-word ${theme.text}`}
                      >
                        {groupData.lessonTime || groupData.time}
                      </p>
                    </div>

                    <div>
                      <p className={theme.soft}>O‘qish davomiyligi</p>
                      <p
                        className={`font-medium wrap-break-word ${theme.text}`}
                      >
                        {groupData.duration}
                      </p>
                    </div>

                    <div>
                      <p className={theme.soft}>Xona</p>
                      <p
                        className={`font-medium wrap-break-word ${theme.text}`}
                      >
                        {groupData.room}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={infoCardClass}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3
                      className={`text-sm sm:text-base font-semibold ${theme.text}`}
                    >
                      O‘qituvchilar
                    </h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] border ${theme.chip}`}
                    >
                      {teachers.length} ta
                    </span>
                  </div>

                  <div className="space-y-2 max-h-45 overflow-y-auto pr-1">
                    {teachers.map((teacher) => (
                      <article key={teacher.id} className={personCardClass}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={avatarClass}>
                            {getInitial(teacher.name)}
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-sm font-semibold truncate ${theme.text}`}
                            >
                              {teacher.name}
                            </p>
                            <p className={`text-xs truncate ${theme.soft}`}>
                              {teacher.phone}
                            </p>
                          </div>
                        </div>

                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenPersonMenu((prev) =>
                                prev?.type === "teacher" &&
                                prev?.id === teacher.id
                                  ? null
                                  : { type: "teacher", id: teacher.id },
                              )
                            }
                            className={`w-8 h-8 rounded-lg border text-base leading-none flex items-center justify-center cursor-pointer transition ${
                              darkMode
                                ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                                : "border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            ...
                          </button>

                          {openPersonMenu?.type === "teacher" &&
                            openPersonMenu?.id === teacher.id && (
                              <div
                                className={`absolute right-0 top-9 z-30 min-w-30 rounded-xl border shadow-lg p-1 ${
                                  darkMode
                                    ? "bg-slate-900 border-slate-700"
                                    : "bg-white border-slate-200"
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => editTeacher(teacher.id)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                                    darkMode
                                      ? "text-slate-200 hover:bg-slate-800"
                                      : "text-slate-700 hover:bg-slate-50"
                                  }`}
                                >
                                  Tahrirlash
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteTeacher(teacher.id)}
                                  className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                                    darkMode
                                      ? "text-red-300 hover:bg-red-500/10"
                                      : "text-red-600 hover:bg-red-50"
                                  }`}
                                >
                                  O‘chirish
                                </button>
                              </div>
                            )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

                <div className={`${infoCardClass} flex-1 overflow-hidden`}>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3
                      className={`text-sm sm:text-base font-semibold ${theme.text}`}
                    >
                      Talabalar
                    </h3>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] border ${theme.chip}`}
                    >
                      {students.length} ta
                    </span>
                  </div>

                  <div className="h-full overflow-y-auto pr-1 space-y-2">
                    {studentsLoading ? (
                      <div className={`text-sm ${theme.soft}`}>
                        Yuklanmoqda...
                      </div>
                    ) : students.length === 0 ? (
                      <div className={`text-sm ${theme.soft}`}>
                        Talabalar topilmadi
                      </div>
                    ) : (
                      students.map((student) => (
                        <article key={student.id} className={personCardClass}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={avatarClass}>
                              {getInitial(student.name)}
                            </div>

                            <div className="min-w-0">
                              <p
                                className={`text-sm font-semibold truncate ${theme.text}`}
                              >
                                {student.name}
                              </p>
                              <p className={`text-xs truncate ${theme.soft}`}>
                                {student.phone}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-medium border ${
                                darkMode
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              Faol
                            </span>

                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenPersonMenu((prev) =>
                                    prev?.type === "student" &&
                                    prev?.id === student.id
                                      ? null
                                      : { type: "student", id: student.id },
                                  )
                                }
                                className={`w-8 h-8 rounded-lg border text-base leading-none flex items-center justify-center cursor-pointer transition ${
                                  darkMode
                                    ? "border-slate-600 text-slate-200 hover:bg-slate-800"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                ...
                              </button>

                              {openPersonMenu?.type === "student" &&
                                openPersonMenu?.id === student.id && (
                                  <div
                                    className={`absolute right-0 top-9 z-30 min-w-30 rounded-xl border shadow-lg p-1 ${
                                      darkMode
                                        ? "bg-slate-900 border-slate-700"
                                        : "bg-white border-slate-200"
                                    }`}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => editStudent(student.id)}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                                        darkMode
                                          ? "text-slate-200 hover:bg-slate-800"
                                          : "text-slate-700 hover:bg-slate-50"
                                      }`}
                                    >
                                      Tahrirlash
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteStudent(student.id)}
                                      className={`w-full text-left px-3 py-2 rounded-lg text-xs ${
                                        darkMode
                                          ? "text-red-300 hover:bg-red-500/10"
                                          : "text-red-600 hover:bg-red-50"
                                      }`}
                                    >
                                      O‘chirish
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {activeMainTab === "malumotlar" && (
                <div
                  className={`${theme.card} relative border rounded-3xl shadow-[0_16px_45px_rgba(15,23,42,0.12)] min-w-0 min-h-0 flex flex-col overflow-hidden`}
                >
                  <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-emerald-500/12 blur-3xl" />
                    <div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-cyan-500/12 blur-3xl" />
                  </div>

                  <div
                    className={`relative shrink-0 px-5 py-4 flex items-center justify-between gap-3 border-b min-w-0 ${innerBorderClass}`}
                  >
                    <div>
                      <h3
                        className={`text-base sm:text-lg font-extrabold ${theme.text}`}
                      >
                        Yangi dars yaratish
                      </h3>
                      <p className={`mt-1 text-xs sm:text-sm ${theme.soft}`}>
                        Mavzuni tez kiritib, darsni premium paneldan e'lon qiling
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border shrink-0 ${theme.chip}`}
                    >
                      Smart Builder
                    </span>
                  </div>

                  <div className="relative flex-1 min-h-0 overflow-auto p-4 sm:p-6">
                    <div className="max-w-5xl mx-auto grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className={`${darkMode ? "bg-slate-900/70 border-slate-700/80" : "bg-white/80 border-slate-200/80"} border rounded-3xl p-4 sm:p-5`}>
                        <div className="mb-4 flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-linear-to-br from-emerald-500 to-cyan-500 text-white flex items-center justify-center text-lg shadow-sm">
                            ✍️
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${theme.text}`}>Mavzu nomi</p>
                            <p className={`text-xs ${theme.soft}`}>Qisqa va aniq nom kiriting</p>
                          </div>
                        </div>

                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          * Mavzu
                        </label>
                        <input
                          className={inputClass}
                          placeholder="Mavzuni kiriting"
                          value={lessonForm.title}
                          onChange={(e) =>
                            setLessonForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                        />

                        <div className="mt-4 flex flex-wrap gap-2">
                          {[
                            "Backend API dizayni",
                            "CRUD amaliyoti",
                            "Auth va JWT",
                            "Prisma relationlar",
                          ].map((sample) => (
                            <button
                              key={sample}
                              type="button"
                              onClick={() =>
                                setLessonForm((prev) => ({
                                  ...prev,
                                  title: sample,
                                }))
                              }
                              className={`px-3 py-1.5 rounded-full text-xs border transition ${theme.chip}`}
                            >
                              {sample}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-5">
                          <button
                            onClick={() =>
                              setLessonForm({
                                title: "",
                              })
                            }
                            className={`${darkMode ? "border-slate-600 text-slate-200 bg-slate-900 hover:bg-slate-800" : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"} px-5 py-2.5 rounded-xl border font-medium transition`}
                          >
                            Bekor qilish
                          </button>

                          <button
                            disabled={lessonSaving}
                            onClick={addLesson}
                            className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-[0_12px_30px_rgba(16,185,129,0.28)] disabled:opacity-60 transition"
                          >
                            {lessonSaving ? "Saqlanmoqda..." : "E'lon qilish"}
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <div className={`${darkMode ? "bg-emerald-500/10 border-emerald-500/25" : "bg-emerald-50 border-emerald-200"} border rounded-3xl p-4`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${theme.soft}`}>
                            Dars vaqti
                          </p>
                          <p className={`mt-2 text-2xl font-black ${theme.text}`}>
                            {groupData.lessonTime || groupData.time || "-"}
                          </p>
                          <p className={`mt-1 text-xs ${theme.soft}`}>{groupDays.join(", ") || "Kunlar yo'q"}</p>
                        </div>

                        <div className={`${darkMode ? "bg-violet-500/10 border-violet-500/25" : "bg-violet-50 border-violet-200"} border rounded-3xl p-4`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${theme.soft}`}>
                            Guruh holati
                          </p>
                          <p className={`mt-2 text-2xl font-black ${theme.text}`}>{groupData.status || "ACTIVE"}</p>
                          <p className={`mt-1 text-xs ${theme.soft}`}>
                            {students.length} talaba, {teachers.length} o'qituvchi
                          </p>
                        </div>

                        <div className={`${darkMode ? "bg-cyan-500/10 border-cyan-500/25" : "bg-cyan-50 border-cyan-200"} border rounded-3xl p-4 sm:col-span-2 lg:col-span-1`}>
                          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${theme.soft}`}>
                            Quick insight
                          </p>
                          <p className={`mt-2 text-sm font-semibold ${theme.text}`}>
                            Mavzu kiritilgach E'lon qilish tugmasi bilan dars jadvalga darhol qo'shiladi.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeMainTab === "akademik-davomat" && (
                <div
                  className={`${theme.card} border rounded-xl shadow-sm min-w-0 min-h-0 flex flex-col overflow-hidden`}
                >
                  <div
                    className={`shrink-0 px-2.5 sm:px-3 py-2 flex items-center justify-between gap-2 border-b min-w-0 ${innerBorderClass}`}
                  >
                    <div className="min-w-0">
                      <h3
                        className={`text-[11px] sm:text-xs font-bold ${theme.text}`}
                      >
                        Akademik davomat
                      </h3>
                      <p className={`mt-0.5 text-[9px] ${theme.soft}`}>
                        Har bir dars uchun qatnashuvni switch orqali belgilang
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-[8px] font-semibold ${theme.chip}`}
                      >
                        {students.length} talaba
                      </span>
                      <span
                        className={`rounded-full border px-1.5 py-0.5 text-[8px] font-semibold ${theme.chip}`}
                      >
                        {dateHeaders.length} dars
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden">
                    <div className="hidden lg:block h-full overflow-auto">
                      <table className="w-full text-sm table-fixed border-separate border-spacing-0">
                        <thead
                          className={`${darkMode ? "bg-slate-900/95" : "bg-white/95"} sticky top-0 z-10 backdrop-blur-xl`}
                        >
                          <tr>
                            <th
                              className={`text-left px-2 py-2 w-48 ${theme.text}`}
                            >
                              <span className="text-[11px] font-semibold">Talaba</span>
                            </th>

                            {dateHeaders.map((item) => (
                              <th
                                key={item.key}
                                className={`px-0.5 py-2 text-center ${theme.text}`}
                              >
                                <div
                                  className={`mx-auto inline-flex flex-col items-center gap-0.5 rounded-lg border px-1.5 py-0.5 min-w-10 ${theme.chip}`}
                                >
                                  <div className="text-[7px] uppercase tracking-wide opacity-80">
                                    {item.day}
                                  </div>
                                  <div className="text-[10px] font-black leading-none">
                                    {item.num}
                                  </div>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {students.map((student) => (
                            <tr
                              key={student.id}
                              className={`border-t ${theme.rowBorder} ${
                                darkMode
                                  ? "hover:bg-slate-800/35"
                                  : "hover:bg-violet-50/60"
                              }`}
                            >
                              <td className="px-2 py-1.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm ${
                                      darkMode
                                        ? "bg-slate-800 text-slate-200"
                                        : "bg-violet-100 text-violet-700"
                                    }`}
                                  >
                                    {getInitial(student.name)}
                                  </div>

                                  <div className="min-w-0">
                                    <p
                                      className={`text-[12px] font-semibold truncate ${theme.text}`}
                                    >
                                      {student.name}
                                    </p>
                                    <p className={`text-[9px] ${theme.soft}`}>
                                      {student.phone || "Faol"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {dateHeaders.map((item) => {
                                const key = item.key;
                                const value =
                                  attendance[student.id]?.[key] || "";
                                const savingKey = `${student.id}-${item.lessonId}`;
                                const isSaving =
                                  !!attendanceSavingMap[savingKey];
                                const isBor = value === "Bor";
                                const isYoq = value === "Yo'q";
                                const isOn = isBor;

                                return (
                                  <td
                                    key={key}
                                    className="px-0.5 py-1.5 text-center align-middle"
                                  >
                                    <button
                                      type="button"
                                      disabled={isSaving || !item.lessonId}
                                      onClick={() =>
                                        setAttendanceValue(
                                          student.id,
                                          item,
                                          isOn ? "Yo'q" : "Bor",
                                        )
                                      }
                                      className={`relative inline-flex h-6 w-12 items-center rounded-full border p-0.5 transition disabled:opacity-60 ${
                                        isOn
                                          ? "border-emerald-500 bg-emerald-500"
                                          : darkMode
                                          ? "border-slate-700 bg-slate-800"
                                          : "border-slate-300 bg-slate-100"
                                      }`}
                                      aria-pressed={isOn}
                                      aria-label={`${student.name} ${item.day} ${item.num}`}
                                    >
                                      <span
                                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[8px] font-black shadow-md transition-transform duration-200 ${
                                          isOn ? "translate-x-5" : "translate-x-0"
                                        }`}
                                      >
                                        {isOn ? "✓" : ""}
                                      </span>
                                    </button>

                                    <div
                                      className={`mt-0.5 text-[8px] font-medium ${
                                        isOn
                                          ? "text-emerald-500"
                                          : darkMode
                                          ? "text-slate-500"
                                          : "text-slate-400"
                                      }`}
                                    >
                                      {isOn ? "Bor" : "Yo'q"}
                                    </div>

                                    {isSaving && (
                                      <div
                                        className={`mt-0.5 text-[8px] ${theme.soft}`}
                                      >
                                        Saqlanmoqda...
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-2.5 lg:hidden h-full overflow-y-auto">
                      {students.map((student) => (
                        <div
                          key={student.id}
                          className={`rounded-xl border p-2 shadow-sm ${innerBorderClass}`}
                        >
                          <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 shadow-sm ${
                                  darkMode
                                    ? "bg-slate-800 text-slate-200"
                                    : "bg-violet-100 text-violet-700"
                                }`}
                              >
                                {getInitial(student.name)}
                              </div>

                              <div className="min-w-0">
                                <p
                                  className={`text-[12px] font-semibold truncate ${theme.text}`}
                                >
                                  {student.name}
                                </p>
                                <p className={`text-[9px] truncate ${theme.soft}`}>
                                  {student.phone || "Faol"}
                                </p>
                              </div>
                            </div>

                            <span
                              className={`rounded-full border px-1.5 py-0.5 text-[7px] font-semibold ${theme.chip}`}
                            >
                              Davomat
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                            {dateHeaders.map((item) => {
                              const key = item.key;
                              const value = attendance[student.id]?.[key] || "";
                              const savingKey = `${student.id}-${item.lessonId}`;
                              const isSaving = !!attendanceSavingMap[savingKey];
                              const isBor = value === "Bor";
                              const isOn = isBor;

                              return (
                                <button
                                  key={key}
                                  type="button"
                                  disabled={isSaving || !item.lessonId}
                                  onClick={() =>
                                    setAttendanceValue(
                                      student.id,
                                      item,
                                      isOn ? "Yo'q" : "Bor",
                                    )
                                  }
                                  className={`rounded-lg border p-1.5 text-left transition disabled:opacity-60 ${
                                    darkMode
                                      ? "border-slate-700 bg-slate-950/70"
                                      : "border-slate-200 bg-white"
                                  }`}
                                >
                                  <div className={`text-[7px] uppercase tracking-wide ${theme.soft}`}>
                                    {item.day}
                                  </div>
                                  <div className={`text-[10px] font-black ${theme.text}`}>
                                    {item.num}
                                  </div>

                                  <div
                                    className={`mt-1 relative inline-flex h-4.5 w-9 items-center rounded-full border p-0.5 transition ${
                                      isOn
                                        ? "border-emerald-500 bg-emerald-500"
                                        : darkMode
                                        ? "border-slate-700 bg-slate-800"
                                        : "border-slate-300 bg-slate-100"
                                    }`}
                                  >
                                    <span
                                      className={`inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[7px] font-black shadow-md transition-transform duration-200 ${
                                        isOn ? "translate-x-4" : "translate-x-0"
                                      }`}
                                    >
                                      {isOn ? "✓" : ""}
                                    </span>
                                  </div>

                                  <div
                                    className={`mt-0.5 text-[8px] font-medium ${
                                      isOn
                                        ? "text-emerald-500"
                                        : darkMode
                                        ? "text-slate-500"
                                        : "text-slate-400"
                                    }`}
                                  >
                                    {isOn ? "Bor" : "Yo'q"}
                                  </div>

                                  {isSaving && (
                                    <div className={`mt-0.5 text-[8px] ${theme.soft}`}>
                                      Saqlanmoqda...
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeMainTab === "guruh-darsliklari" && lessonPage === "list" && (
            <div
              className={`${theme.card} border rounded-2xl shadow-sm flex-1 min-h-0 overflow-hidden`}
            >
              <div
                className={`px-4 py-3 border-b ${innerBorderClass} flex items-center justify-between gap-3 flex-wrap`}
              >
                <div className="flex items-center gap-3 overflow-x-auto">
                  <button
                    onClick={() => setActiveLessonTab("darsliklar")}
                    className={subTabClass(activeLessonTab === "darsliklar")}
                  >
                    Darsliklar
                  </button>

                  <button
                    onClick={() => setActiveLessonTab("uyga-vazifa")}
                    className={subTabClass(activeLessonTab === "uyga-vazifa")}
                  >
                    Uyga vazifa
                  </button>

                  <button
                    onClick={() => setActiveLessonTab("videolar")}
                    className={subTabClass(activeLessonTab === "videolar")}
                  >
                    Videolar
                  </button>
                </div>

                {activeLessonTab === "darsliklar" ? (
                  <button
                    onClick={() => setActiveMainTab("malumotlar")}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
                  >
                    Darslik qo‘shish
                  </button>
                ) : activeLessonTab === "uyga-vazifa" ? (
                  <button
                    onClick={() => setLessonPage("create-homework")}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
                  >
                    Uyga vazifa qo‘shish
                  </button>
                ) : (
                  <button
                    onClick={() => setShowVideoUploadModal(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
                  >
                    Qo‘shish
                  </button>
                )}
              </div>

              <div className="flex-1 min-h-0 overflow-auto p-4">
                {activeLessonTab === "darsliklar" && (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead
                        className={darkMode ? "bg-slate-800" : "bg-slate-50"}
                      >
                        <tr className={`border-b ${innerBorderClass}`}>
                          <th
                            className={`text-left px-3 py-3 w-16 ${theme.text}`}
                          >
                            #
                          </th>
                          <th className={`text-left px-3 py-3 ${theme.text}`}>
                            Darslik mavzusi
                          </th>
                          <th
                            className={`text-left px-3 py-3 w-52 ${theme.text}`}
                          >
                            Yaratilgan sana
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {lessons.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className={`px-3 py-10 text-center ${theme.soft}`}
                            >
                              Darsliklar hozircha yo‘q
                            </td>
                          </tr>
                        )}

                        {lessons.map((lesson, index) => (
                          <tr
                            key={lesson.id}
                            className={`border-b ${theme.rowBorder} ${
                              darkMode
                                ? "hover:bg-slate-800/40"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {index + 1}
                            </td>
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {lesson.title || "-"}
                            </td>
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {formatPrettyDateTime(lesson.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeLessonTab === "uyga-vazifa" && (
                  <div className="space-y-3">
                    <div
                      className={`flex flex-wrap items-center gap-2 rounded-2xl border px-3 py-2 text-xs sm:text-sm ${
                        darkMode
                          ? "border-slate-700 bg-slate-900"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className={darkMode ? "text-slate-300" : "text-slate-600"}>
                        Uyga vazifalar soni:
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 font-semibold ${
                          darkMode
                            ? "bg-violet-500/20 text-violet-200"
                            : "bg-violet-100 text-violet-700"
                        }`}
                      >
                        {homeworks.length} ta
                      </span>
                      <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
                        Talabalar soni, topshirilgan va tekshirilgan qiymatlar jadvalda berilgan.
                      </span>
                    </div>

                    <div
                      className="overflow-x-auto overflow-y-auto max-h-[65vh] pr-1"
                      style={{ scrollbarGutter: "stable" }}
                    >
                      <table className="w-full min-w-245 text-sm">
                      <thead
                        className={
                          darkMode
                            ? "bg-linear-to-r from-slate-800 to-slate-900"
                            : "bg-linear-to-r from-slate-50 to-slate-100"
                        }
                      >
                        <tr className={`border-b ${innerBorderClass}`}>
                          <th
                            className={`text-left px-3 py-3 w-12.5 ${theme.text}`}
                          >
                            #
                          </th>
                          <th className={`text-left px-3 py-3 ${theme.text}`}>
                            Mavzu
                          </th>
                          <th
                            className={`text-center px-3 py-3 w-22.5 ${theme.text}`}
                          >
                            👤
                          </th>
                          <th
                            className={`text-center px-3 py-3 w-22.5 ${theme.text}`}
                          >
                            🟡
                          </th>
                          <th
                            className={`text-center px-3 py-3 w-22.5 ${theme.text}`}
                          >
                            🟢
                          </th>
                          <th
                            className={`text-left px-3 py-3 w-45 ${theme.text}`}
                          >
                            Berilgan vaqt
                          </th>
                          <th
                            className={`text-left px-3 py-3 w-45 ${theme.text}`}
                          >
                            Tugash vaqti
                          </th>
                          <th
                            className={`text-left px-3 py-3 w-37.5 ${theme.text}`}
                          >
                            Dars sanasi
                          </th>
                          <th
                            className={`text-center px-3 py-3 w-22.5 ${theme.text}`}
                          >
                            Amal
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {homeworksLoading && (
                          <tr>
                            <td
                              colSpan={9}
                              className={`px-3 py-8 text-center ${theme.soft}`}
                            >
                              Uyga vazifalar yuklanmoqda...
                            </td>
                          </tr>
                        )}

                        {homeworks.map((item, index) => (
                          <tr
                            key={item.id}
                            onClick={() => openHomeworkDetail(item)}
                            className={`border-b ${theme.rowBorder} ${
                              darkMode
                                ? "hover:bg-slate-800/50 cursor-pointer"
                                : "hover:bg-emerald-50/50 cursor-pointer"
                            }`}
                          >
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {index + 1}
                            </td>
                            <td className="px-3 py-3">
                              <button
                                onClick={() => openHomeworkDetail(item)}
                                className={`w-full text-left rounded-md px-3 py-2 text-sm ${
                                  index < 3
                                    ? "bg-linear-to-r from-orange-500 to-rose-500 text-white"
                                    : darkMode
                                      ? "bg-slate-800 text-slate-200"
                                      : "bg-slate-100 text-slate-800"
                                }`}
                              >
                                {item.title}
                              </button>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span
                                className={`inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-bold ${
                                  darkMode
                                    ? "bg-violet-500/20 text-violet-200"
                                    : "bg-violet-100 text-violet-700"
                                }`}
                              >
                                {item.total}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.submitted > 0) {
                                    openHomeworkDetailWithTab(item, "kutayotgan");
                                  }
                                }}
                                className={`inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-bold transition ${
                                  item.submitted > 0
                                    ? darkMode
                                      ? "bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 cursor-pointer"
                                      : "bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer"
                                    : darkMode
                                      ? "bg-amber-500/10 text-amber-300 cursor-default"
                                      : "bg-amber-50 text-amber-600 cursor-default"
                                }`}
                                disabled={item.submitted === 0}
                              >
                                {item.submitted}
                              </button>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (item.checked > 0) {
                                    openHomeworkDetailWithTab(item, "qabul");
                                  }
                                }}
                                className={`inline-flex min-w-8 justify-center rounded-full px-2.5 py-1 text-xs font-bold transition ${
                                  item.checked > 0
                                    ? darkMode
                                      ? "bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 cursor-pointer"
                                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer"
                                    : darkMode
                                      ? "bg-emerald-500/10 text-emerald-300 cursor-default"
                                      : "bg-emerald-50 text-emerald-600 cursor-default"
                                }`}
                                disabled={item.checked === 0}
                              >
                                {item.checked}
                              </button>
                            </td>
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {item.assignedAt}
                            </td>
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {item.deadline}
                            </td>
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {item.lessonDate}
                            </td>
                            <td className="px-3 py-3 text-center">
                              <button
                                disabled={deletingHomeworkId === item.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteHomework(item.id);
                                }}
                                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                                  darkMode
                                    ? "bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
                                    : "bg-rose-100 text-rose-600 hover:bg-rose-200"
                                }`}
                              >
                                {deletingHomeworkId === item.id
                                  ? "O‘chirilmoqda..."
                                  : "O‘chirish"}
                              </button>
                            </td>
                          </tr>
                        ))}

                        {homeworks.length === 0 && (
                          <tr>
                            <td
                              colSpan={9}
                              className={`px-3 py-12 text-center ${theme.soft}`}
                            >
                              Uyga vazifalar hozircha yo‘q
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  </div>
                )}

                {activeLessonTab === "videolar" && (
                  <div
                    className="overflow-x-auto overflow-y-auto max-h-[65vh] pr-1"
                    style={{ scrollbarGutter: "stable" }}
                  >
                    <table className="w-full min-w-275 text-sm">
                      <thead
                        className={darkMode ? "bg-slate-800" : "bg-slate-50"}
                      >
                        <tr className={`border-b ${innerBorderClass}`}>
                          <th className={`text-left px-3 py-3 ${theme.text}`}>
                            Video nomi
                          </th>
                          <th className={`text-left px-3 py-3 ${theme.text}`}>
                            Dars nomi
                          </th>
                          <th className={`text-left px-3 py-3 ${theme.text}`}>
                            Status
                          </th>
                          <th className={`text-left px-3 py-3 ${theme.text}`}>
                            Dars sanasi
                          </th>
                          <th className={`text-left px-3 py-3 ${theme.text}`}>
                            Hajmi
                          </th>
                          <th className={`text-left px-3 py-3 ${theme.text}`}>
                            Qo‘shilgan vaqti
                          </th>
                          <th className={`text-center px-3 py-3 ${theme.text}`}>
                            Harakatlar
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {videosLoading && (
                          <tr>
                            <td
                              colSpan={7}
                              className={`px-3 py-6 text-center ${theme.soft}`}
                            >
                              Videolar yuklanmoqda...
                            </td>
                          </tr>
                        )}

                        {videos.map((video) => (
                          <tr
                            key={video.id}
                            className={`border-b ${theme.rowBorder} cursor-pointer ${
                              darkMode
                                ? "hover:bg-slate-800/40"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            <td className={`px-3 py-3 ${theme.text}`}>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-500">◔</span>
                                {video.file ? (
                                  <a
                                    href={video.file}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline cursor-pointer"
                                  >
                                    {video.name}
                                  </a>
                                ) : (
                                  <span>{video.name}</span>
                                )}
                              </div>
                            </td>
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {video.lessonName}
                            </td>
                            <td className="px-3 py-3">
                              <span className="px-2 py-1 rounded-full text-[11px] bg-emerald-100 text-emerald-700">
                                {video.status}
                              </span>
                            </td>
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {video.lessonDate}
                            </td>
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {video.size}
                            </td>
                            <td className={`px-3 py-3 ${theme.text}`}>
                              {video.uploadedAt}
                            </td>
                            <td
                              className={`px-3 py-3 text-center ${theme.soft}`}
                            >
                              -
                            </td>
                          </tr>
                        ))}

                        {videos.length === 0 && (
                          <tr>
                            <td
                              colSpan={7}
                              className={`px-3 py-10 text-center ${theme.soft}`}
                            >
                              Videolar hozircha yo‘q
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeMainTab === "guruh-darsliklari" &&
            lessonPage === "create-homework" && (
              <div
                className={`${theme.card} border rounded-2xl shadow-sm flex-1 min-h-0 overflow-auto p-4 sm:p-6`}
              >
                <div className="max-w-4xl mx-auto">
                  <button
                    onClick={() => setLessonPage("list")}
                    className={`mb-6 ${theme.soft} hover:opacity-80 text-sm`}
                  >
                    ← Orqaga
                  </button>

                  <div className={`overflow-hidden rounded-3xl border ${darkMode ? "border-slate-700" : "border-slate-200"}`}>
                    <div className={`px-5 py-4 sm:px-6 ${darkMode ? "bg-linear-to-r from-slate-900 via-slate-800 to-slate-900" : "bg-linear-to-r from-cyan-50 via-emerald-50 to-sky-50"}`}>
                      <h2 className={`text-2xl font-black ${theme.text}`}>
                        Yangi uyga vazifa yaratish
                      </h2>
                      <p className={`mt-1 text-sm ${theme.soft}`}>
                        Mavzuni tanlang, muddatni belgilang va kerak bo'lsa fayl biriktiring.
                      </p>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${theme.text}`}
                          >
                            * Dars
                          </label>
                          <select
                            className={inputClass}
                            value={homeworkForm.lessonId}
                            onChange={(e) =>
                              setHomeworkForm({
                                ...homeworkForm,
                                lessonId: e.target.value,
                                title:
                                  lessons.find(
                                    (lesson) =>
                                      Number(lesson.id) === Number(e.target.value),
                                  )?.title || homeworkForm.title,
                              })
                            }
                          >
                            <option value="">Darslardan birini tanlang</option>
                            {lessons.map((lesson) => (
                              <option key={lesson.id} value={lesson.id}>
                                {lesson.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            className={`block text-sm font-medium mb-2 ${theme.text}`}
                          >
                            Tugash muddati (soat)
                          </label>
                          <input
                            type="number"
                            min="1"
                            className={inputClass}
                            value={homeworkForm.durationTime}
                            onChange={(e) =>
                              setHomeworkForm({
                                ...homeworkForm,
                                durationTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          * Sarlavha
                        </label>
                        <input
                          className={inputClass}
                          placeholder="Uyga vazifa sarlavhasi"
                          value={homeworkForm.title}
                          onChange={(e) =>
                            setHomeworkForm({
                              ...homeworkForm,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label
                          className={`mb-2 block text-sm font-medium ${theme.text}`}
                        >
                          Qo'shimcha fayl (ixtiyoriy)
                        </label>
                        <div
                          onClick={() => homeworkFileRef.current?.click()}
                          className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-5 transition ${
                            darkMode
                              ? "border-cyan-500/35 bg-slate-900/60 hover:bg-slate-800/70"
                              : "border-cyan-300 bg-cyan-50/40 hover:bg-cyan-50/70"
                          }`}
                        >
                          <p className={`text-sm font-semibold ${theme.text}`}>
                            Faylni biriktirish uchun shu joyni bosing
                          </p>
                          <p className={`mt-1 text-xs ${theme.soft}`}>
                            Qo'llab-quvvatlanadi: PDF, DOC, DOCX, ZIP, JPG, PNG
                          </p>

                          {homeworkForm.file && (
                            <div className={`mt-3 rounded-xl border px-3 py-2 ${darkMode ? "border-cyan-500/30 bg-cyan-500/10" : "border-cyan-200 bg-white/90"}`}>
                              <p className={`truncate text-sm font-semibold ${theme.text}`}>
                                {homeworkForm.file.name}
                              </p>
                              <p className={`mt-1 text-xs ${theme.soft}`}>
                                {formatFileSize(homeworkForm.file.size)}
                              </p>
                            </div>
                          )}
                        </div>

                        <input
                          ref={homeworkFileRef}
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png,.txt"
                          onChange={(e) => {
                            const selected = e.target.files?.[0] || null;
                            setHomeworkForm((prev) => ({
                              ...prev,
                              file: selected,
                            }));
                          }}
                        />

                        {homeworkForm.file && (
                          <button
                            type="button"
                            onClick={() => {
                              setHomeworkForm((prev) => ({ ...prev, file: null }));
                              if (homeworkFileRef.current) {
                                homeworkFileRef.current.value = "";
                              }
                            }}
                            className={`mt-2 text-xs font-semibold ${darkMode ? "text-rose-300 hover:text-rose-200" : "text-rose-600 hover:text-rose-700"}`}
                          >
                            Biriktirilgan faylni olib tashlash
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => setLessonPage("list")}
                          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-slate-600 hover:bg-slate-50"
                        >
                          Bekor qilish
                        </button>

                        <button
                          disabled={homeworkSaving}
                          onClick={addHomework}
                          className="rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-white shadow-[0_12px_26px_rgba(16,185,129,0.26)] transition hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-60"
                        >
                          {homeworkSaving ? "Saqlanmoqda..." : "E'lon qilish"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {showEditModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div
                className={`${theme.card} w-full max-w-xl rounded-2xl border p-4 shadow-xl`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>
                  Guruhni tahrirlash
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    className={inputClass}
                    placeholder="Guruh nomi"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                  />
                  <input
                    className={inputClass}
                    placeholder="Kurs nomi"
                    value={editForm.course}
                    onChange={(e) =>
                      setEditForm({ ...editForm, course: e.target.value })
                    }
                  />
                  <input
                    className={inputClass}
                    placeholder="Narxi"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({ ...editForm, price: e.target.value })
                    }
                  />
                  <input
                    className={inputClass}
                    placeholder="Vaqti"
                    value={editForm.time}
                    onChange={(e) =>
                      setEditForm({ ...editForm, time: e.target.value })
                    }
                  />
                  <input
                    className={inputClass}
                    placeholder="Davomiyligi"
                    value={editForm.duration}
                    onChange={(e) =>
                      setEditForm({ ...editForm, duration: e.target.value })
                    }
                  />
                  <input
                    className={inputClass}
                    placeholder="Xona"
                    value={editForm.room}
                    onChange={(e) =>
                      setEditForm({ ...editForm, room: e.target.value })
                    }
                  />
                </div>

                <div className="mt-3">
                  <input
                    className={inputClass}
                    placeholder="Kunlar (vergul bilan)"
                    value={editForm.days}
                    onChange={(e) =>
                      setEditForm({ ...editForm, days: e.target.value })
                    }
                  />
                </div>

                <div className="mt-3">
                  <select
                    className={inputClass}
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="FREEZE">FREEZE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className={actionBtnClass}
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={saveGroupEdit}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            </div>
          )}

          {showTeacherModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div
                className={`${theme.card} w-full max-w-md rounded-2xl border p-4 shadow-xl`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>
                  O‘qituvchi qo‘shish
                </h3>

                <div className="space-y-3">
                  <select
                    className={inputClass}
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    disabled={teacherOptionsLoading || teacherAssigning}
                  >
                    <option value="">
                      {teacherOptionsLoading
                        ? "O‘qituvchilar yuklanmoqda..."
                        : "O‘qituvchini tanlang"}
                    </option>
                    {teacherOptions.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowTeacherModal(false)}
                    className={actionBtnClass}
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={addTeacher}
                    disabled={teacherAssigning || teacherOptionsLoading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60"
                  >
                    {teacherAssigning ? "Biriktirilmoqda..." : "Qo‘shish"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showStudentModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div
                className={`${theme.card} w-full max-w-md rounded-2xl border p-4 shadow-xl`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${theme.text}`}>
                  O‘quvchi qo‘shish
                </h3>

                <div className="space-y-3">
                  <select
                    className={inputClass}
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    disabled={studentOptionsLoading || studentAssigning}
                  >
                    <option value="">
                      {studentOptionsLoading
                        ? "Talabalar yuklanmoqda..."
                        : "Talabani tanlang"}
                    </option>
                    {studentOptions.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.fullName}
                      </option>
                    ))}
                  </select>

                  {!studentOptionsLoading && studentOptions.length === 0 && (
                    <p className={`text-sm ${theme.soft}`}>
                      Qo‘shish uchun bo‘sh talaba topilmadi.
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={() => setShowStudentModal(false)}
                    className={actionBtnClass}
                  >
                    Bekor qilish
                  </button>
                  <button
                    disabled={studentAssigning || studentOptionsLoading}
                    onClick={addStudent}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60"
                  >
                    {studentAssigning ? "Qo‘shilmoqda..." : "Qo‘shish"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showVideoUploadModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/55 backdrop-blur-sm flex items-start justify-center overflow-y-auto pt-6 sm:pt-10 px-4 pb-4">
          <div className={`${theme.card} relative w-full max-w-3xl max-h-[calc(100vh-2.5rem)] overflow-y-auto rounded-3xl border p-5 sm:p-6 shadow-[0_30px_80px_rgba(15,23,42,0.32)]`}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-emerald-500/12 blur-3xl" />
              <div className="absolute -bottom-14 left-8 h-44 w-44 rounded-full bg-cyan-500/12 blur-3xl" />
            </div>

            <button
              onClick={() => setShowVideoUploadModal(false)}
              className={`absolute right-4 top-4 z-10 h-10 w-10 rounded-2xl border text-2xl leading-none transition ${darkMode ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-500 hover:bg-slate-100"}`}
            >
              ×
            </button>

            <div className="relative mb-5 pr-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-500">Media manager</p>
              <h3 className={`mt-1 text-2xl font-black ${theme.text}`}>Videodars yuklash</h3>
              <p className={`mt-1 text-sm ${theme.soft}`}>
                Darsni tanlang, videoni qo'shing va bitta bosish bilan yuklang.
              </p>
            </div>

            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                Darsni tanlang
              </label>
              <select
                value={videoLessonId}
                onChange={(e) => setVideoLessonId(e.target.value)}
                className={`${inputClass} pr-10`}
              >
                <option value="">Darslardan birini tanlang</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!videoLessonId || videoUploading) return;
                setVideoDragActive(true);
              }}
              onDragLeave={() => setVideoDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                if (!videoLessonId || videoUploading) return;
                setVideoDragActive(false);
                handleVideoPick(e.dataTransfer?.files?.[0]);
              }}
              onClick={() => {
                if (!videoLessonId || videoUploading) return;
                fileRef.current?.click();
              }}
              className={`rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition ${
                !videoLessonId
                  ? darkMode
                    ? "border-slate-700 bg-slate-900/60 opacity-80"
                    : "border-slate-200 bg-slate-50/70 opacity-80"
                  : videoDragActive
                  ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
                  : darkMode
                  ? "border-emerald-500/40 bg-slate-900/65 hover:bg-slate-800/70"
                  : "border-emerald-300 bg-emerald-50/35 hover:bg-emerald-50/60"
              }`}
            >
              <div className="text-emerald-500 text-5xl mb-4">🎬</div>
              <p className={`text-base sm:text-lg font-semibold ${theme.text}`}>
                Videofaylni yuklash uchun ushbu hudud ustiga bosing yoki faylni
                shu yerga olib keling
              </p>
              {!videoLessonId && (
                <p className="text-rose-500 text-sm mt-2 font-medium">
                  Avval darsni tanlang
                </p>
              )}
              <p className={`text-sm mt-2 ${theme.soft}`}>
                Videofayl .mp4, .webm, .mpeg, .avi, .mkv, .mov formatlaridan
                birida bo‘lishi kerak
              </p>

              {videoDraftFile && (
                <div className={`mx-auto mt-4 max-w-xl rounded-2xl border px-4 py-3 text-left ${darkMode ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-200 bg-white/85"}`}>
                  <p className={`truncate text-sm font-semibold ${theme.text}`}>{videoDraftFile.name}</p>
                  <p className={`mt-1 text-xs ${theme.soft}`}>{formatFileSize(videoDraftFile.size)}</p>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleVideoPick(e.target.files?.[0])}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
              <button
                disabled={!videoDraftFile || !videoLessonId || videoUploading}
                onClick={() => handleVideoUpload(videoDraftFile)}
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-[0_12px_30px_rgba(16,185,129,0.28)] disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {videoUploading ? "Yuklanmoqda..." : "Yuklashni boshlash"}
              </button>

              <button
                disabled={videoUploading}
                onClick={() => setShowVideoUploadModal(false)}
                className={`${darkMode ? "border-slate-600 text-slate-200 bg-slate-900 hover:bg-slate-800" : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"} px-5 py-2.5 rounded-xl border font-medium disabled:opacity-60`}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedHomework && (
        <HomeworkDetailPage
          homework={selectedHomework}
          initialTab={homeworkInitialTab}
          onBack={() => {
            setSelectedHomework(null);
            setOpeningHomeworkTitle("");
            setHomeworkInitialTab("all");
          }}
        />
      )}
    </>
  );
}