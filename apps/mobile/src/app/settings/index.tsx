import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ExecutiveDock } from '../../components/ExecutiveDock';

export default function SettingsScreen() {
  const router = useRouter();
  const [voiceWake, setVoiceWake] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoReschedule, setAutoReschedule] = useState(false);
  const [urgentInterrupts, setUrgentInterrupts] = useState(true);

  const toggleSetting = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => {
    Haptics.selectionAsync().catch(() => {});
    setter(val);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECEEF2" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chief of Staff Settings</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="shield" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {/* Companion Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>W</Text>
          </View>
          <View>
            <Text style={styles.profileName}>William</Text>
            <Text style={styles.profileRole}>AI Chief of Staff • Active</Text>
          </View>
        </View>

        {/* Section 1: Voice & Wake Commands */}
        <Text style={styles.sectionTitle}>VOICE & INTELLIGENCE</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>"Hey William" Wake Word</Text>
              <Text style={styles.settingDesc}>Continuous background voice detection</Text>
            </View>
            <Switch value={voiceWake} onValueChange={(v) => toggleSetting(setVoiceWake, v)} trackColor={{ false: '#D1D5DB', true: '#111827' }} />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Unprompted Urgent Interrupts</Text>
              <Text style={styles.settingDesc}>Allow William to zoom in on high-priority alerts</Text>
            </View>
            <Switch value={urgentInterrupts} onValueChange={(v) => toggleSetting(setUrgentInterrupts, v)} trackColor={{ false: '#D1D5DB', true: '#111827' }} />
          </View>
        </View>

        {/* Section 2: Automation Rules */}
        <Text style={styles.sectionTitle}>AUTOMATION & CALENDAR</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Auto-Accept Conflict Resolutions</Text>
              <Text style={styles.settingDesc}>Automatically shift overlapping meetings</Text>
            </View>
            <Switch value={autoReschedule} onValueChange={(v) => toggleSetting(setAutoReschedule, v)} trackColor={{ false: '#D1D5DB', true: '#111827' }} />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Tactile Haptic Feedback</Text>
              <Text style={styles.settingDesc}>Node selection and card snap haptics</Text>
            </View>
            <Switch value={hapticFeedback} onValueChange={(v) => toggleSetting(setHapticFeedback, v)} trackColor={{ false: '#D1D5DB', true: '#111827' }} />
          </View>
        </View>

        {/* Section 3: Integrations */}
        <Text style={styles.sectionTitle}>ACTIVE INTEGRATIONS</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.integrationRow}>
            <View style={styles.integrationLeft}>
              <Feather name="calendar" size={18} color="#2563EB" />
              <Text style={styles.integrationName}>Google Calendar</Text>
            </View>
            <Text style={styles.connectedStatus}>Connected</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.integrationRow}>
            <View style={styles.integrationLeft}>
              <Feather name="layers" size={18} color="#059669" />
              <Text style={styles.integrationName}>Metaphor Context Engine</Text>
            </View>
            <Text style={styles.connectedStatus}>Connected</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.integrationRow}>
            <View style={styles.integrationLeft}>
              <Feather name="compass" size={18} color="#7C3AED" />
              <Text style={styles.integrationName}>Atlas Strategy Gateway</Text>
            </View>
            <Text style={styles.connectedStatus}>Connected</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  profileRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginTop: 8,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  settingDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  integrationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  integrationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  integrationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  connectedStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
});
