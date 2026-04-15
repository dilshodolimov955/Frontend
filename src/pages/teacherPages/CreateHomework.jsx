import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { groupsApi, homeworkApi } from "../../api/crmApi";

const asList = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export default function CreateHomework() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    groupId: "",
    lessonId: "",
    title: "",
    durationTime: "16",
    file: null,
  });

  useEffect(() => {
    let isMounted = true;

    const loadGroups = async () => {
      try {
        setLoading(true);
        const result = await groupsApi.getMy();
        const list = asList(result);

        if (!isMounted) return;

        setGroups(list);
        if (list[0]?.id) {
          setForm((prev) => ({ ...prev, groupId: String(list[0].id) }));
        }
      } catch {
        if (isMounted) setGroups([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadLessons = async () => {
      if (!form.groupId) {
        setLessons([]);
        setForm((prev) => ({ ...prev, lessonId: "" }));
        return;
      }

      try {
        const result = await groupsApi.getLessonsByGroup(Number(form.groupId));
        const list = asList(result);

        if (!isMounted) return;

        setLessons(list);
        setForm((prev) => ({
          ...prev,
          lessonId: list[0]?.id ? String(list[0].id) : "",
        }));
      } catch {
        if (!isMounted) return;
        setLessons([]);
        setForm((prev) => ({ ...prev, lessonId: "" }));
      }
    };

    loadLessons();

    return () => {
      isMounted = false;
    };
  }, [form.groupId]);

  const submit = async () => {
    if (!form.groupId || !form.lessonId || !form.title.trim()) {
      alert("Guruh, dars va mavzuni to'ldiring");
      return;
    }

    try {
      setSaving(true);
      await homeworkApi.create({
        groupId: Number(form.groupId),
        lessonId: Number(form.lessonId),
        title: form.title.trim(),
        durationTime: Number(form.durationTime || 16),
        file: form.file || undefined,
      });

      alert("Uyga vazifa muvaffaqiyatli yaratildi");
      navigate(`/teacher/groups/${form.groupId}`);
    } catch (error) {
      alert(error?.response?.data?.message || "Uyga vazifa yaratishda xato");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-1 md:p-2">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-slate-900">Uyga vazifa yaratish</h1>
          <button
            type="button"
            onClick={() => navigate("/teacher/groups")}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Guruhlarga qaytish
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Ma'lumotlar yuklanmoqda...</p>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Guruh</label>
              <select
                value={form.groupId}
                onChange={(e) => setForm((prev) => ({ ...prev, groupId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 outline-none focus:border-emerald-500"
              >
                <option value="">Guruhni tanlang</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Dars</label>
              <select
                value={form.lessonId}
                onChange={(e) => setForm((prev) => ({ ...prev, lessonId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 outline-none focus:border-emerald-500"
              >
                <option value="">Darsni tanlang</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Mavzu</label>
              <input
                type="text"
                placeholder="Masalan: React props amaliyoti"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 outline-none focus:border-emerald-500"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Davomiylik (soat)</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 outline-none focus:border-emerald-500"
                value={form.durationTime}
                onChange={(e) => setForm((prev) => ({ ...prev, durationTime: e.target.value }))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Fayl (ixtiyoriy)</label>
              <input
                type="file"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))
                }
                className="block w-full text-sm text-slate-600"
              />
            </div>

            <button
              type="button"
              onClick={submit}
              disabled={saving}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {saving ? "Saqlanmoqda..." : "Uyga vazifani yaratish"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}