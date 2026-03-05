import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectCurrentRole } from "../../features/auth/authSlice";

const ROLE_HOME = {
  main_admin:    "/admin",
  hospital_admin:"/hospital",
  donor:         "/donor",
  receiver:      "/receiver",
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const isAuth = useSelector(selectIsAuthenticated);
  const role   = useSelector(selectCurrentRole);

  if (!isAuth) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={ROLE_HOME[role] || "/login"} replace />;
  }
  return children;
}
