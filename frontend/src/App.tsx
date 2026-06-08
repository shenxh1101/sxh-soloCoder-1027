import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Favorites from './pages/Favorites';
import Resume from './pages/Resume';
import Applications from './pages/Applications';
import HRDashboard from './pages/HRDashboard';
import HRJobs from './pages/HRJobs';
import HRApplications from './pages/HRApplications';
import HRInterviews from './pages/HRInterviews';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resume"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <Resume />
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute allowedRoles={['jobseeker']}>
                <Applications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/hr/dashboard"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <HRDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/jobs"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <HRJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/jobs/:action"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <HRJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/jobs/:action/:id"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <HRJobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/applications"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <HRApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hr/interviews"
            element={
              <ProtectedRoute allowedRoles={['hr']}>
                <HRInterviews />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to={user ? (user.role === 'hr' ? '/hr/dashboard' : '/jobs') : '/'} replace />}
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;
