import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ExecutiveDock } from '../../components/ExecutiveDock';
import { ZoomCard } from '../../components/ZoomCard';
import { resolveCalendarConflict, CalendarEvent } from '../../services/calendarService';
import { fetchCalendarEvents, createNewCalendarEvent } from '../../services/dbService';
import { WilliamFileCard } from '../../store/useWilliamStore';

export default function ScheduleScreen() {
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<WilliamFileCard | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('14:00 PM');

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const loadEvents = () => {
    fetchCalendarEvents().then((data) => {
      if (data && data.length > 0) {
        setEvents(data.map(d => ({
          id: d.id,
          time: d.time,
          duration: d.duration || '30m',
          title: d.title,
          location: d.location || 'Remote',
          status: d.status || 'upcoming',
          conflictNotice: d.conflict_notice,
        })));
      }
    });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async () => {
    if (!newTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const title = newTitle;
    const time = newTime;
    setNewTitle('');
    setShowAddModal(false);

    try {
      await createNewCalendarEvent(title, time, 'Private Workstation');
      loadEvents();
    } catch (err) {
      console.log('Error saving event to Supabase:', err);
    }
  };

  const handleAcceptReschedule = (eventId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setEvents((prev) => resolveCalendarConflict(prev, eventId));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECEEF2" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart Schedule</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            setShowAddModal(true);
          }}
        >
          <Feather name="plus" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Today Banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.dateLabel}>TODAY • THURSDAY</Text>
          <Text style={styles.headlineText}>20 minutes ahead of schedule</Text>
        </View>
        <View style={styles.aiBadge}>
          <Feather name="zap" size={12} color="#2563EB" />
          <Text style={styles.aiBadgeText}>AI Managed</Text>
        </View>
      </View>

      {/* Timeline */}
      <ScrollView contentContainerStyle={styles.timelineContainer} showsVerticalScrollIndicator={false}>
        {events.map((evt) => (
          <View key={evt.id} style={styles.timeRow}>
            {/* Left Time Label */}
            <View style={styles.timeLeft}>
              <Text style={styles.timeText}>{evt.time}</Text>
              <Text style={styles.durationText}>{evt.duration}</Text>
            </View>

            {/* Event Content Card */}
            <View style={[styles.eventCard, evt.status === 'conflict' && styles.conflictCard]}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{evt.title}</Text>
                {evt.status === 'active' && (
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>NOW</Text>
                  </View>
                )}
              </View>

              <View style={styles.metaRow}>
                <Feather name="map-pin" size={12} color="#9CA3AF" />
                <Text style={styles.metaText}>{evt.location}</Text>
              </View>

              {evt.status === 'conflict' && (
                <View style={styles.conflictBox}>
                  <Feather name="alert-triangle" size={14} color="#DC2626" />
                  <Text style={styles.conflictText}>{evt.conflictNotice}</Text>
                  <TouchableOpacity
                    style={styles.rescheduleBtn}
                    onPress={() => handleAcceptReschedule(evt.id)}
                  >
                    <Text style={styles.rescheduleBtnText}>Accept Reschedule</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal: + New Schedule Event Creator */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Timeline Event</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Feather name="x" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Event Title (e.g. Leadership Strategy Sync)"
              placeholderTextColor="#9CA3AF"
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Scheduled Time (e.g. 14:00 PM)"
              placeholderTextColor="#9CA3AF"
              value={newTime}
              onChangeText={setNewTime}
            />
            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateEvent}>
              <Text style={styles.modalSubmitText}>Save Event</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Bottom Navigation Dock */}
      <ExecutiveDock />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEEF2',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  headlineText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  timelineContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 14,
  },
  timeLeft: {
    width: 70,
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  durationText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  eventCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  conflictCard: {
    borderColor: '#FCA5A5',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  conflictBox: {
    marginTop: 10,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  conflictText: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 16,
  },
  rescheduleBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  rescheduleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  modalInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
  },
  modalSubmitBtn: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
