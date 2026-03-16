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

const defaultRooms = [
  { id: 1, name: "3-xona", capacity: "20", branch: "AICoder markazi" },
  { id: 2, name: "99", capacity: "25", branch: "AICoder markazi" },
  { id: 3, name: "7-xona", capacity: "24", branch: "AICoder markazi" },
  { id: 4, name: "Beginner", capacity: "18", branch: "AICoder markazi" },

  { id: 5, name: "7", capacity: "30", branch: "Fizika va Matematika" },
  { id: 6, name: "impact room", capacity: "12", branch: "Fizika va Matematika" },
  { id: 7, name: "16-xona", capacity: "18", branch: "Fizika va Matematika" },

  { id: 8, name: "Jonibekning xonasi", capacity: "50", branch: "4-maktab" },
  { id: 9, name: "1A", capacity: "25", branch: "4-maktab" },
  { id: 10, name: "IELTS with Islombek", capacity: "20", branch: "4-maktab" },

  { id: 11, name: "genious room", capacity: "15", branch: "Niner markazi" },
  { id: 12, name: "205-xona", capacity: "32", branch: "Niner markazi" },
  { id: 13, name: "5 xona", capacity: "30", branch: "Niner markazi" },
];

export default function RoomsPage({ theme, darkMode }) {
  const [activeBranch, setActiveBranch] = useState("AICoder markazi");
  const [showDrawer, setShowDrawer] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);

  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem("crm_rooms");
    return saved ? JSON.parse(saved) : defaultRooms;
  });

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    branch: "AICoder markazi",
  });

  useEffect(() => {
    localStorage.setItem("crm_rooms", JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    if (!showDrawer) {
      setFormData((prev) => ({
        ...prev,
        branch: activeBranch,
      }));
    }
  }, [activeBranch, showDrawer]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => room.branch === activeBranch);
  }, [rooms, activeBranch]);

  const resetForm = () => {
    setEditingRoomId(null);
    setFormData({
      name: "",
      capacity: "",
      branch: activeBranch,
    });
  };

  const openAddDrawer = () => {
    setEditingRoomId(null);
    setFormData({
      name: "",
      capacity: "",
      branch: activeBranch,
    });
    setShowDrawer(true);
  };

  const openEditDrawer = (room) => {
    setEditingRoomId(room.id);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      branch: room.branch,
    });
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.capacity.trim()) {
      alert("Xona nomi va sig‘imi kiritilishi kerak");
      return;
    }

    if (editingRoomId !== null) {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === editingRoomId
            ? {
                ...room,
                name: formData.name.trim(),
                capacity: formData.capacity.trim(),
                branch: formData.branch,
              }
            : room
        )
      );
    } else {
      const newRoom = {
        id: Date.now(),
        name: formData.name.trim(),
        capacity: formData.capacity.trim(),
        branch: formData.branch,
      };

      setRooms((prev) => [newRoom, ...prev]);
    }

    closeDrawer();
  };

  const handleDelete = (id) => {
    setRooms((prev) => prev.filter((room) => room.id !== id));
  };

  return (
    <div className="space-y-6 w-full min-w-0 overflow-x-hidden">
      <div
        className={`${theme.card} border rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm overflow-hidden w-full min-w-0`}
      >
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5 min-w-0">
          <div className="min-w-0">
            <h2 className={`text-xl sm:text-2xl font-bold break-words ${theme.text}`}>
              Xonalar
            </h2>
            <p className={`text-sm mt-1 break-words ${theme.soft}`}>
              {activeBranch} filialida {filteredRooms.length} ta xona
            </p>
          </div>

          <button
            onClick={openAddDrawer}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl font-medium shrink-0"
          >
            + Xonani qo‘shish
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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <div
                key={room.id}
                className={`${theme.card} border rounded-2xl p-4 sm:p-5 shadow-sm min-h-[190px] w-full min-w-0`}
              >
                <div className="flex items-start justify-between gap-3 min-w-0 h-full">
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-[17px] sm:text-[18px] font-bold break-words ${theme.text}`}
                    >
                      {room.name}
                    </h3>

                    <p className={`text-sm mt-3 break-words ${theme.soft}`}>
                      Sig‘imi: {room.capacity} ta
                    </p>

                    <p className={`text-sm mt-1 break-words ${theme.soft}`}>
                      {room.branch}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleDelete(room.id)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                        darkMode
                          ? "border-slate-700 hover:bg-red-900/30"
                          : "border-slate-200 hover:bg-red-50"
                      }`}
                    >
                      🗑️
                    </button>

                    <button
                      onClick={() => openEditDrawer(room)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                        darkMode
                          ? "border-slate-700 hover:bg-slate-800"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              className={`${theme.card} border rounded-2xl p-6 w-full text-center sm:col-span-2 xl:col-span-3 ${theme.soft}`}
            >
              Bu filialda xona yo‘q
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
                {editingRoomId !== null ? "Xonani tahrirlash" : "Xonani qo‘shish"}
              </h2>

              <button onClick={closeDrawer} className={`text-xl shrink-0 ${theme.soft}`}>
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5">
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Nomi
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Xona nomi"
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                  Sig‘imi
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Masalan: 20"
                  className={`w-full rounded-xl border px-4 py-3 outline-none min-w-0 ${theme.input}`}
                />
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