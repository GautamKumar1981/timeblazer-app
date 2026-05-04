import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/store';

interface Props { children: React.ReactNode }

const SubscriptionGate: React.FC<Props> = ({ children }) => {
  const { data, loading } = useAppSelector((s) => s.subscription);

  // While loading or API unavailable, grant access optimistically
  if (loading || data === null) return <>{children}</>;

  // Trial expired and no subscription → paywall
  if (!data.has_premium_access) return <Navigate to="/upgrade" replace />;

  return <>{children}</>;
};

export default SubscriptionGate;
