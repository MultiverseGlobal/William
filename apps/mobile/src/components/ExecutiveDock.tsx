import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface ExecutiveDockProps {
  onResetOrb?: () => void;
}

export function ExecutiveDock({ onResetOrb }: ExecutiveDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (isKeyboardVisible) return null;

  // Streamlined 4-Tab Execution Suite Layout: Today | Timeline | [ORB HERO] | Briefings | Profile
  const NAV_ITEMS = [
    { id: 'today', label: 'Today', route: '/', icon: 'zap' as const },
    { id: 'schedule', label: 'Timeline', route: '/schedule', icon: 'calendar' as const },
    { id: 'hub', label: 'Orb', route: '/', icon: 'disc' as const, isCenter: true },
    { id: 'briefings', label: 'Briefings', route: '/briefings', icon: 'file-text' as const },
    { id: 'profile', label: 'Profile', route: '/profile', icon: 'user' as const },
  ];

  return (
    <View style={styles.dockWrapper} pointerEvents="box-none">
      <View style={styles.dockBar}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.route || (item.route !== '/' && pathname.startsWith(item.route));

          if (item.isCenter) {
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  onResetOrb?.();
                  if (pathname !== '/') {
                    router.push('/');
                  }
                }}
                style={styles.centerHeroBtn}
              >
                <View style={[styles.centerHeroInner, isActive && styles.centerHeroInnerActive]}>
                  <Feather name="disc" size={22} color="#FFFFFF" />
                </View>
                <Text style={styles.centerHeroLabel}>Orb</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push(item.route as any);
              }}
              style={[styles.dockItem, isActive && styles.dockItemActive]}
            >
              <Feather
                name={item.icon}
                size={18}
                color={isActive ? '#111827' : '#9CA3AF'}
              />
              <Text style={[styles.dockLabel, isActive && styles.dockLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 90,
  },
  dockBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    gap: 4,
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  dockItemActive: {
    backgroundColor: '#F3F4F6',
  },
  dockLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    fontWeight: '500',
  },
  dockLabelActive: {
    color: '#111827',
    fontWeight: '700',
  },
  centerHeroBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  centerHeroInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  centerHeroInnerActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
  },
  centerHeroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
});
