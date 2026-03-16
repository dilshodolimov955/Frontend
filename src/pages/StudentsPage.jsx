import { useState } from "react";

export default function StudentsPage() {
  const [openModal, setOpenModal] = useState(false);

  const students = [
    { id: 1, name: "Bekmirzayev Behruz", group: "IELTS", phone: "+998935640914" },
    { id: 2, name: "Toirov Behruz", group: "IELTS", phone: "+998945578900" },
    { id: 3, name: "Elif Shavkatova", group: "IELTS", phone: "+998945779900" },
  ];

  return (
    <div>

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">O'quvchilar</h2>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg"
        >
          + Talaba qo'shish
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4">#</th>
              <th className="p-4">Ism</th>
              <th className="p-4">Guruh</th>
              <th className="p-4">Telefon</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-4">{s.id}</td>
                <td className="p-4">{s.name}</td>
                <td className="p-4">{s.group}</td>
                <td className="p-4">{s.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {openModal && (
        <div className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl p-6">

          <h3 className="text-xl font-bold mb-6">
            Talaba qo'shish
          </h3>

          <input
            type="text"
            placeholder="Telefon"
            className="border w-full p-3 rounded-lg mb-4"
          />

          <input
            type="text"
            placeholder="Mail"
            className="border w-full p-3 rounded-lg mb-4"
          />

          <input
            type="text"
            placeholder="Talaba FIO"
            className="border w-full p-3 rounded-lg mb-4"
          />

          <input
            type="date"
            className="border w-full p-3 rounded-lg mb-4"
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setOpenModal(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Bekor qilish
            </button>

            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg">
              Saqlash
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
