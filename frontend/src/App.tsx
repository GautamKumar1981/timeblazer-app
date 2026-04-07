import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import './App.css';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import WeeklyReview from './pages/WeeklyReview';
import FocusMode from './pages/FocusMode';
import Header from './components/Common/Header';
import Sidebar from './components/Common/Sidebar';
import Navbar from './components/Common/Navbar';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { token } = useSelector((state: RootState) => state.auth);
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const { token } = useSelector((state: RootState) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/focus" element={
        <PrivateRoute>
          <FocusMode />
        </PrivateRoute>
      } />
      <Route path="/*" element={
        <PrivateRoute>
          <div className="app-layout">
            <Sidebar />
            <div className="app-main">
              <Header />
              <div className="page-content">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/weekly-review" element={<WeeklyReview />} />
                </Routes>
              </div>
            </div>
            <Navbar />
          </div>
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
