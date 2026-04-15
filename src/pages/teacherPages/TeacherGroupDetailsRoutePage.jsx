import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import GroupDetailsPage from "./GroupdetrailsPage";
import { groupsApi } from "../../api/crmApi";
import { getAuthUserFromStorage } from "../../utils/authToken";
import { teacherLightTheme } from "./teacherTheme";

const asList = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  return [];
};

export default function TeacherGroupDetailsRoutePage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useMemo(() => getAuthUserFromStorage(), []);
  const [groupData, setGroupData] = useState(location.state?.group || null);
  const [loading, setLoading] = useState(!location.state?.group);

  useEffect(() => {
    let isMounted = true;

    const loadGroup = async () => {
      if (location.state?.group) return;

      try {
        setLoading(true);
        const [groupsResult, studentsResult] = await Promise.all([
          groupsApi.getMy(),
          groupsApi.getStudentsByGroup(Number(groupId)),
        ]);

        const groups = asList(groupsResult);
        const students = asList(studentsResult);

        const target = groups.find((group) => Number(group.id) === Number(groupId));

        if (!target) {
          if (isMounted) setGroupData(null);
          return;
        }

        if (!isMounted) return;

        setGroupData({
          id: target.id,
          name: target.name,
          status: target.status,
          course: target.course?.name || "-",
          courseId: target.courseId,
          teacher: authUser?.fullName || "-",
          teacherId: target.teacherId,
          room: target.room?.name || `Xona ${target.roomId || "-"}`,
          roomId: target.roomId,
          lessonTime: target.startTime,
          days: target.weekDays || [],
          duration: target.course?.durationLesson
            ? `${target.course.durationLesson} minut`
            : "-",
          price: target.course?.price ? String(target.course.price) : "0",
          startDate: target.startDate,
          startTime: target.startTime,
          students: students.map((student) => ({
            id: student.id,
            fullName: student.fullName,
            email: student.email || "-",
          })),
        });
      } catch {
        if (isMounted) {
          setGroupData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadGroup();

    return () => {
      isMounted = false;
    };
  }, [authUser?.fullName, groupId, location.state?.group]);

  if (loading) {
    return (
      <div className="p-2 text-slate-600">
        Guruh ma'lumotlari yuklanmoqda...
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="p-2">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Guruh topilmadi</h2>
          <p className="mt-2 text-sm text-slate-500">
            Bu guruh mavjud emas yoki sizga biriktirilmagan.
          </p>
          <button
            type="button"
            onClick={() => navigate("/teacher/groups")}
            className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Orqaga
          </button>
        </div>
      </div>
    );
  }

  return (
    <GroupDetailsPage
      theme={teacherLightTheme}
      darkMode={false}
      group={groupData}
      onBack={() => navigate("/teacher/groups")}
    />
  );
}
