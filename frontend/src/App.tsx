import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import Sessions from './pages/Sessions';
import Chat from './pages/Chat';
import Resources from './pages/Resources';
import CreateResource from './pages/CreateResource';
import Profile from './pages/Profile';
import AIHub from './pages/AIHub';
import VideoSession from './pages/VideoSession';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="card animate-bounce-in">
          <h2 className="text-2xl font-bold">LOADING...</h2>
        </div>
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const loadFromStorage = useAuthStore(s => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface w-full">
        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/explore" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="/resources/create" element={<ProtectedRoute><CreateResource /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIHub /></ProtectedRoute>} />
          <Route path="/session/:roomName" element={<VideoSession />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
