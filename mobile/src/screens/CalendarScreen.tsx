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
import { timeboxesAPI } from '../services/api';
import { addTimebox, RootState, setTimeboxes, Timebox } from '../store/store';
import TimeboxCard from '../components/TimeboxCard';

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const EMPTY_FORM = {
  title: '',
  startTime: '',
  endTime: '',
  category: '',
  description: '',
};

const CalendarScreen: React.FC = () => {
  const dispatch = useDispatch();
  const timeboxes = useSelector((s: RootState) => s.timeboxes.items);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadTimeboxes = useCallback(
    async (date: Date) => {
      setLoading(true);
      try {
        const res = await timeboxesAPI.getTimeboxes(toISODate(date));
        dispatch(setTimeboxes(res.data?.timeboxes ?? res.data ?? []));
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    void loadTimeboxes(selectedDate);
  }, [selectedDate, loadTimeboxes]);

  const changeDate = (delta: number) => {
    setSelectedDate((prev) => addDays(prev, delta));
  };

  const handleStatusChange = async (
    timebox: Timebox,
    status: Timebox['status'],
  ) => {
    try {
      await timeboxesAPI.updateStatus(timebox.id, status);
      void loadTimeboxes(selectedDate);
    } catch {
      // silently ignore
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.startTime || !form.endTime) return;
    setSaving(true);
    try {
      const dateStr = toISODate(selectedDate);
      const res = await timeboxesAPI.createTimebox({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        date: dateStr,
        startTime: `${dateStr}T${form.startTime}:00`,
        endTime: `${dateStr}T${form.endTime}:00`,
        status: 'pending',
      });
      dispatch(addTimebox(res.data?.timebox ?? res.data));
      setModalVisible(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  };

  const dateStr = toISODate(selectedDate);
  const dayTimeboxes = timeboxes.filter(
    (t) => t.date === dateStr || t.startTime.startsWith(dateStr),
  );

  return (
    <View style={styles.container}>
      {/* Date navigator */}
      <View style={styles.datePicker}>
        <TouchableOpacity style={styles.navBtn} onPress={() => changeDate(-1)}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
        <TouchableOpacity style={styles.navBtn} onPress={() => changeDate(1)}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#4A90E2" />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {dayTimeboxes.length === 0 ? (
            <Text style={styles.emptyText}>
              No timeboxes on this day. Tap + to add one.
            </Text>
          ) : (
            dayTimeboxes.map((tb) => (
              <TimeboxCard
                key={tb.id}
                timebox={tb}
                onPress={() => {}}
                onStatusChange={handleStatusChange}
              />
            ))
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

      {/* Add timebox modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Timebox</Text>

            <TextInput
              style={styles.input}
              placeholder="Title *"
              placeholderTextColor="#8888AA"
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              placeholderTextColor="#8888AA"
              value={form.category}
              onChangeText={(v) => setForm((f) => ({ ...f, category: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Start time (HH:MM) *"
              placeholderTextColor="#8888AA"
              value={form.startTime}
              onChangeText={(v) => setForm((f) => ({ ...f, startTime: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="End time (HH:MM) *"
              placeholderTextColor="#8888AA"
              value={form.endTime}
              onChangeText={(v) => setForm((f) => ({ ...f, endTime: v }))}
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
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16213E',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBtn: {
    padding: 8,
  },
  navBtnText: {
    color: '#4A90E2',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  dateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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

export default CalendarScreen;
