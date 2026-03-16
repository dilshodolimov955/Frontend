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

const roles = [
  "DIREKTOR",
  "USTOZ IT",
  "TEST ADMIN",
  "DASTURCHI",
  "BEKORCHI",
  "ADMIN",
  "MANAGER",
];

const defaultEmployees = [
  {
    id: 1,
    fullName: "TEAST",
    role: "USTOZ IT",
    phone: "+998908877121",
    email: "testiv@gmail.com",
    birthDate: "2004-01-01",
    createdAt: "2026-02-23",
    coin: 0,
    branch: "AICoder markazi",
    photo: "",
  },
  {
    id: 2,
    fullName: "SALOM",
    role: "DIREKTOR",
    phone: "998933331234",
    email: "Salom@gmail.com",
    birthDate: "2005-02-20",
    createdAt: "2026-02-23",
    coin: 0,
    branch: "AICoder markazi",
    photo: "",
  },
  {
    id: 3,
    fullName: "BUNYODBEK G'ULOMJONOV",
    role: "DIREKTOR",
    phone: "998939349344",
    email: "gulomjonovbunyodbek61@gmail.com",
    birthDate: "2004-02-20",
    createdAt: "2026-02-25",
    coin: 0,
    branch: "AICoder markazi",
    photo: "",
  },
  {
    id: 4,
    fullName: "DILSHOD ADMIN",
    role: "DIREKTOR",
    phone: "998908899133",
    email: "dilshodadmin@gmail.com",
    birthDate: "2006-01-01",
    createdAt: "2026-02-23",
    coin: 0,
    branch: "AICoder markazi",
    photo: "",
  },
  {
    id: 5,
    fullName: "UMBAROV D",
    role: "USTOZ IT",
    phone: "998904561231",
    email: "dilshodjon13@gmail.com",
    birthDate: "2000-01-01",
    createdAt: "2026-02-23",
    coin: 15,
    branch: "AICoder markazi",
    photo: "",
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

export default function EmployeesPage({ theme, darkMode }) {
  const [activeBranch, setActiveBranch] = useState("AICoder markazi");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [search, setSearch] = useState("");

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem("crm_employees");
    return saved ? JSON.parse(saved) : defaultEmployees;
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "+998",
    birthDate: "",
    password: "",
    role: "",
    branch: "AICoder markazi",
    photo: "",
  });

  useEffect(() => {
    localStorage.setItem("crm_employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    if (!showDrawer) {
      setFormData((prev) => ({
        ...prev,
        branch: activeBranch,
      }));
    }
  }, [activeBranch, showDrawer]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesBranch = employee.branch === activeBranch;
      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        employee.fullName.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.phone.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query);

      return matchesBranch && matchesSearch;
    });
  }, [employees, activeBranch, search]);

  const resetForm = () => {
    setEditingEmployeeId(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "+998",
      birthDate: "",
      password: "",
      role: "",
      branch: activeBranch,
      photo: "",
    });
  };

  const openAddDrawer = () => {
    setEditingEmployeeId(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "+998",
      birthDate: "",
      password: "",
      role: "",
      branch: activeBranch,
      photo: "",
    });
    setShowDrawer(true);
  };

  const openEditDrawer = (employee) => {
    setEditingEmployeeId(employee.id);
    setFormData({
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      birthDate: employee.birthDate,
      password: "",
      role: employee.role,
      branch: employee.branch,
      photo: employee.photo || "",
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
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.birthDate ||
      !formData.role.trim()
    ) {
      alert("Majburiy maydonlarni to‘ldiring");
      return;
    }

    if (editingEmployeeId !== null) {
      setEmployees((prev) =>
        prev.map((employee) =>
          employee.id === editingEmployeeId
            ? {
                ...employee,
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                birthDate: formData.birthDate,
                role: formData.role,
                branch: formData.branch,
                photo: formData.photo,
              }
            : employee
        )
      );
    } else {
      const newEmployee = {
        id: Date.now(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birthDate: formData.birthDate,
        role: formData.role,
        branch: formData.branch,
        photo: formData.photo,
        password: formData.password,
        createdAt: new Date().toISOString().slice(0, 10),
        coin: 0,
      };

      setEmployees((prev) => [newEmployee, ...prev]);
    }

    closeDrawer();
  };

  const handleDelete = (id) => {
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  };

  const roleBadgeClass = (role) => {
    const base = "inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium";
    const map = {
      DIREKTOR: darkMode
        ? "bg-red-500/10 text-red-300"
        : "bg-red-50 text-red-500",
      "USTOZ IT": darkMode
        ? "bg-orange-500/10 text-orange-300"
        : "bg-orange-50 text-orange-500",
      "TEST ADMIN": darkMode
        ? "bg-pink-500/10 text-pink-300"
        : "bg-pink-50 text-pink-500",
      DASTURCHI: darkMode
        ? "bg-blue-500/10 text-blue-300"
        : "bg-blue-50 text-blue-500",
      ADMIN: darkMode
        ? "bg-violet-500/10 text-violet-300"
        : "bg-violet-50 text-violet-500",
      MANAGER: darkMode
        ? "bg-emerald-500/10 text-emerald-300"
        : "bg-emerald-50 text-emerald-500",
    };

    return `${base} ${
      map[role] ||
      (darkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-600")
    }`;
  };

  return (
    <div className="space-y-6 w-full min-w-0 overflow-x-hidden">
      <div
        className={`${theme.card} border rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm overflow-hidden w-full min-w-0`}
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5 min-w-0">
          <div className="min-w-0">
            <h2 className={`text-xl sm:text-2xl font-bold break-words ${theme.text}`}>
              Xodimlar
            </h2>
            <p className={`text-sm mt-1 break-words ${theme.soft}`}>
              {activeBranch} filialida {filteredEmployees.length} ta xodim
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full sm:w-[220px] rounded-xl border pl-4 pr-4 py-3 outline-none min-w-0 ${theme.input}`}
            />

            <button
              onClick={openAddDrawer}
              className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-medium shrink-0"
            >
              + Xodim qo‘shish
            </button>
          </div>
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

        <div className="hidden lg:block mt-5 rounded-2xl border overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead className={darkMode ? "bg-slate-900/60" : "bg-slate-50"}>
              <tr className={theme.soft}>
                <th className="text-left font-medium px-3 py-4 w-[210px]">Nomi</th>
                <th className="text-left font-medium px-3 py-4 w-[130px]">Lavozimi</th>
                <th className="text-left font-medium px-3 py-4 w-[130px]">Telefon raqami</th>
                <th className="text-left font-medium px-3 py-4 w-[190px]">Email</th>
                <th className="text-left font-medium px-3 py-4 w-[120px]">Tug‘ilgan sana</th>
                <th className="text-left font-medium px-3 py-4 w-[120px]">Yaratilgan sana</th>
                <th className="text-left font-medium px-3 py-4 w-[80px]">Coin</th>
                <th className="text-right font-medium px-3 py-4 w-[140px]">Amallar</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={`border-t ${
                      darkMode
                        ? "border-slate-800 hover:bg-slate-900/40"
                        : "border-slate-100 hover:bg-slate-50/80"
                    } transition`}
                  >
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {employee.photo ? (
                          <img
                            src={employee.photo}
                            alt={employee.fullName}
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
                            {getInitials(employee.fullName) || index + 1}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p
                            className={`font-semibold truncate ${theme.text}`}
                            title={employee.fullName}
                          >
                            {employee.fullName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <span className={roleBadgeClass(employee.role)}>
                        {employee.role}
                      </span>
                    </td>

                    <td className={`px-3 py-4 truncate ${theme.text}`} title={employee.phone}>
                      {employee.phone}
                    </td>

                    <td className="px-3 py-4">
                      <p className={`truncate ${theme.text}`} title={employee.email}>
                        {employee.email}
                      </p>
                    </td>

                    <td className={`px-3 py-4 ${theme.text}`}>
                      {formatDate(employee.birthDate)}
                    </td>

                    <td className={`px-3 py-4 ${theme.text}`}>
                      {formatDate(employee.createdAt)}
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <span>🪙</span>
                        <span className={theme.text}>{employee.coin}</span>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                            darkMode
                              ? "border-slate-700 hover:bg-slate-800"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          👁️
                        </button>

                        <button
                          onClick={() => handleDelete(employee.id)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                            darkMode
                              ? "border-slate-700 hover:bg-red-900/30"
                              : "border-slate-200 hover:bg-red-50"
                          }`}
                        >
                          🗑️
                        </button>

                        <button
                          onClick={() => openEditDrawer(employee)}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                            darkMode
                              ? "border-slate-700 hover:bg-slate-800"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          ✏️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className={`text-center py-10 ${theme.soft}`}>
                    Bu filialda xodim topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden mt-5">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee, index) => (
              <div
                key={employee.id}
                className={`${theme.card} border rounded-2xl p-4 shadow-sm min-w-0`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {employee.photo ? (
                      <img
                        src={employee.photo}
                        alt={employee.fullName}
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
                        {getInitials(employee.fullName) || index + 1}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className={`font-semibold break-words ${theme.text}`}>
                        {employee.fullName}
                      </p>
                      <div className="mt-2">
                        <span className={roleBadgeClass(employee.role)}>
                          {employee.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                        darkMode
                          ? "border-slate-700 hover:bg-slate-800"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      👁️
                    </button>

                    <button
                      onClick={() => handleDelete(employee.id)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                        darkMode
                          ? "border-slate-700 hover:bg-red-900/30"
                          : "border-slate-200 hover:bg-red-50"
                      }`}
                    >
                      🗑️
                    </button>

                    <button
                      onClick={() => openEditDrawer(employee)}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                        darkMode
                          ? "border-slate-700 hover:bg-slate-800"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      ✏️
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className={`break-words ${theme.text}`}>
                    <span className="font-medium">Telefon:</span> {employee.phone}
                  </div>

                  <div className={`break-words ${theme.text}`}>
                    <span className="font-medium">Email:</span> {employee.email}
                  </div>

                  <div className={theme.text}>
                    <span className="font-medium">Tug‘ilgan sana:</span>{" "}
                    {formatDate(employee.birthDate)}
                  </div>

                  <div className={theme.text}>
                    <span className="font-medium">Yaratilgan sana:</span>{" "}
                    {formatDate(employee.createdAt)}
                  </div>

                  <div className="flex items-center gap-2">
                    <span>🪙</span>
                    <span className={theme.text}>{employee.coin}</span>
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
              Bu filialda xodim topilmadi
            </div>
          )}
        </div>
      </div>

      {showDrawer && (
        <div className={`fixed inset-0 z-50 ${theme.overlay}`}>
          <div className="absolute inset-0" onClick={closeDrawer} />

          <div
            className={`absolute inset-y-0 right-0 w-full sm:max-w-[430px] shadow-2xl overflow-y-auto z-10 ${
              darkMode ? "bg-slate-900" : "bg-white"
            }`}
          >
            <div
              className={`p-4 sm:p-6 flex items-start justify-between gap-3 border-b ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <h2 className={`text-lg sm:text-xl font-bold ${theme.text}`}>
                {editingEmployeeId !== null
                  ? "Xodimni tahrirlash"
                  : "Yangi Xodim qo‘shish"}
              </h2>

              <button onClick={closeDrawer} className={`text-xl shrink-0 ${theme.soft}`}>
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  FIO
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Ism"
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@gmail.com"
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Telefon raqam
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+998"
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
                  placeholder="Parol"
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Lavozim (Role)
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                >
                  <option value="">Tanlang</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
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
                  <p className={`text-xs mt-1 ${theme.soft}`}>
                    PNG, JPG, JPEG
                  </p>
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