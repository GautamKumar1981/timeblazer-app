import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { store } from './src/store/store';
import { restoreSession } from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/theme/colors';

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    background: colors.background,
    surface: colors.surface,
  },
};

function AppContent() {
  useEffect(() => {
    store.dispatch(restoreSession());
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider theme={paperTheme}>
        <AppContent />
      </PaperProvider>
    </Provider>
  );
}
