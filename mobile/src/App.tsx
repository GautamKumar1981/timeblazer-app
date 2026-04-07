import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { StatusBar } from 'expo-status-bar';

import { store, RootState, setCredentials } from './store/store';
import { authAPI } from './services/api';
import { saveTokens, isAuthenticated } from './services/auth';
import storage from './services/storage';

import DashboardScreen from './screens/DashboardScreen';
import CalendarScreen from './screens/CalendarScreen';
import TimerScreen from './screens/TimerScreen';
import GoalsScreen from './screens/GoalsScreen';
import SettingsScreen from './screens/SettingsScreen';

// ─── Tab Navigator ─────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Dashboard: '🏠',
  Calendar: '📅',
  Timer: '⏱',
  Goals: '🎯',
  Settings: '⚙️',
};

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerStyle: { backgroundColor: '#16213E' },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '700' },
      tabBarStyle: {
        backgroundColor: '#16213E',
        borderTopColor: '#2A2A4A',
        borderTopWidth: 1,
      },
      tabBarActiveTintColor: '#4A90E2',
      tabBarInactiveTintColor: '#8888AA',
      tabBarLabel: route.name,
      tabBarIcon: ({ focused }) => (
        <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>
          {TAB_ICONS[route.name]}
        </Text>
      ),
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="Timer" component={TimerScreen} />
    <Tab.Screen name="Goals" component={GoalsScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

// ─── Login Screen ──────────────────────────────────────────────────────────────

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setError('Name is required for registration.');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await authAPI.login(email.trim(), password);
      } else {
        res = await authAPI.register(name.trim(), email.trim(), password);
      }
      const { user, token, refreshToken } = res.data;
      await saveTokens(token, refreshToken ?? '');
      await storage.save('user', user);
      dispatch(setCredentials({ user, token }));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.loginContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.loginInner}>
        <Text style={styles.logo}>⚡ Timeblazer</Text>
        <Text style={styles.tagline}>Master your time, one box at a time.</Text>

        <View style={styles.card}>
          <View style={styles.modeSwitcher}>
            <TouchableOpacity
              style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
              onPress={() => {
                setMode('login');
                setError('');
              }}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  mode === 'login' && styles.modeBtnTextActive,
                ]}
              >
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeBtn,
                mode === 'register' && styles.modeBtnActive,
              ]}
              onPress={() => {
                setMode('register');
                setError('');
              }}
            >
              <Text
                style={[
                  styles.modeBtnText,
                  mode === 'register' && styles.modeBtnTextActive,
                ]}
              >
                Register
              </Text>
            </TouchableOpacity>
          </View>

          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#8888AA"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8888AA"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8888AA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnText}>
                {mode === 'login' ? 'Login' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─── Auth Stack ────────────────────────────────────────────────────────────────

const AuthStack = createStackNavigator();

const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
  </AuthStack.Navigator>
);

// ─── Root Navigator ────────────────────────────────────────────────────────────

const RootNavigator: React.FC = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((s: RootState) => s.auth.isAuthenticated);
  const [checking, setChecking] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const user = await storage.load<{ id: string; name: string; email: string }>('user');
        const token = (await import('./services/auth')).then((m) => m.getToken());
        const tok = await token;
        if (user && tok) {
          dispatch(setCredentials({ user, token: tok }));
        }
      }
    } finally {
      setChecking(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  if (checking) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>⚡</Text>
        <Text style={styles.splashTitle}>Timeblazer</Text>
        <ActivityIndicator
          color="#4A90E2"
          style={{ marginTop: 24 }}
        />
      </View>
    );
  }

  return isAuth ? <MainTabs /> : <AuthNavigator />;
};

// ─── App Root ──────────────────────────────────────────────────────────────────

const AppInner: React.FC = () => (
  <NavigationContainer>
    <StatusBar style="light" />
    <RootNavigator />
  </NavigationContainer>
);

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppInner />
      </SafeAreaProvider>
    </Provider>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    fontSize: 60,
    marginBottom: 8,
  },
  splashTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 1,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  loginInner: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    color: '#4A90E2',
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  tagline: {
    color: '#8888AA',
    fontSize: 14,
    marginBottom: 36,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 20,
  },
  modeSwitcher: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 3,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: '#4A90E2',
  },
  modeBtnText: {
    color: '#8888AA',
    fontWeight: '600',
    fontSize: 14,
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#1A1A2E',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 13,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
