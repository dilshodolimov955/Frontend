import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import GroupsPage from "./GroupsPage";
import { getAuthUserFromStorage } from "../../utils/authToken";
import { teacherLightTheme } from "./teacherTheme";

export default function TeacherGroupsRoutePage() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getAuthUserFromStorage(), []);

  return (
    <GroupsPage
      theme={teacherLightTheme}
      darkMode={false}
      currentUser={currentUser}
      onOpenGroupDetails={(group) => {
        navigate(`/teacher/groups/${group.id}`, { state: { group } });
      }}
    />
  );
}
