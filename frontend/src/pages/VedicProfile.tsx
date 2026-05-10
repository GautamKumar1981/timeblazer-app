import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const VedicProfile: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/profile', { replace: true }); }, [navigate]);
  return null;
};

export default VedicProfile;
