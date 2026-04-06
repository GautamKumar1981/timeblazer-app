import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../store/store';
import { fetchTimeboxes, completeTimebox } from '../store/slices/timeboxSlice';
import CountdownTimer from '../components/Timer/CountdownTimer';
import ParkingLot from '../components/ParkingLot/ParkingLot';
import type { ParkingLotItem } from '../types';

const FocusMode: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { timeboxes } = useSelector((state: RootState) => state.timebox);

  const activeTimebox = timeboxes.find((tb) => tb.status === 'in_progress');

  useEffect(() => {
    dispatch(fetchTimeboxes());
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
      if (e.altKey && e.key === 'q') {
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleComplete = async (actualDuration: number) => {
    if (!activeTimebox) return;
    try {
      await dispatch(completeTimebox({ id: activeTimebox.id, actualDuration })).unwrap();
      toast.success('🎉 Timebox completed! Great focus session!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err as string);
    }
  };

  const handleExtend = () => {
    toast.success('+5 minutes added');
  };

  const handleConvertToTimebox = (item: ParkingLotItem) => {
    toast.success(`"${item.text}" added to calendar`);
  };

  const CATEGORY_COLORS: Record<string, string> = {
    Work: 'bg-blue-600',
    Meetings: 'bg-red-500',
    Breaks: 'bg-yellow-400',
    Learning: 'bg-green-500',
    Personal: 'bg-purple-500',
  };

  return (
    <div className="focus-mode flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      {/* Exit button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
      >
        ✕ Exit Focus
      </button>

      {/* Shortcut hint */}
      <p className="fixed top-6 right-6 text-xs text-gray-600">ESC or Alt+Q to exit</p>

      {activeTimebox ? (
        <div className="flex flex-col items-center gap-6 px-8 max-w-md w-full">
          {/* Category badge */}
          <span
            className={`text-sm font-semibold px-3 py-1 rounded-full text-white ${
              CATEGORY_COLORS[activeTimebox.category] ?? 'bg-blue-600'
            }`}
          >
            {activeTimebox.category}
          </span>

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Now Focusing:</h1>
            <h2 className="text-3xl font-bold text-blue-400 mt-1">{activeTimebox.title}</h2>
            {activeTimebox.description && (
              <p className="text-gray-400 text-sm mt-2">{activeTimebox.description}</p>
            )}
          </div>

          {/* Timer */}
          <CountdownTimer
            timebox={activeTimebox}
            onComplete={handleComplete}
            onExtend={handleExtend}
          />
        </div>
      ) : (
        <div className="text-center px-8">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-white mb-2">No Active Timebox</h2>
          <p className="text-gray-400 mb-6">
            Start a timebox from your dashboard or calendar to use Focus Mode.
          </p>
          <Link
            to="/dashboard"
            className="btn-primary inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      {/* Parking Lot */}
      <ParkingLot onConvertToTimebox={handleConvertToTimebox} />
    </div>
  );
};

export default FocusMode;
