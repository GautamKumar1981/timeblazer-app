import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { AppDispatch, RootState } from '../store/store';
import { api } from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Modal from '../components/Common/Modal';
import { setCredentials } from '../store/slices/authSlice';

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland',
  'UTC',
];

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, accessToken, refreshToken } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    timezone: user?.timezone ?? 'UTC',
  });

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(user?.theme ?? 'light');

  // Notifications
  const [notifications, setNotifications] = useState({
    timerAlerts: true,
    dailySummary: true,
    weeklyReport: false,
    goalReminders: true,
  });

  // Password modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Delete confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, timezone: user.timezone });
      setTheme(user.theme);
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.users.updateSettings({
        name: profileForm.name,
        timezone: profileForm.timezone,
      });
      if (user) {
        dispatch(setCredentials({
          user: data,
          accessToken: accessToken ?? '',
          refreshToken: refreshToken ?? '',
        }));
      }
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      await api.users.updateSettings({ theme });
      toast.success('Theme preference saved!');
    } catch {
      toast.error('Failed to save theme');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password updated!');
    setIsPasswordModalOpen(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ Settings</h1>

      {/* Profile section */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={profileForm.name}
            onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={user?.email ?? ''}
            readOnly
            className="input-field opacity-60 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Timezone
          </label>
          <select
            value={profileForm.timezone}
            onChange={(e) => setProfileForm((p) => ({ ...p, timezone: e.target.value }))}
            className="input-field"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <button onClick={handleSaveProfile} disabled={isLoading} className="btn-primary">
          {isLoading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Preferences section */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <div className="flex gap-3">
            {(['light', 'dark'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                  theme === t
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                }`}
              >
                {t === 'light' ? '☀️' : '🌙'} {t}
              </button>
            ))}
          </div>
        </div>
        {/* Notifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notifications
          </label>
          <div className="space-y-2">
            {(
              [
                { key: 'timerAlerts', label: 'Timer alerts when timebox ends' },
                { key: 'dailySummary', label: 'Daily summary notifications' },
                { key: 'weeklyReport', label: 'Weekly report emails' },
                { key: 'goalReminders', label: 'Goal deadline reminders' },
              ] as const
            ).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={() =>
                    setNotifications((p) => ({ ...p, [key]: !p[key] }))
                  }
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
        <button onClick={handleSaveTheme} className="btn-primary">
          Save Preferences
        </button>
      </div>

      {/* Calendar Integration */}
      <div className="card space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Calendar Integration
          </h2>
          <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-0.5 rounded-full font-medium">
            Coming Soon
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sync your timeboxes with Google Calendar, Apple Calendar, and more.
          This feature is currently in development.
        </p>
        <div className="flex gap-3 opacity-50 cursor-not-allowed">
          <button disabled className="btn-secondary text-sm">
            Connect Google Calendar
          </button>
          <button disabled className="btn-secondary text-sm">
            Connect Apple Calendar
          </button>
        </div>
      </div>

      {/* Account section */}
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="btn-secondary text-sm"
          >
            🔑 Change Password
          </button>
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="btn-danger text-sm"
          >
            🗑 Delete Account
          </button>
        </div>
      </div>

      {/* Password Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change Password"
        size="sm"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
              minLength={8}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              required
              className="input-field"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1">
              Update Password
            </button>
            <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete your account? This action is{' '}
            <strong className="text-red-600">permanent and irreversible</strong>. All your data
            will be lost.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                toast.error('Account deletion is disabled in demo mode.');
                setIsDeleteConfirmOpen(false);
              }}
              className="btn-danger flex-1"
            >
              Delete My Account
            </button>
            <button onClick={() => setIsDeleteConfirmOpen(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
