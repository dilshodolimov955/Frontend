import React, { useEffect, useState } from "react";
import profileImage from "../../assets/profile-user.jpg";
import {
  useStudentPortal,
  PageShell,
  cn,
  Icons,
} from "./studentPortalShared";
import { studentApi } from "../../api/crmApi";

const { Save } = Icons;

export default function StudentSettingsPage() {
  const { student, setStudent, t, darkMode } = useStudentPortal();

  const [fullName, setFullName] = useState(student?.fullName || "");
  const [email, setEmail] = useState(student?.email || "");
  const [password, setPassword] = useState("");
  const [photoPreview, setPhotoPreview] = useState(student?.photo || profileImage);
  const [photoFile, setPhotoFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFullName(student?.fullName || "");
    setEmail(student?.email || "");
    setPhotoPreview(student?.photo || profileImage);
  }, [student]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);

    if (file) {
      const localUrl = URL.createObjectURL(file);
      setPhotoPreview(localUrl);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const payload = {
        fullName,
        email,
      };

      if (password.trim()) payload.password = password;
      if (photoFile) payload.photo = photoFile;

      let updated = null;

      if (typeof studentApi?.updateMyProfile === "function") {
        updated = await studentApi.updateMyProfile(payload);
      } else {
        updated = {
          ...(student || {}),
          fullName,
          email,
          photo: photoPreview,
        };
      }

      const nextStudent = updated?.data ?? updated ?? null;
      if (nextStudent) setStudent(nextStudent);

      setMessage(t.saveSuccess);
      setPassword("");
    } catch (error) {
      console.error(error);
      setMessage(t.saveError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageShell title={t.settings} subtitle={t.personalInfo} />

      <section
        className={cn(
          "rounded-[28px] border p-5 shadow-sm",
          darkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-white"
        )}
      >
        <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
          <div
            className={cn(
              "rounded-3xl border p-4",
              darkMode
                ? "border-slate-800 bg-slate-950"
                : "border-slate-200 bg-slate-50"
            )}
          >
            <p className={cn("mb-3 text-sm font-bold", darkMode ? "text-white" : "text-slate-900")}>
              {t.profilePhoto}
            </p>

            <div className="mx-auto h-44 w-44 overflow-hidden rounded-[28px] bg-slate-200">
              <img
                src={photoPreview || profileImage}
                alt="profile"
                className="h-full w-full object-cover"
              />
            </div>

            <label
              className={cn(
                "mt-4 flex cursor-pointer items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition",
                darkMode
                  ? "bg-linear-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-90"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              )}
            >
              {t.uploadPhoto}
              <input type="file" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          <div
            className={cn(
              "rounded-3xl border p-4",
              darkMode
                ? "border-slate-800 bg-slate-950"
                : "border-slate-200 bg-white"
            )}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={cn("mb-2 block text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-700")}>
                  {t.fullName}
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-sm outline-none",
                    darkMode
                      ? "border-slate-700 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  )}
                />
              </div>

              <div>
                <label className={cn("mb-2 block text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-700")}>
                  {t.email}
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-sm outline-none",
                    darkMode
                      ? "border-slate-700 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <label className={cn("mb-2 block text-sm font-semibold", darkMode ? "text-slate-200" : "text-slate-700")}>
                  {t.newPassword}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-sm outline-none",
                    darkMode
                      ? "border-slate-700 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-900"
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition",
                  darkMode
                    ? "bg-linear-to-r from-violet-600 to-fuchsia-500 text-white hover:opacity-90"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                <Save className="h-4 w-4" />
                {saving ? t.saving : t.save}
              </button>

              {message ? (
                <span className={cn("text-sm", darkMode ? "text-slate-300" : "text-slate-700")}>
                  {message}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}