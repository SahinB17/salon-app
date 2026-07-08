import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  if (!token) {
    return <Navigate to="/" state={{ requireLogin: true, from: location.pathname }} replace />;
  }
  
  return <Outlet />;
}
