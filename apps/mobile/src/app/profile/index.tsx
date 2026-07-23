import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ExecutiveDock } from '../../components/ExecutiveDock';

export default function ProfileScreen() {
  const router = useRouter();
  const [voiceWake, setVoiceWake] = useState(true);
  const [urgentInterrupts, setUrgentInterrupts] = useState(true);
  const [autoReschedule, setAutoReschedule] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const toggleSetting = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => {
    Haptics.selectionAsync().catch(() => {});
    setter(!val);
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
        <Text style={styles.headerTitle}>Executive Profile</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="user" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Executive Badge */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>W</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>William Executive</Text>
            <Text style={styles.userRole}>AI Chief of Staff • Active</Text>
          </View>
        </View>

        {/* Section 1: Chief of Staff Preferences */}
        <Text style={styles.sectionTitle}>CHIEF OF STAFF PREFERENCES</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>"Hey William" Wake Word</Text>
              <Text style={styles.settingDesc}>Continuous background voice detection</Text>
            </View>
            <Switch
              value={voiceWake}
              onValueChange={(v) => toggleSetting(setVoiceWake, v)}
              trackColor={{ false: '#D1D5DB', true: '#111827' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Unprompted Urgent Interrupts</Text>
              <Text style={styles.settingDesc}>Allow William to zoom in on high-priority alerts</Text>
            </View>
            <Switch
              value={urgentInterrupts}
              onValueChange={(v) => toggleSetting(setUrgentInterrupts, v)}
              trackColor={{ false: '#D1D5DB', true: '#111827' }}
            />
          </View>
        </View>

        {/* Section 2: Execution & Calendar Rules */}
        <Text style={styles.sectionTitle}>EXECUTION & CALENDAR RULES</Text>
        <View style={styles.settingsGroup}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Auto-Accept Conflict Resolutions</Text>
              <Text style={styles.settingDesc}>Automatically shift overlapping meetings</Text>
            </View>
            <Switch
              value={autoReschedule}
              onValueChange={(v) => toggleSetting(setAutoReschedule, v)}
              trackColor={{ false: '#D1D5DB', true: '#111827' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingLabel}>Tactile Haptic Feedback</Text>
              <Text style={styles.settingDesc}>Node selection and card snap haptics</Text>
            </View>
            <Switch
              value={hapticFeedback}
              onValueChange={(v) => toggleSetting(setHapticFeedback, v)}
              trackColor={{ false: '#D1D5DB', true: '#111827' }}
            />
          </View>
        </View>

        {/* Section 3: Context Adapters */}
        <Text style={styles.sectionTitle}>CONTEXT ADAPTERS</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.integrationRow}>
            <View style={styles.integrationLeft}>
              <Feather name="layers" size={18} color="#059669" />
              <Text style={styles.integrationName}>Metaphor Context Engine (V1 Mock)</Text>
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

      {/* Floating Navigation Dock */}
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
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  userRole: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
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
    height: 0.5,
    backgroundColor: '#E5E7EB',
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
    color: '#059669',
  },
});
