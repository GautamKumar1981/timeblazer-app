import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SidebarProvider } from './context/SidebarContext';
import { useAppSelector, useAppDispatch } from './store/store';
import { fetchSubscriptionStatus } from './store/slices/subscriptionSlice';
import { useAndroidBack } from './hooks/useAndroidBack';
import SubscriptionGate from './components/SubscriptionGate';
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
import UpgradePage      from './pages/UpgradePage';
import MorningRitual  from './pages/MorningRitual';
import ShutdownRitual from './pages/ShutdownRitual';
import VedicProfile   from './pages/VedicProfile';
import VedicPanchang  from './pages/VedicPanchang';
import AdminPanel     from './pages/AdminPanel';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const auth = Boolean(token);

  useAndroidBack();

  useEffect(() => {
    if (auth) dispatch(fetchSubscriptionStatus());
  }, [auth, dispatch]);

  return (
    <SidebarProvider>
    <div style={{ fontFamily: 'Segoe UI, Roboto, Arial, sans-serif', minHeight: '100vh', backgroundColor: '#f8f6ff' }}>
      <Routes>
        {/* Public routes */}
        <Route path="/"             element={auth ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/upgrade"      element={auth ? <UpgradePage />      : <Navigate to="/" replace />} />
        <Route path="/subscription" element={auth ? <SubscriptionPage /> : <Navigate to="/" replace />} />
        <Route path="/settings"     element={auth ? <Settings />         : <Navigate to="/" replace />} />
        <Route path="/profile"         element={auth ? <BaziProfile />      : <Navigate to="/" replace />} />
        <Route path="/morning-ritual"  element={auth ? <MorningRitual />    : <Navigate to="/" replace />} />
        <Route path="/shutdown-ritual" element={auth ? <ShutdownRitual />   : <Navigate to="/" replace />} />
        <Route path="/vedic-profile"   element={auth ? <VedicProfile />     : <Navigate to="/" replace />} />
        <Route path="/vedic-panchang"  element={auth ? <VedicPanchang />    : <Navigate to="/" replace />} />

        {/* Dashboard — always accessible (shows trial banner inline) */}
        <Route path="/dashboard"    element={auth ? <Dashboard />        : <Navigate to="/" replace />} />

        {/* Gated routes — require active trial or subscription */}
        <Route path="/chart"           element={auth ? <SubscriptionGate><BaziChart /></SubscriptionGate>        : <Navigate to="/" replace />} />
        <Route path="/daily"           element={auth ? <SubscriptionGate><DailyForecast /></SubscriptionGate>    : <Navigate to="/" replace />} />
        <Route path="/calendar"        element={auth ? <SubscriptionGate><CalendarView /></SubscriptionGate>     : <Navigate to="/" replace />} />
        <Route path="/business-timing" element={auth ? <SubscriptionGate><BusinessTiming /></SubscriptionGate>  : <Navigate to="/" replace />} />
        <Route path="/luck-pillars"    element={auth ? <SubscriptionGate><LuckPillars /></SubscriptionGate>      : <Navigate to="/" replace />} />
        <Route path="/stories"         element={auth ? <SubscriptionGate><StoriesPage /></SubscriptionGate>      : <Navigate to="/" replace />} />
        <Route path="/artifacts"       element={auth ? <SubscriptionGate><ArtifactsShop /></SubscriptionGate>   : <Navigate to="/" replace />} />
        <Route path="/goals"           element={auth ? <SubscriptionGate><Goals /></SubscriptionGate>            : <Navigate to="/" replace />} />
        <Route path="/analytics"       element={auth ? <SubscriptionGate><Analytics /></SubscriptionGate>        : <Navigate to="/" replace />} />
        <Route path="/weekly-review"   element={auth ? <SubscriptionGate><WeeklyReview /></SubscriptionGate>     : <Navigate to="/" replace />} />
        <Route path="/focus"           element={auth ? <SubscriptionGate><FocusMode /></SubscriptionGate>        : <Navigate to="/" replace />} />

        {/* Admin — only accessible to admin users (AdminPanel self-redirects if not admin) */}
        <Route path="/admin" element={auth ? <AdminPanel /> : <Navigate to="/" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
    </SidebarProvider>
  );
};

export default App;
