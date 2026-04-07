import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutThunk } from '../store/authSlice';
import { storage } from '../services/storage';
import { setApiUrl } from '../services/api';

type Props = BottomTabScreenProps<TabParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const [apiUrl, setApiUrlState] = useState('http://localhost:5000/api');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isEditingApi, setIsEditingApi] = useState(false);

  useEffect(() => {
    storage.getApiUrl().then((url) => {
      if (url) setApiUrlState(url);
    });
  }, []);

  const handleSaveApiUrl = () => {
    if (!apiUrl.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid API URL.');
      return;
    }
    setApiUrl(apiUrl.trim());
    setIsEditingApi(false);
    Alert.alert('Saved', 'API URL updated successfully.');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => dispatch(logoutThunk()),
      },
    ]);
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName ?? user?.username ?? 'Unknown'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
            {user?.timezone && (
              <Text style={styles.profileTimezone}>🌍 {user.timezone}</Text>
            )}
          </View>
        </View>

        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔌 API Configuration</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>API URL</Text>
              {!isEditingApi && (
                <TouchableOpacity onPress={() => setIsEditingApi(true)}>
                  <Text style={styles.editLink}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            {isEditingApi ? (
              <View>
                <TextInput
                  style={styles.apiInput}
                  value={apiUrl}
                  onChangeText={setApiUrlState}
                  placeholder="http://localhost:5000/api"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <View style={styles.apiActions}>
                  <TouchableOpacity
                    style={[styles.apiBtn, styles.apiCancelBtn]}
                    onPress={() => setIsEditingApi(false)}
                  >
                    <Text style={styles.apiCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.apiBtn, styles.apiSaveBtn]}
                    onPress={handleSaveApiUrl}
                  >
                    <Text style={styles.apiSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.apiUrlDisplay} numberOfLines={1}>{apiUrl}</Text>
            )}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Preferences</Text>
          <View style={styles.settingCard}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Push Notifications</Text>
                <Text style={styles.toggleHint}>Timebox reminders & alerts</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
                thumbColor={notificationsEnabled ? '#4F46E5' : '#9CA3AF'}
              />
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <View style={styles.settingCard}>
            <InfoRow label="Version" value="1.0.0" />
            <View style={styles.divider} />
            <InfoRow label="Build" value="2024.01" />
            <View style={styles.divider} />
            <InfoRow label="Platform" value="React Native / Expo" />
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    paddingTop: 16,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 2 },
  profileEmail: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  profileTimezone: { fontSize: 12, color: '#9CA3AF' },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  editLink: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
  apiUrlDisplay: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  apiInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 10,
  },
  apiActions: { flexDirection: 'row', gap: 10 },
  apiBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  apiCancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  apiSaveBtn: {
    backgroundColor: '#4F46E5',
  },
  apiCancelText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  apiSaveText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  toggleHint: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: { fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, color: '#374151', fontWeight: '500' },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#DC2626' },
});
