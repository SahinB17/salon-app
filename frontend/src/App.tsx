import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/salons" element={<div className="p-4 text-center mt-10">Axtarış (Tezliklə)</div>} />
              <Route path="/appointments" element={<div className="p-4 text-center mt-10">Rezervasiyalarım (Tezliklə)</div>} />
              <Route path="/profile" element={<div className="p-4 text-center mt-10">Profil (Tezliklə)</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
