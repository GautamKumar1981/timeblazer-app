import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { goalsAPI } from '../services/api';
import { addGoal, Goal, RootState, setGoals } from '../store/store';
import GoalCard from '../components/GoalCard';

function yearProgress(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  return Math.round(
    ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) *
      100,
  );
}

const EMPTY_FORM = {
  title: '',
  description: '',
  targetDate: '',
  priority: 'medium' as Goal['priority'],
};

const GoalsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const goals = useSelector((s: RootState) => s.goals.items);
  const isLoading = useSelector((s: RootState) => s.goals.isLoading);

  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadGoals = useCallback(async () => {
    try {
      const res = await goalsAPI.getGoals();
      dispatch(setGoals(res.data?.goals ?? res.data ?? []));
    } catch {
      dispatch(setGoals([]));
    }
  }, [dispatch]);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.targetDate) return;
    setSaving(true);
    try {
      const res = await goalsAPI.createGoal({
        title: form.title.trim(),
        description: form.description.trim(),
        targetDate: form.targetDate,
        priority: form.priority,
        progress: 0,
        isCompleted: false,
      });
      dispatch(addGoal(res.data?.goal ?? res.data));
      setModalVisible(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  };

  const progress = yearProgress();
  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  return (
    <View style={styles.container}>
      {/* Year progress */}
      <View style={styles.yearProgress}>
        <View style={styles.yearProgressHeader}>
          <Text style={styles.yearProgressTitle}>
            {new Date().getFullYear()} Progress
          </Text>
          <Text style={styles.yearProgressPercent}>{progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#4A90E2" />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {activeGoals.length === 0 && completedGoals.length === 0 && (
            <Text style={styles.emptyText}>
              No goals yet. Tap + to add your first goal!
            </Text>
          )}

          {activeGoals.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Active Goals</Text>
              {activeGoals.map((g) => (
                <GoalCard key={g.id} goal={g} onPress={() => {}} />
              ))}
            </>
          )}

          {completedGoals.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Completed</Text>
              {completedGoals.map((g) => (
                <GoalCard key={g.id} goal={g} onPress={() => {}} />
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add goal modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Goal</Text>

            <TextInput
              style={styles.input}
              placeholder="Goal title *"
              placeholderTextColor="#8888AA"
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor="#8888AA"
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={styles.input}
              placeholder="Target date (YYYY-MM-DD) *"
              placeholderTextColor="#8888AA"
              value={form.targetDate}
              onChangeText={(v) => setForm((f) => ({ ...f, targetDate: v }))}
            />

            <Text style={styles.fieldLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {(['high', 'medium', 'low'] as Goal['priority'][]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityBtn,
                    form.priority === p && styles.priorityBtnSelected,
                  ]}
                  onPress={() => setForm((f) => ({ ...f, priority: p }))}
                >
                  <Text
                    style={[
                      styles.priorityBtnText,
                      form.priority === p && styles.priorityBtnTextSelected,
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setForm(EMPTY_FORM);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? 'Saving…' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  yearProgress: {
    backgroundColor: '#16213E',
    padding: 16,
  },
  yearProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  yearProgressTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  yearProgressPercent: {
    color: '#4A90E2',
    fontWeight: '700',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2A2A4A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyText: {
    color: '#8888AA',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#16213E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1A1A2E',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A2A4A',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    color: '#8888AA',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 2,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  priorityBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A4A',
    alignItems: 'center',
  },
  priorityBtnSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  priorityBtnText: {
    color: '#8888AA',
    fontWeight: '500',
    fontSize: 13,
  },
  priorityBtnTextSelected: {
    color: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A90E2',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#4A90E2',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default GoalsScreen;
