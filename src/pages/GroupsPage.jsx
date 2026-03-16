import { useEffect, useMemo, useState } from "react";

const branches = [
  "AICoder markazi",
  "Fizika va Matematika",
  "4-maktab",
  "Niner markazi",
  "SAT,IELTS,AP,CONSULTING centre",
  "IELTS full mock centre",
  "IELTS full mock",
  "IELTS full mock_centre_1",
  "IELTS,SAT,CONSULTING_n1",
  "No name",
  "Debate center",
  "Academia",
  "Arxiv",
];

const courses = [
  "IELTS",
  "SAT",
  "math",
  "Frontend",
  "Backend",
  "SMM",
  "Foundation",
];

const rooms = [
  "1A",
  "2-xona",
  "205-xona",
  "Impact room",
  "IELTS with Islombek",
  "99",
];

const teachersList = [
  "Islombek Baxromov",
  "Nurmahmadov Behro'z",
  "Azimova Mavjuda",
  "Jinibijoev",
];

const studentsList = [
  "Abduvohidova Fotima",
  "Abduvohidova Zuhra",
  "Anvarova Madina",
  "Aziza Abdullayeva",
  "Bekmirzayev Bekruz",
  "Elif Shavkatova",
  "Elyor To'ychiyev",
  "Farangiz Baratboyeva",
];

const defaultGroups = [
  {
    id: 1,
    name: "SMM",
    course: "math",
    duration: "120 minut",
    lessonTime: "09:00",
    addedBy: "Islombek Baxromov",
    room: "1A",
    teacher: "Islombek Baxromov",
    startDate: "2026-02-28",
    endDate: "2026-05-28",
    days: ["Dushanba", "Seshanba", "Payshanba", "Shanba"],
    status: "ACTIVE",
    branch: "AICoder markazi",
    archived: false,
    students: [
      "Abduvohidova Fotima",
      "Abduvohidova Zuhra",
      "Aziza Abdullayeva",
    ],
  },
  {
    id: 2,
    name: "IELTS 8",
    course: "IELTS",
    duration: "90 minut",
    lessonTime: "14:00",
    addedBy: "Islombek Baxromov",
    room: "IELTS with Islombek",
    teacher: "O‘qituvchi",
    startDate: "2026-02-25",
    endDate: "2026-08-20",
    days: ["Dushanba", "Chorshanba", "Juma"],
    status: "ACTIVE",
    branch: "AICoder markazi",
    archived: false,
    students: ["Bekmirzayev Bekruz", "Elif Shavkatova"],
  },
  {
    id: 3,
    name: "Future Leaders",
    course: "math",
    duration: "120 minut",
    lessonTime: "11:30",
    addedBy: "Islombek Baxromov",
    room: "1-xona",
    teacher: "Azimova Mavjuda",
    startDate: "2026-02-19",
    endDate: "2026-05-19",
    days: ["Dushanba", "Chorshanba", "Juma"],
    status: "ACTIVE",
    branch: "AICoder markazi",
    archived: false,
    students: ["Farangiz Baratboyeva", "Elyor To'ychiyev"],
  },
];

const weekDays = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

const formatDate = (value) => {
  if (!value) return "-";
  const [y, m, d] = value.split("-");
  return `${d}.${m}.${y}`;
};

const courseBadge = (course, darkMode) => {
  const base = "inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium";
  const map = {
    IELTS: darkMode
      ? "bg-violet-500/10 text-violet-300"
      : "bg-violet-50 text-violet-500",
    SAT: darkMode
      ? "bg-pink-500/10 text-pink-300"
      : "bg-pink-50 text-pink-500",
    math: darkMode
      ? "bg-fuchsia-500/10 text-fuchsia-300"
      : "bg-fuchsia-50 text-fuchsia-500",
    Frontend: darkMode
      ? "bg-blue-500/10 text-blue-300"
      : "bg-blue-50 text-blue-500",
    Backend: darkMode
      ? "bg-emerald-500/10 text-emerald-300"
      : "bg-emerald-50 text-emerald-500",
    SMM: darkMode
      ? "bg-orange-500/10 text-orange-300"
      : "bg-orange-50 text-orange-500",
    Foundation: darkMode
      ? "bg-slate-500/10 text-slate-300"
      : "bg-slate-100 text-slate-600",
  };

  return `${base} ${
    map[course] ||
    (darkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600")
  }`;
};

export default function GroupsPage({
  theme,
  darkMode,
  onOpenGroupDetails,
}) {
  const [activeBranch, setActiveBranch] = useState("AICoder markazi");
  const [activeTab, setActiveTab] = useState("groups");
  const [search, setSearch] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem("crm_groups");
    return saved ? JSON.parse(saved) : defaultGroups;
  });

  const [formData, setFormData] = useState({
    name: "",
    course: "",
    room: "",
    days: [],
    lessonTime: "09:00",
    startDate: "",
    endDate: "",
    teacher: "",
    students: [],
    duration: "90 minut",
    branch: "AICoder markazi",
  });

  useEffect(() => {
    localStorage.setItem("crm_groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    if (!showDrawer) {
      setFormData((prev) => ({ ...prev, branch: activeBranch }));
    }
  }, [activeBranch, showDrawer]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const matchesBranch = group.branch === activeBranch;
      const matchesTab =
        activeTab === "groups" ? !group.archived : group.archived;
      const q = search.trim().toLowerCase();

      const matchesSearch =
        !q ||
        group.name.toLowerCase().includes(q) ||
        group.course.toLowerCase().includes(q) ||
        group.teacher.toLowerCase().includes(q) ||
        group.room.toLowerCase().includes(q);

      return matchesBranch && matchesTab && matchesSearch;
    });
  }, [groups, activeBranch, activeTab, search]);

  const stats = useMemo(() => {
    const current = groups.filter(
      (g) => g.branch === activeBranch && !g.archived
    );
    const uniqueTeachers = new Set(
      current.map((g) => g.teacher).filter(Boolean)
    );
    const studentCount = current.reduce(
      (sum, g) => sum + (g.students?.length || 0),
      0
    );

    return {
      totalGroups: current.length,
      totalTeachers: uniqueTeachers.size,
      totalStudents: studentCount,
    };
  }, [groups, activeBranch]);

  const resetForm = () => {
    setEditingGroupId(null);
    setFormData({
      name: "",
      course: "",
      room: "",
      days: [],
      lessonTime: "09:00",
      startDate: "",
      endDate: "",
      teacher: "",
      students: [],
      duration: "90 minut",
      branch: activeBranch,
    });
  };

  const openAddDrawer = () => {
    resetForm();
    setShowDrawer(true);
  };

  const openEditDrawer = (group) => {
    setEditingGroupId(group.id);
    setFormData({
      name: group.name,
      course: group.course,
      room: group.room,
      days: group.days || [],
      lessonTime: group.lessonTime,
      startDate: group.startDate,
      endDate: group.endDate,
      teacher: group.teacher,
      students: group.students || [],
      duration: group.duration,
      branch: group.branch,
    });
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const toggleStudent = (student) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.includes(student)
        ? prev.students.filter((s) => s !== student)
        : [...prev.students, student],
    }));
  };

  const handleSave = () => {
    if (
      !formData.name.trim() ||
      !formData.course ||
      !formData.room ||
      !formData.lessonTime ||
      !formData.startDate ||
      !formData.endDate
    ) {
      alert("Majburiy maydonlarni to‘ldiring");
      return;
    }

    if (editingGroupId !== null) {
      setGroups((prev) =>
        prev.map((group) =>
          group.id === editingGroupId
            ? {
                ...group,
                name: formData.name.trim(),
                course: formData.course,
                room: formData.room,
                days: formData.days,
                lessonTime: formData.lessonTime,
                startDate: formData.startDate,
                endDate: formData.endDate,
                teacher: formData.teacher || "-",
                students: formData.students,
                duration: formData.duration,
                branch: formData.branch,
              }
            : group
        )
      );
    } else {
      const newGroup = {
        id: Date.now(),
        name: formData.name.trim(),
        course: formData.course,
        room: formData.room,
        days: formData.days,
        lessonTime: formData.lessonTime,
        startDate: formData.startDate,
        endDate: formData.endDate,
        teacher: formData.teacher || "-",
        students: formData.students,
        duration: formData.duration,
        branch: formData.branch,
        addedBy: "Islombek Baxromov",
        status: "ACTIVE",
        archived: false,
      };

      setGroups((prev) => [newGroup, ...prev]);
    }

    closeDrawer();
  };

  const handleDelete = (id) => {
    setGroups((prev) => prev.filter((group) => group.id !== id));
  };

  const toggleArchive = (id) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === id ? { ...group, archived: !group.archived } : group
      )
    );
  };

  return (
    <div className="space-y-6 w-full min-w-0 overflow-x-hidden">
      <div
        className={`${theme.card} border rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm overflow-hidden w-full min-w-0`}
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5 min-w-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${theme.text}`}>
            Guruhlar
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full sm:w-[220px] rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
            />

            <button
              onClick={openAddDrawer}
              className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-medium shrink-0"
            >
              + Guruh qo‘shish
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => setActiveTab("groups")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              activeTab === "groups" ? theme.tabActive : theme.tab
            }`}
          >
            Guruhlar
          </button>

          <button
            onClick={() => setActiveTab("archive")}
            className={`px-4 py-2 rounded-xl text-sm font-medium border ${
              activeTab === "archive" ? theme.tabActive : theme.tab
            }`}
          >
            Arxiv
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {branches.map((branch) => (
            <button
              key={branch}
              onClick={() => setActiveBranch(branch)}
              className={`max-w-full break-words px-4 py-2 rounded-xl border text-sm transition ${
                activeBranch === branch ? theme.tabActive : theme.tab
              }`}
            >
              {branch}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
          <div className={`${theme.card} border rounded-2xl p-5 shadow-sm`}>
            <p className={`text-sm ${theme.soft}`}>Jami guruhlar</p>
            <h3 className={`text-3xl sm:text-4xl font-bold mt-4 ${theme.text}`}>
              {stats.totalGroups}
            </h3>
          </div>

          <div className={`${theme.card} border rounded-2xl p-5 shadow-sm`}>
            <p className={`text-sm ${theme.soft}`}>O‘qituvchilar</p>
            <h3 className={`text-3xl sm:text-4xl font-bold mt-4 ${theme.text}`}>
              {stats.totalTeachers}
            </h3>
          </div>

          <div
            className={`${theme.card} border rounded-2xl p-5 shadow-sm sm:col-span-2 xl:col-span-1`}
          >
            <p className={`text-sm ${theme.soft}`}>O‘quvchilar</p>
            <h3 className={`text-3xl sm:text-4xl font-bold mt-4 ${theme.text}`}>
              {stats.totalStudents}
            </h3>
          </div>
        </div>

        <div className="hidden lg:block rounded-2xl border overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead className={darkMode ? "bg-slate-900/60" : "bg-slate-50"}>
              <tr className={theme.soft}>
                <th className="text-left font-medium px-3 py-4 w-[120px]">
                  Status
                </th>
                <th className="text-left font-medium px-3 py-4 w-[150px]">
                  Guruh
                </th>
                <th className="text-left font-medium px-3 py-4 w-[110px]">
                  Kurs
                </th>
                <th className="text-left font-medium px-3 py-4 w-[170px]">
                  Davomiyligi
                </th>
                <th className="text-left font-medium px-3 py-4 w-[180px]">
                  Dars vaqti
                </th>
                <th className="text-left font-medium px-3 py-4 w-[150px]">
                  Kim qo‘shgan
                </th>
                <th className="text-left font-medium px-3 py-4 w-[110px]">
                  Xona
                </th>
                <th className="text-left font-medium px-3 py-4 w-[150px]">
                  O‘qituvchi
                </th>
                <th className="text-right font-medium px-3 py-4 w-[170px]">
                  Amallar
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <tr
                    key={group.id}
                    className={`border-t transition ${
                      darkMode
                        ? "border-slate-800 hover:bg-slate-900/40"
                        : "border-slate-100 hover:bg-slate-50/70"
                    }`}
                  >
                    <td className="px-3 py-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-10 h-6 rounded-full bg-violet-500 relative inline-block shrink-0">
                          <span className="absolute top-1 left-5 w-4 h-4 rounded-full bg-white" />
                        </span>
                        <span className="text-emerald-500 text-xs font-semibold">
                          ACTIVE
                        </span>
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <button
                        onClick={() => onOpenGroupDetails?.(group)}
                        className={`font-medium text-left hover:underline truncate block w-full ${theme.text}`}
                        title={group.name}
                      >
                        {group.name}
                      </button>
                    </td>

                    <td className="px-3 py-4">
                      <span className={courseBadge(group.course, darkMode)}>
                        {group.course}
                      </span>
                    </td>

                    <td className={`px-3 py-4 ${theme.text}`}>
                      <div>{group.duration}</div>
                      <div className={`text-xs mt-1 ${theme.soft}`}>
                        {formatDate(group.startDate)} - {formatDate(group.endDate)}
                      </div>
                    </td>

                    <td className={`px-3 py-4 ${theme.text}`}>
                      <div>{group.lessonTime}</div>
                      <div className={`text-xs mt-1 truncate ${theme.soft}`}>
                        {group.days?.join(", ")}
                      </div>
                    </td>

                    <td
                      className={`px-3 py-4 truncate ${theme.text}`}
                      title={group.addedBy}
                    >
                      {group.addedBy}
                    </td>

                    <td
                      className={`px-3 py-4 truncate ${theme.text}`}
                      title={group.room}
                    >
                      {group.room}
                    </td>

                    <td
                      className={`px-3 py-4 truncate ${theme.text}`}
                      title={group.teacher}
                    >
                      {group.teacher}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenGroupDetails?.(group)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                            darkMode
                              ? "border-slate-700 hover:bg-slate-800"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          👁️
                        </button>

                        <button
                          onClick={() => toggleArchive(group.id)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                            darkMode
                              ? "border-slate-700 hover:bg-slate-800"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          📦
                        </button>

                        <button
                          onClick={() => openEditDrawer(group)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                            darkMode
                              ? "border-slate-700 hover:bg-slate-800"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() => handleDelete(group.id)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                            darkMode
                              ? "border-slate-700 hover:bg-red-900/30"
                              : "border-slate-200 hover:bg-red-50"
                          }`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className={`text-center py-10 ${theme.soft}`}>
                    Guruh topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
          {filteredGroups.length > 0 ? (
            filteredGroups.map((group) => (
              <div
                key={group.id}
                className={`rounded-2xl border p-4 ${
                  darkMode
                    ? "border-slate-800 bg-slate-900/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      onClick={() => onOpenGroupDetails?.(group)}
                      className={`font-semibold text-left hover:underline break-words ${theme.text}`}
                    >
                      {group.name}
                    </button>

                    <div className="mt-2">
                      <span className={courseBadge(group.course, darkMode)}>
                        {group.course}
                      </span>
                    </div>
                  </div>

                  <span className="text-emerald-500 text-xs font-semibold shrink-0">
                    ACTIVE
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className={theme.text}>
                    <span className="font-medium">Davomiyligi:</span>{" "}
                    {group.duration}
                  </div>

                  <div className={theme.text}>
                    <span className="font-medium">Sana:</span>{" "}
                    {formatDate(group.startDate)} - {formatDate(group.endDate)}
                  </div>

                  <div className={theme.text}>
                    <span className="font-medium">Dars vaqti:</span>{" "}
                    {group.lessonTime}
                  </div>

                  <div className={`break-words ${theme.text}`}>
                    <span className="font-medium">Kunlari:</span>{" "}
                    {group.days?.join(", ")}
                  </div>

                  <div className={`break-words ${theme.text}`}>
                    <span className="font-medium">Kim qo‘shgan:</span>{" "}
                    {group.addedBy}
                  </div>

                  <div className={`break-words ${theme.text}`}>
                    <span className="font-medium">Xona:</span> {group.room}
                  </div>

                  <div className={`break-words ${theme.text}`}>
                    <span className="font-medium">O‘qituvchi:</span>{" "}
                    {group.teacher}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 flex-wrap">
                  <button
                    onClick={() => onOpenGroupDetails?.(group)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                      darkMode
                        ? "border-slate-700 hover:bg-slate-800"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    👁️
                  </button>

                  <button
                    onClick={() => toggleArchive(group.id)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                      darkMode
                        ? "border-slate-700 hover:bg-slate-800"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    📦
                  </button>

                  <button
                    onClick={() => openEditDrawer(group)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                      darkMode
                        ? "border-slate-700 hover:bg-slate-800"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleDelete(group.id)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                      darkMode
                        ? "border-slate-700 hover:bg-red-900/30"
                        : "border-slate-200 hover:bg-red-50"
                    }`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div
              className={`col-span-full text-center py-10 rounded-2xl border ${
                darkMode ? "border-slate-800" : "border-slate-200"
              } ${theme.soft}`}
            >
              Guruh topilmadi
            </div>
          )}
        </div>
      </div>

      {showDrawer && (
        <div className={`fixed inset-0 z-50 ${theme.overlay}`}>
          <div className="absolute inset-0" onClick={closeDrawer} />

          <div
            className={`absolute inset-y-0 right-0 w-full sm:max-w-[420px] shadow-2xl overflow-y-auto z-10 ${
              darkMode ? "bg-slate-900" : "bg-white"
            }`}
          >
            <div
              className={`p-4 sm:p-6 flex items-start justify-between gap-3 border-b ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <div className="min-w-0">
                <h2 className={`text-lg sm:text-xl font-bold ${theme.text}`}>
                  {editingGroupId !== null
                    ? "Guruhni tahrirlash"
                    : "Guruh qo‘shish"}
                </h2>
                <p className={`text-sm mt-1 ${theme.soft}`}>
                  Yangi guruh yaratish uchun quyidagi ma’lumotlarni kiriting.
                </p>
              </div>

              <button onClick={closeDrawer} className={`text-xl ${theme.soft}`}>
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Guruh nomi
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Frontend 2024"
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Kurs
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${theme.input}`}
                >
                  <option value="">Kursni tanlang</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Xona
                </label>
                <select
                  name="room"
                  value={formData.room}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${theme.input}`}
                >
                  <option value="">Xonani tanlang</option>
                  {rooms.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Dars kunlari
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {weekDays.map((day) => (
                    <label
                      key={day}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer ${
                        darkMode ? "border-slate-700" : "border-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.days.includes(day)}
                        onChange={() => toggleDay(day)}
                      />
                      <span className={`${theme.text} break-words`}>{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Dars vaqti
                </label>
                <input
                  type="time"
                  name="lessonTime"
                  value={formData.lessonTime}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Boshlanish sanasi
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Tugash sanasi
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  O‘qituvchi
                </label>
                <select
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${theme.input}`}
                >
                  <option value="">Tanlang</option>
                  {teachersList.map((teacher) => (
                    <option key={teacher} value={teacher}>
                      {teacher}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Studentlar
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {studentsList.map((student) => (
                    <label
                      key={student}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer ${
                        darkMode ? "border-slate-700" : "border-slate-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.students.includes(student)}
                        onChange={() => toggleStudent(student)}
                      />
                      <span className={`${theme.text} break-words`}>
                        {student}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`p-4 sm:p-6 flex flex-col sm:flex-row justify-end gap-3 border-t ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <button
                onClick={closeDrawer}
                className={`px-5 py-3 rounded-xl border ${
                  darkMode
                    ? "border-slate-700 text-slate-300"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Bekor qilish
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}