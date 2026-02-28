import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import AdminManagement from './pages/AdminManagement';
import CitizenOverview from './pages/CitizenOverview';
import CallTranscriptViewer from './pages/CallTranscriptViewer';
import Consultations from './pages/Consultations';
import SchemeInquiries from './pages/SchemeInquiries';
import CitizenProfile from './pages/CitizenProfile';
import LiveKitRooms from './pages/LiveKitRooms';
import MyApplications from './pages/MyApplications';
import TrackApplication from './pages/TrackApplication';
import MySchemes from './pages/MySchemes';
import Header from './components/Header';
import Footer from './components/Footer';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-red-500 mb-4">
            <span className="material-symbols-outlined text-6xl">block</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You need administrator privileges to access this page.</p>
          <button
            onClick={() => window.location.href = '/home'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return children;
};

const AdminLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
          <Route path="/track-status" element={<ProtectedRoute><TrackApplication /></ProtectedRoute>} />
          <Route path="/my-schemes" element={<ProtectedRoute><MySchemes /></ProtectedRoute>} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/profile" />} />
            <Route path="profile" element={<CitizenProfile />} />
            
            {/* Admin-only routes */}
            <Route path="dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="admin-management" element={<AdminRoute><AdminManagement /></AdminRoute>} />
            <Route path="citizens" element={<AdminRoute><CitizenOverview /></AdminRoute>} />
            <Route path="transcripts" element={<AdminRoute><CallTranscriptViewer /></AdminRoute>} />
            <Route path="consultations" element={<AdminRoute><Consultations /></AdminRoute>} />
            <Route path="inquiries" element={<AdminRoute><SchemeInquiries /></AdminRoute>} />
            <Route path="livekit-rooms" element={<AdminRoute><LiveKitRooms /></AdminRoute>} />
          </Route>

          </Routes>
        </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
