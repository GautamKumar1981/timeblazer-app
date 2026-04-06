import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { colors } from '../theme/colors';

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notifications ?? true);
  const [darkMode, setDarkMode] = useState(user?.preferences?.theme === 'dark');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile */}
      <Text style={styles.sectionHeader}>Profile</Text>
      <View style={styles.card}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() ?? 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
          </View>
        </View>
        <Row label="Timezone" value={user?.timezone ?? 'UTC'} />
      </View>

      {/* Preferences */}
      <Text style={styles.sectionHeader}>Preferences</Text>
      <View style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: colors.primary }} />
        </View>
        <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.switchLabel}>Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ true: colors.primary }} />
        </View>
      </View>

      {/* About */}
      <Text style={styles.sectionHeader}>About</Text>
      <View style={styles.card}>
        <Row label="Version" value="1.0.0" />
        <Row label="App" value="Timeblazer" last />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 40 },
  sectionHeader: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 8, paddingHorizontal: 20 },
  card: { marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: 16, overflow: 'hidden', elevation: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700', color: colors.text },
  profileEmail: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 15, color: colors.text },
  rowValue: { fontSize: 15, color: colors.textSecondary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  switchLabel: { fontSize: 15, color: colors.text },
  logoutBtn: { marginHorizontal: 16, marginTop: 32, paddingVertical: 16, borderRadius: 14, alignItems: 'center', backgroundColor: '#fee2e2' },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#ef4444' },
});
