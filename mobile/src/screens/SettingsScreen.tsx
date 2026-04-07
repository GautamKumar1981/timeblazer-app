import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearTokens } from '../services/auth';
import { logout, RootState } from '../store/store';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [apiUrl, setApiUrl] = useState(
    process.env.API_URL ?? 'http://localhost:5000',
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearTokens();
          dispatch(logout());
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Profile section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>🌙 Dark Mode</Text>
            <Text style={styles.settingSubtitle}>
              Use dark theme across the app
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#2A2A4A', true: '#4A90E2' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>🔔 Notifications</Text>
            <Text style={styles.settingSubtitle}>
              Timebox start/end reminders
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#2A2A4A', true: '#4A90E2' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Developer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer</Text>
        <Text style={styles.fieldLabel}>API URL</Text>
        <TextInput
          style={styles.input}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://localhost:5000"
          placeholderTextColor="#8888AA"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.hintText}>
          Restart the app after changing the API URL.
        </Text>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>🚪 Log Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Timeblazer v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#8888AA',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  profileCard: {
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#8888AA',
    fontSize: 13,
  },
  settingRow: {
    backgroundColor: '#16213E',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settingLabel: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: '#8888AA',
    fontSize: 12,
  },
  fieldLabel: {
    color: '#8888AA',
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#16213E',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    marginBottom: 6,
  },
  hintText: {
    color: '#8888AA',
    fontSize: 11,
  },
  logoutBtn: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  version: {
    color: '#8888AA',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
  },
});

export default SettingsScreen;
