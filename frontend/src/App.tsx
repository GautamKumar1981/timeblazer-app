import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { store } from './store/store';
import type { RootState } from './store/store';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import ParkingLot from './components/ParkingLot/ParkingLot';

import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/CalendarPage';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import WeeklyReview from './pages/WeeklyReview';
import FocusMode from './pages/FocusMode';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected route: redirects to /login if not authenticated
const ProtectedRoute: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
};

// Layout wrapper: Navbar + Sidebar + content area
const AppLayout: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Apply saved theme on mount
  useEffect(() => {
    if (user?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.theme]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-[280px] min-h-[calc(100vh-64px)] overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <ParkingLot />
    </div>
  );
};

// Theme applier for non-authenticated pages
const ThemeApplier: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('timeblazer_user');
    if (savedTheme) {
      try {
        const user = JSON.parse(savedTheme);
        if (user?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch {
        // ignore
      }
    }
  }, []);

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <ThemeApplier>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Focus mode (protected, full-screen, no layout wrapper) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/focus" element={<FocusMode />} />
          </Route>

          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/weekly-review" element={<WeeklyReview />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeApplier>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '10px',
              background: '#1f2937',
              color: '#f9fafb',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#f9fafb' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f9fafb' },
            },
          }}
        />
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
