import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/store';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import WeeklyReview from './pages/WeeklyReview';
import FocusMode from './pages/FocusMode';

const App: React.FC = () => {
  const { token } = useAppSelector((state) => state.auth);
  const isAuthenticated = Boolean(token);

  return (
    <div style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />}
        />
        <Route
          path="/calendar"
          element={isAuthenticated ? <Calendar /> : <Navigate to="/" replace />}
        />
        <Route
          path="/goals"
          element={isAuthenticated ? <Goals /> : <Navigate to="/" replace />}
        />
        <Route
          path="/analytics"
          element={isAuthenticated ? <Analytics /> : <Navigate to="/" replace />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <Settings /> : <Navigate to="/" replace />}
        />
        <Route
          path="/weekly-review"
          element={isAuthenticated ? <WeeklyReview /> : <Navigate to="/" replace />}
        />
        <Route
          path="/focus"
          element={isAuthenticated ? <FocusMode /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
