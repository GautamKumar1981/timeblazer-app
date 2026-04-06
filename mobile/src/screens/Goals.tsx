import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store/store';
import { fetchGoals, createGoal } from '../store/slices/goalsSlice';
import GoalCard from '../components/GoalCard';
import { colors } from '../theme/colors';
import type { GoalPriority } from '../types';

const PRIORITIES: GoalPriority[] = ['low', 'medium', 'high', 'critical'];
const PRIORITY_COLORS: Record<GoalPriority, string> = { low: '#6b7280', medium: '#f59e0b', high: '#3b82f6', critical: '#ef4444' };

export default function Goals() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, isLoading } = useSelector((s: RootState) => s.goals);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<GoalPriority>('medium');

  useEffect(() => { dispatch(fetchGoals()); }, [dispatch]);

  const handleCreate = useCallback(async () => {
    if (!title.trim() || !targetDate.trim()) return;
    await dispatch(createGoal({ title: title.trim(), description: description.trim(), targetDate, priority, progress: 0, isCompleted: false, milestones: [] })).unwrap();
    setTitle(''); setDescription(''); setTargetDate(''); setPriority('medium');
    setShowModal(false);
  }, [dispatch, title, description, targetDate, priority]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No goals yet</Text>
            <Text style={styles.emptySub}>Tap + to set your first goal</Text>
          </View>
        ) : items.map((g) => <GoalCard key={g.id} goal={g} />)}
      </ScrollView>
      <FAB icon="plus" style={styles.fab} color="#fff" onPress={() => setShowModal(true)} />
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.modalTitle}>New Goal</Text>
            <Text style={styles.label}>Title *</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Goal title" placeholderTextColor={colors.textLight} />
            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Optional" placeholderTextColor={colors.textLight} multiline />
            <Text style={styles.label}>Target Date (YYYY-MM-DD) *</Text>
            <TextInput style={styles.input} value={targetDate} onChangeText={setTargetDate} placeholder="2024-12-31" placeholderTextColor={colors.textLight} />
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity key={p} style={[styles.priorityChip, priority === p && { backgroundColor: PRIORITY_COLORS[p] }]} onPress={() => setPriority(p)}>
                  <Text style={[styles.priorityChipText, { color: priority === p ? '#fff' : PRIORITY_COLORS[p] }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreate}><Text style={styles.createText}>Create</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingTop: 12, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 24, backgroundColor: colors.primary, borderRadius: 16 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.text, marginBottom: 14 },
  priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  priorityChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: colors.border },
  priorityChipText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  createBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: colors.primary },
  createText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
