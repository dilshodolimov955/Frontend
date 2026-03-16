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

const defaultTeachers = [
  {
    id: 1,
    fullName: "otabek ikromov",
    group: "-",
    phone: "+998333223232",
    birthDate: "2002-02-21",
    createdAt: "2026-02-24",
    createdTime: "16:44",
    addedBy: "Islombek Baxromov",
    coin: 0,
    gender: "Erkak",
    email: "otabek@gmail.com",
    password: "",
    photo: "",
    branch: "AICoder markazi",
    archived: false,
  },
  {
    id: 2,
    fullName: "rashidov akmal",
    group: "Pre IELTS",
    phone: "+998333333333",
    birthDate: "2000-02-12",
    createdAt: "2026-02-24",
    createdTime: "16:36",
    addedBy: "Islombek Baxromov",
    coin: 10,
    gender: "Erkak",
    email: "rashidov@gmail.com",
    password: "",
    photo: "",
    branch: "AICoder markazi",
    archived: false,
  },
  {
    id: 3,
    fullName: "Nurmahmadov Behro'z",
    group: "SAT math 2026",
    phone: "+998200130184",
    birthDate: "2007-09-01",
    createdAt: "2026-02-20",
    createdTime: "11:14",
    addedBy: "Islombek Baxromov",
    coin: 100,
    gender: "Erkak",
    email: "behroz@gmail.com",
    password: "",
    photo: "",
    branch: "AICoder markazi",
    archived: false,
  },
  {
    id: 4,
    fullName: "Maftuna Murodimova",
    group: "SAT math 2026",
    phone: "+998338504455",
    birthDate: "2007-11-17",
    createdAt: "2026-02-20",
    createdTime: "08:24",
    addedBy: "Islombek Baxromov",
    coin: 0,
    gender: "Ayol",
    email: "maftuna@gmail.com",
    password: "",
    photo: "",
    branch: "AICoder markazi",
    archived: false,
  },
];

const formatDate = (value) => {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
};

const getInitials = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
};

export default function TeachersPage({ theme, darkMode }) {
  const [activeBranch, setActiveBranch] = useState("AICoder markazi");
  const [activeTab, setActiveTab] = useState("active");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [search, setSearch] = useState("");

  const [teachers, setTeachers] = useState(() => {
    const saved = localStorage.getItem("crm_teachers");
    return saved ? JSON.parse(saved) : defaultTeachers;
  });

  const [formData, setFormData] = useState({
    phone: "+998",
    email: "",
    fullName: "",
    birthDate: "",
    password: "",
    group: "",
    gender: "Erkak",
    photo: "",
    branch: "AICoder markazi",
  });

  useEffect(() => {
    localStorage.setItem("crm_teachers", JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    if (!showDrawer) {
      setFormData((prev) => ({
        ...prev,
        branch: activeBranch,
      }));
    }
  }, [activeBranch, showDrawer]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesBranch = teacher.branch === activeBranch;
      const matchesArchive =
        activeTab === "active" ? !teacher.archived : teacher.archived;

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        teacher.fullName.toLowerCase().includes(query) ||
        teacher.phone.toLowerCase().includes(query) ||
        teacher.email.toLowerCase().includes(query) ||
        teacher.group.toLowerCase().includes(query);

      return matchesBranch && matchesArchive && matchesSearch;
    });
  }, [teachers, activeBranch, activeTab, search]);

  const resetForm = () => {
    setEditingTeacherId(null);
    setFormData({
      phone: "+998",
      email: "",
      fullName: "",
      birthDate: "",
      password: "",
      group: "",
      gender: "Erkak",
      photo: "",
      branch: activeBranch,
    });
  };

  const openAddDrawer = () => {
    setEditingTeacherId(null);
    setFormData({
      phone: "+998",
      email: "",
      fullName: "",
      birthDate: "",
      password: "",
      group: "",
      gender: "Erkak",
      photo: "",
      branch: activeBranch,
    });
    setShowDrawer(true);
  };

  const openEditDrawer = (teacher) => {
    setEditingTeacherId(teacher.id);
    setFormData({
      phone: teacher.phone,
      email: teacher.email,
      fullName: teacher.fullName,
      birthDate: teacher.birthDate,
      password: teacher.password || "",
      group: teacher.group,
      gender: teacher.gender,
      photo: teacher.photo || "",
      branch: teacher.branch,
    });
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo" && files?.[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: reader.result,
        }));
      };
      reader.readAsDataURL(files[0]);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.fullName.trim() ||
      !formData.birthDate
    ) {
      alert("Majburiy maydonlarni to‘ldiring");
      return;
    }

    if (editingTeacherId !== null) {
      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === editingTeacherId
            ? {
                ...teacher,
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                fullName: formData.fullName.trim(),
                birthDate: formData.birthDate,
                password: formData.password,
                group: formData.group.trim() || "-",
                gender: formData.gender,
                photo: formData.photo,
                branch: formData.branch,
              }
            : teacher
        )
      );
    } else {
      const now = new Date();
      const createdAt = now.toISOString().slice(0, 10);
      const createdTime = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newTeacher = {
        id: Date.now(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate,
        password: formData.password,
        group: formData.group.trim() || "-",
        gender: formData.gender,
        photo: formData.photo,
        branch: formData.branch,
        createdAt,
        createdTime,
        addedBy: "Admin",
        coin: 0,
        archived: false,
      };

      setTeachers((prev) => [newTeacher, ...prev]);
    }

    closeDrawer();
  };

  const handleDelete = (id) => {
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== id));
  };

  const toggleArchive = (id) => {
    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === id
          ? { ...teacher, archived: !teacher.archived }
          : teacher
      )
    );
  };

  const updateCoin = (id, type) => {
    setTeachers((prev) =>
      prev.map((teacher) =>
        teacher.id === id
          ? {
              ...teacher,
              coin:
                type === "plus"
                  ? teacher.coin + 1
                  : Math.max(0, teacher.coin - 1),
            }
          : teacher
      )
    );
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      <div
        className={`${theme.card} border rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm overflow-hidden w-full min-w-0`}
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5 min-w-0">
          <h2 className={`text-xl sm:text-2xl font-bold ${theme.text} min-w-0`}>
            O‘qituvchilar
          </h2>

          <div className="flex flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 w-full xl:w-auto">
            <button
              className={`px-4 py-2.5 rounded-xl border text-sm ${
                darkMode
                  ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Export
            </button>

            <button
              onClick={openAddDrawer}
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 sm:px-5 py-3 rounded-xl font-medium"
            >
              + O‘qituvchi qo‘shish
            </button>

            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 sm:px-5 py-3 rounded-xl font-medium">
              Exceldan yuklash
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                activeTab === "active" ? theme.tabActive : theme.tab
              }`}
            >
              Faol o‘qituvchilar
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

          <input
            type="text"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full lg:w-[260px] rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
          />
        </div>

        <div className="flex flex-wrap gap-2">
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

        <div className="mt-5 hidden lg:block w-full min-w-0">
          <div className="rounded-2xl border overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm table-fixed">
                <thead className={darkMode ? "bg-slate-900/60" : "bg-slate-50"}>
                  <tr className={theme.soft}>
                    <th className="text-left font-medium px-3 py-4 w-[50px]">#</th>
                    <th className="text-left font-medium px-3 py-4 w-[200px]">Nomi</th>
                    <th className="text-left font-medium px-3 py-4 w-[150px]">Guruh</th>
                    <th className="text-left font-medium px-3 py-4 w-[130px]">Telefon</th>
                    <th className="text-left font-medium px-3 py-4 w-[120px]">
                      Tug‘ilgan sana
                    </th>
                    <th className="text-left font-medium px-3 py-4 w-[130px]">
                      Yaratilgan sana
                    </th>
                    <th className="text-left font-medium px-3 py-4 w-[130px]">
                      Kim qo‘shgan
                    </th>
                    <th className="text-left font-medium px-3 py-4 w-[110px]">Coin</th>
                    <th className="text-right font-medium px-3 py-4 w-[130px]">Amallar</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTeachers.length > 0 ? (
                    filteredTeachers.map((teacher, index) => (
                      <tr
                        key={teacher.id}
                        className={`border-t transition ${
                          darkMode
                            ? "border-slate-800 hover:bg-slate-900/40"
                            : "border-slate-100 hover:bg-slate-50/70"
                        }`}
                      >
                        <td className={`px-3 py-4 ${theme.text}`}>{index + 1}</td>

                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            {teacher.photo ? (
                              <img
                                src={teacher.photo}
                                alt={teacher.fullName}
                                className="w-10 h-10 rounded-full object-cover border shrink-0"
                              />
                            ) : (
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  darkMode
                                    ? "bg-slate-800 text-slate-200"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {getInitials(teacher.fullName)}
                              </div>
                            )}

                            <p
                              className={`font-medium truncate min-w-0 ${theme.text}`}
                              title={teacher.fullName}
                            >
                              {teacher.fullName}
                            </p>
                          </div>
                        </td>

                        <td className={`px-3 py-4 ${theme.text}`}>
                          <div className="truncate" title={teacher.group}>
                            {teacher.group}
                          </div>
                        </td>

                        <td className={`px-3 py-4 ${theme.text} truncate`}>
                          {teacher.phone}
                        </td>

                        <td className={`px-3 py-4 ${theme.text}`}>
                          {formatDate(teacher.birthDate)}
                        </td>

                        <td className={`px-3 py-4 ${theme.text}`}>
                          <div>{formatDate(teacher.createdAt)}</div>
                          <div className={`text-xs mt-1 ${theme.soft}`}>
                            {teacher.createdTime}
                          </div>
                        </td>

                        <td className={`px-3 py-4 ${theme.text} truncate`}>
                          {teacher.addedBy}
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>🪙</span>
                            <span className={theme.text}>{teacher.coin}</span>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateCoin(teacher.id, "minus")}
                                className={`w-7 h-7 rounded-lg border text-xs ${
                                  darkMode
                                    ? "border-slate-700 hover:bg-slate-800"
                                    : "border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                -
                              </button>
                              <button
                                onClick={() => updateCoin(teacher.id, "plus")}
                                className={`w-7 h-7 rounded-lg border text-xs ${
                                  darkMode
                                    ? "border-slate-700 hover:bg-slate-800"
                                    : "border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => toggleArchive(teacher.id)}
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                                darkMode
                                  ? "border-slate-700 hover:bg-slate-800"
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                              title="Arxiv"
                            >
                              📦
                            </button>

                            <button
                              onClick={() => handleDelete(teacher.id)}
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                                darkMode
                                  ? "border-slate-700 hover:bg-red-900/30"
                                  : "border-slate-200 hover:bg-red-50"
                              }`}
                              title="O‘chirish"
                            >
                              🗑️
                            </button>

                            <button
                              onClick={() => openEditDrawer(teacher)}
                              className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                                darkMode
                                  ? "border-slate-700 hover:bg-slate-800"
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                              title="Tahrirlash"
                            >
                              ✏️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className={`text-center py-10 ${theme.soft}`}>
                        Ma’lumot topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
          {filteredTeachers.length > 0 ? (
            filteredTeachers.map((teacher, index) => (
              <div
                key={teacher.id}
                className={`rounded-2xl border p-4 ${
                  darkMode
                    ? "border-slate-800 bg-slate-900/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  {teacher.photo ? (
                    <img
                      src={teacher.photo}
                      alt={teacher.fullName}
                      className="w-12 h-12 rounded-full object-cover border shrink-0"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        darkMode
                          ? "bg-slate-800 text-slate-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {getInitials(teacher.fullName)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-semibold truncate ${theme.text}`}>
                        {index + 1}. {teacher.fullName}
                      </h3>
                    </div>
                    <p className={`text-sm mt-1 truncate ${theme.soft}`}>
                      {teacher.group}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm min-w-0">
                  <div className={`break-words ${theme.text}`}>
                    <span className="font-medium">Telefon:</span> {teacher.phone}
                  </div>
                  <div className={`break-words ${theme.text}`}>
                    <span className="font-medium">Email:</span> {teacher.email}
                  </div>
                  <div className={theme.text}>
                    <span className="font-medium">Tug‘ilgan sana:</span>{" "}
                    {formatDate(teacher.birthDate)}
                  </div>
                  <div className={theme.text}>
                    <span className="font-medium">Yaratilgan sana:</span>{" "}
                    {formatDate(teacher.createdAt)} {teacher.createdTime}
                  </div>
                  <div className={`break-words ${theme.text}`}>
                    <span className="font-medium">Kim qo‘shgan:</span>{" "}
                    {teacher.addedBy}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span>🪙</span>
                    <span className={theme.text}>{teacher.coin}</span>
                    <div className="flex items-center gap-1 ml-1">
                      <button
                        onClick={() => updateCoin(teacher.id, "minus")}
                        className={`w-7 h-7 rounded-lg border text-xs ${
                          darkMode
                            ? "border-slate-700 hover:bg-slate-800"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateCoin(teacher.id, "plus")}
                        className={`w-7 h-7 rounded-lg border text-xs ${
                          darkMode
                            ? "border-slate-700 hover:bg-slate-800"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleArchive(teacher.id)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                        darkMode
                          ? "border-slate-700 hover:bg-slate-800"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                      title="Arxiv"
                    >
                      📦
                    </button>

                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                        darkMode
                          ? "border-slate-700 hover:bg-red-900/30"
                          : "border-slate-200 hover:bg-red-50"
                      }`}
                      title="O‘chirish"
                    >
                      🗑️
                    </button>

                    <button
                      onClick={() => openEditDrawer(teacher)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                        darkMode
                          ? "border-slate-700 hover:bg-slate-800"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                      title="Tahrirlash"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className={`col-span-full text-center py-10 rounded-2xl border ${
                darkMode ? "border-slate-800" : "border-slate-200"
              } ${theme.soft}`}
            >
              Ma’lumot topilmadi
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
                  {editingTeacherId !== null
                    ? "O‘qituvchini tahrirlash"
                    : "O‘qituvchi qo‘shish"}
                </h2>
                <p className={`text-sm mt-1 ${theme.soft}`}>
                  Bu yerda siz yangi o‘qituvchi qo‘shishingiz mumkin.
                </p>
              </div>

              <button onClick={closeDrawer} className={`text-xl ${theme.soft}`}>
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Telefon raqam
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+998 __ ___ __ __"
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  O‘qituvchi FIO
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ism Familiya Otasining ismi"
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Tug‘ilgan sana
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Parol
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Parol kiriting"
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Guruhlar
                </label>
                <input
                  type="text"
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  placeholder="Masalan: Pre IELTS"
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
              </div>

              <div>
                <p className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Jinsi
                </p>

                <div className="flex gap-3 flex-wrap">
                  {["Erkak", "Ayol"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, gender: item }))
                      }
                      className={`px-4 py-2 rounded-xl border text-sm ${
                        formData.gender === item
                          ? "bg-violet-600 text-white border-violet-600"
                          : darkMode
                          ? "border-slate-700 text-slate-300"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Filial
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                >
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Surati
                </label>

                <label
                  className={`flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center cursor-pointer ${
                    darkMode
                      ? "border-slate-700 hover:bg-slate-800/70"
                      : "border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />

                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover mb-3"
                    />
                  ) : (
                    <div className={`text-3xl mb-3 ${theme.soft}`}>⬆️</div>
                  )}

                  <p className={`text-sm font-medium ${theme.text}`}>
                    Click to upload yoki yuklang
                  </p>
                  <p className={`text-xs mt-1 ${theme.soft}`}>JPG yoki PNG</p>
                </label>
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