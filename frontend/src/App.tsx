import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/store';
import { fetchSubscriptionStatus } from './store/slices/subscriptionSlice';
import { useAndroidBack } from './hooks/useAndroidBack';
import Login            from './pages/Login';
import Dashboard        from './pages/Dashboard';
import BaziProfile      from './pages/BaziProfile';
import BaziChart        from './pages/BaziChart';
import DailyForecast    from './pages/DailyForecast';
import CalendarView     from './pages/CalendarView';
import BusinessTiming   from './pages/BusinessTiming';
import LuckPillars      from './pages/LuckPillars';
import StoriesPage      from './pages/StoriesPage';
import ArtifactsShop    from './pages/ArtifactsShop';
import SubscriptionPage from './pages/SubscriptionPage';
import Settings         from './pages/Settings';
import Goals            from './pages/Goals';
import Analytics        from './pages/Analytics';
import WeeklyReview     from './pages/WeeklyReview';
import FocusMode        from './pages/FocusMode';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const auth = Boolean(token);

  useAndroidBack();

  useEffect(() => {
    if (auth) dispatch(fetchSubscriptionStatus());
  }, [auth, dispatch]);

  return (
    <div style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', minHeight: '100vh', backgroundColor: '#0f0e1a' }}>
      <Routes>
        <Route path="/"                element={auth ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/dashboard"       element={auth ? <Dashboard />        : <Navigate to="/" replace />} />
        <Route path="/profile"         element={auth ? <BaziProfile />      : <Navigate to="/" replace />} />
        <Route path="/chart"           element={auth ? <BaziChart />        : <Navigate to="/" replace />} />
        <Route path="/daily"           element={auth ? <DailyForecast />    : <Navigate to="/" replace />} />
        <Route path="/calendar"        element={auth ? <CalendarView />     : <Navigate to="/" replace />} />
        <Route path="/business-timing" element={auth ? <BusinessTiming />   : <Navigate to="/" replace />} />
        <Route path="/luck-pillars"    element={auth ? <LuckPillars />      : <Navigate to="/" replace />} />
        <Route path="/stories"         element={auth ? <StoriesPage />      : <Navigate to="/" replace />} />
        <Route path="/artifacts"       element={auth ? <ArtifactsShop />   : <Navigate to="/" replace />} />
        <Route path="/subscription"    element={auth ? <SubscriptionPage /> : <Navigate to="/" replace />} />
        <Route path="/settings"        element={auth ? <Settings />         : <Navigate to="/" replace />} />
        <Route path="/goals"           element={auth ? <Goals />            : <Navigate to="/" replace />} />
        <Route path="/analytics"       element={auth ? <Analytics />        : <Navigate to="/" replace />} />
        <Route path="/weekly-review"   element={auth ? <WeeklyReview />     : <Navigate to="/" replace />} />
        <Route path="/focus"           element={auth ? <FocusMode />        : <Navigate to="/" replace />} />
        <Route path="*"                element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
