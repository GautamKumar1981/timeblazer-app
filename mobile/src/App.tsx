import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';

import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { restoreSession } from './store/authSlice';
import { initApiClient } from './services/api';

import type { RootStackParamList, TabParamList } from './types';

import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { TimerScreen } from './screens/TimerScreen';
import { GoalsScreen } from './screens/GoalsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
  Dashboard: '🏠',
  Calendar: '📅',
  Timer: '⏱',
  Goals: '🎯',
  Settings: '⚙️',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Timer" component={TimerScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    initApiClient().then(() => {
      dispatch(restoreSession());
    });
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashEmoji}>⏱</Text>
        <Text style={styles.splashTitle}>Timeblazer</Text>
        <ActivityIndicator color="#4F46E5" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashEmoji: { fontSize: 60, marginBottom: 12 },
  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
