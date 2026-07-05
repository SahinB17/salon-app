import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';
import Search from './pages/Search';
import SalonDetail from './pages/SalonDetail';
import Appointments from './pages/Appointments';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import AdminRoute from './components/auth/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import SalonsManagement from './pages/admin/SalonsManagement';
import AppointmentsManagement from './pages/admin/AppointmentsManagement';
import ServicesManagement from './pages/admin/ServicesManagement';
import StaffManagement from './pages/admin/StaffManagement';

import { Toaster } from 'sonner';
import { ThemeProvider } from './components/ThemeProvider';

import ScrollToTop from './components/ui/ScrollToTop';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="salon-app-theme">
      <QueryClientProvider client={queryClient}>
        <Toaster position="top-center" richColors />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/salons" element={<Search />} />
              <Route path="/salons/:id" element={<SalonDetail />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
            </Route>

            {/* Admin Routes (Protected via AdminRoute & wrapped in AdminLayout) */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="salons" element={<SalonsManagement />} />
                <Route path="services" element={<ServicesManagement />} />
                <Route path="staff" element={<StaffManagement />} />
                <Route path="appointments" element={<AppointmentsManagement />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
