import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { AppDispatch, RootState } from '../store/store';
import { login, register, clearError } from '../store/slices/authSlice';
import Dashboard from '../screens/Dashboard';
import CalendarScreen from '../screens/CalendarScreen';
import TimerScreen from '../screens/TimerScreen';
import Goals from '../screens/Goals';
import Settings from '../screens/Settings';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface, shadowColor: 'transparent', elevation: 0 },
        headerTitleStyle: { fontSize: 18, fontWeight: '700', color: colors.text },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, { active: string; inactive: string }> = {
            Home: { active: 'home', inactive: 'home-outline' },
            Calendar: { active: 'calendar', inactive: 'calendar-outline' },
            Timer: { active: 'timer', inactive: 'timer-outline' },
            Goals: { active: 'flag', inactive: 'flag-outline' },
            Settings: { active: 'settings', inactive: 'settings-outline' },
          };
          const icon = icons[route.name];
          return <Ionicons name={(focused ? icon?.active : icon?.inactive) as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={Dashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Timer" component={TimerScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Goals" component={Goals} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}

function AuthScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((s: RootState) => s.auth);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) { Alert.alert('Error', 'Please fill all fields'); return; }
    dispatch(clearError());
    try {
      if (isLogin) { await dispatch(login({ email: email.trim(), password })).unwrap(); }
      else { await dispatch(register({ name: name.trim(), email: email.trim(), password })).unwrap(); }
    } catch {}
  };

  return (
    <KeyboardAvoidingView style={authStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={authStyles.scroll} keyboardShouldPersistTaps="handled">
        <View style={authStyles.logoSection}>
          <Text style={authStyles.logo}>⚡</Text>
          <Text style={authStyles.appName}>Timeblazer</Text>
          <Text style={authStyles.tagline}>Master your time</Text>
        </View>
        <View style={authStyles.card}>
          <Text style={authStyles.formTitle}>{isLogin ? 'Welcome back' : 'Create account'}</Text>
          {!isLogin && (
            <>
              <Text style={authStyles.label}>Name</Text>
              <TextInput style={authStyles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.textLight} />
            </>
          )}
          <Text style={authStyles.label}>Email</Text>
          <TextInput style={authStyles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.textLight} keyboardType="email-address" autoCapitalize="none" />
          <Text style={authStyles.label}>Password</Text>
          <TextInput style={authStyles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.textLight} secureTextEntry />
          {error ? <Text style={authStyles.error}>{error}</Text> : null}
          <TouchableOpacity style={authStyles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
            <Text style={authStyles.submitText}>{isLoading ? 'Please wait…' : isLogin ? 'Log In' : 'Sign Up'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={authStyles.switchRow}>
            <Text style={authStyles.switchText}>{isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={authStyles.switchLink}>{isLogin ? 'Sign Up' : 'Log In'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <MainTabs /> : <AuthScreen />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const authStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundDark },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 64, marginBottom: 8 },
  appName: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 16, color: colors.textSecondaryOnDark, marginTop: 4 },
  card: { backgroundColor: colors.surfaceDark, borderRadius: 24, padding: 24 },
  formTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondaryOnDark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#fff', marginBottom: 14 },
  error: { color: colors.error, fontSize: 13, marginBottom: 10, textAlign: 'center' },
  submitBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchRow: { alignItems: 'center', marginTop: 16 },
  switchText: { color: colors.textSecondaryOnDark, fontSize: 14 },
  switchLink: { color: colors.primaryLight, fontWeight: '700' },
});
