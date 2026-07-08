import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/" state={{ requireLogin: true }} replace />;
  }

  if (role !== 'salon_admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
