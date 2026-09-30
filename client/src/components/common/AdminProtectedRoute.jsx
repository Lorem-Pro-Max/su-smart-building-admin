import { Navigate, Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
    const token = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 1) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default AdminProtectedRoute;