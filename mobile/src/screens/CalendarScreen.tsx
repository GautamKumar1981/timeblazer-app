import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { FAB } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { format, addDays, subDays, parseISO } from 'date-fns';
import type { AppDispatch, RootState } from '../store/store';
import { fetchTimeboxes, createTimebox, setSelectedDate } from '../store/slices/timeboxSlice';
import TimeboxCard from '../components/TimeboxCard';
import { colors, categoryColors } from '../theme/colors';
import type { TimeboxCategory } from '../types';

const CATEGORIES: TimeboxCategory[] = ['Work', 'Meetings', 'Breaks', 'Learning', 'Personal'];

interface NewTimeboxForm {
  title: string;
  startTime: string;
  endTime: string;
  category: TimeboxCategory;
}

const DEFAULT_FORM: NewTimeboxForm = {
  title: '',
  startTime: '09:00',
  endTime: '10:00',
  category: 'Work',
};

export default function CalendarScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: timeboxes, selectedDate, isLoading } = useSelector(
    (s: RootState) => s.timeboxes
  );
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewTimeboxForm>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadTimeboxes = useCallback(() => {
    dispatch(fetchTimeboxes(selectedDate));
  }, [dispatch, selectedDate]);

  useEffect(() => {
    loadTimeboxes();
  }, [loadTimeboxes]);

  const handlePrevDay = () => dispatch(setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd')));
  const handleNextDay = () => dispatch(setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd')));

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const startISO = `${selectedDate}T${form.startTime}:00`;
      const endISO = `${selectedDate}T${form.endTime}:00`;
      const start = new Date(startISO);
      const end = new Date(endISO);
      const duration = Math.max(5, Math.floor((end.getTime() - start.getTime()) / 60000));

      await dispatch(
        createTimebox({
          title: form.title.trim(),
          category: form.category,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          duration,
          date: selectedDate,
          status: 'pending',
        })
      ).unwrap();
      setForm(DEFAULT_FORM);
      setShowModal(false);
    } catch {
      // error handled by redux
    } finally {
      setSubmitting(false);
    }
  };

  const displayDate = parseISO(selectedDate);
  const isToday = format(new Date(), 'yyyy-MM-dd') === selectedDate;

  return (
    <View style={styles.container}>
      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity style={styles.navBtn} onPress={handlePrevDay}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.dateCenter}>
          <Text style={styles.dateMain}>
            {isToday ? 'Today' : format(displayDate, 'EEEE')}
          </Text>
          <Text style={styles.dateSub}>{format(displayDate, 'MMMM d, yyyy')}</Text>
        </View>

        <TouchableOpacity style={styles.navBtn} onPress={handleNextDay}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Timebox count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>{timeboxes.length} timeboxes</Text>
        {!isToday && (
          <TouchableOpacity
            onPress={() => dispatch(setSelectedDate(format(new Date(), 'yyyy-MM-dd')))}
          >
            <Text style={styles.todayLink}>Jump to Today</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Timebox List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadTimeboxes}
            tintColor={colors.primary}
          />
        }
      >
        {timeboxes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No timeboxes yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to plan your {isToday ? 'day' : format(displayDate, 'EEEE')}.
            </Text>
          </View>
        ) : (
          timeboxes.map((tb) => <TimeboxCard key={tb.id} timebox={tb} />)
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => setShowModal(true)}
      />

      {/* Create Modal */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Timebox</Text>

            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Deep work session"
              placeholderTextColor={colors.textLight}
              value={form.title}
              onChangeText={(v) => setForm((f) => ({ ...f, title: v }))}
            />

            <View style={styles.timeRow}>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>Start</Text>
                <TextInput
                  style={styles.input}
                  placeholder="09:00"
                  placeholderTextColor={colors.textLight}
                  value={form.startTime}
                  onChangeText={(v) => setForm((f) => ({ ...f, startTime: v }))}
                />
              </View>
              <View style={styles.timeField}>
                <Text style={styles.fieldLabel}>End</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10:00"
                  placeholderTextColor={colors.textLight}
                  value={form.endTime}
                  onChangeText={(v) => setForm((f) => ({ ...f, endTime: v }))}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const catColor = categoryColors[cat];
                const selected = form.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      selected && { backgroundColor: catColor },
                      !selected && { borderColor: catColor, borderWidth: 1.5 },
                    ]}
                    onPress={() => setForm((f) => ({ ...f, category: cat }))}
                  >
                    <Text style={[styles.catChipText, { color: selected ? '#fff' : catColor }]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setForm(DEFAULT_FORM);
                  setShowModal(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, submitting && styles.createBtnDisabled]}
                onPress={handleCreate}
                disabled={submitting}
              >
                <Text style={styles.createBtnText}>
                  {submitting ? 'Creating…' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.primary}15`,
  },
  navBtnText: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '600',
    lineHeight: 32,
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateMain: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  dateSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  todayLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeField: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  createBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
