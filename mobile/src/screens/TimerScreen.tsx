import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import MobileTimer from '../components/MobileTimer';
import { colors } from '../theme/colors';

export default function TimerScreen() {
  const activeTimebox = useSelector((s: RootState) => s.timeboxes.activeTimebox);

  if (!activeTimebox) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>⏱</Text>
        <Text style={styles.emptyTitle}>No active timebox</Text>
        <Text style={styles.emptySub}>Start one from the Calendar tab</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <MobileTimer
        timebox={activeTimebox}
        onComplete={() => {}}
        onAddFiveMinutes={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.timerBackground },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.timerBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  emptySub: { fontSize: 15, color: colors.textSecondaryOnDark },
});
