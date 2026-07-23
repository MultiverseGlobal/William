import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Share } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ExecutiveDock } from '../../components/ExecutiveDock';
import { ZoomCard } from '../../components/ZoomCard';
import { fetchBriefings } from '../../services/dbService';
import { WilliamFileCard } from '../../store/useWilliamStore';

export default function BriefingsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'urgent' | 'digest'>('all');
  const [selectedBriefing, setSelectedBriefing] = useState<WilliamFileCard | null>(null);
  const [briefingsList, setBriefingsList] = useState<any[]>([]);

  useEffect(() => {
    fetchBriefings().then((data) => {
      if (data && data.length > 0) {
        setBriefingsList(data);
      }
    });
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleOpenDrawer = (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedBriefing({
      id: item.id,
      name: item.title,
      format: item.subtitle,
      size: 'Auto-Summary',
      timestamp: item.time,
      iconType: item.urgent ? 'shield' : 'document',
    });
  };

  const handleShare = async (item: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Share.share({
        message: `${item.title}\n${item.subtitle}\n\n${item.body}`,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const filteredBriefings = briefingsList.filter((b) => {
    if (filter === 'urgent') return b.urgent;
    if (filter === 'digest') return b.type === 'digest';
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECEEF2" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Executive Briefings</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setFilter(prev => prev === 'all' ? 'urgent' : prev === 'urgent' ? 'digest' : 'all');
          }}
        >
          <Feather name="sliders" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['all', 'urgent', 'digest'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setFilter(tab);
            }}
            style={[styles.filterChip, filter === tab && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === tab && styles.filterChipTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredBriefings.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.88}
            onPress={() => handleOpenDrawer(item)}
            style={[styles.card, item.urgent && styles.urgentCard]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.badgeRow}>
                {item.urgent ? (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>URGENT</Text>
                  </View>
                ) : (
                  <View style={styles.digestBadge}>
                    <Text style={styles.digestBadgeText}>DIGEST</Text>
                  </View>
                )}
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </View>

            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            
            <View style={styles.bodyBox}>
              <Text style={styles.bodyText}>{item.body}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => handleOpenDrawer(item)}
              >
                <Text style={styles.primaryActionText}>Action Item</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryActionBtn}
                onPress={() => handleShare(item)}
              >
                <Feather name="share-2" size={14} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Detail Drawer Popup */}
      <ZoomCard
        visible={!!selectedBriefing}
        fileCard={selectedBriefing}
        onDismiss={() => setSelectedBriefing(null)}
        onAction={(action) => console.log('Executed:', action)}
      />

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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  urgentCard: {
    borderColor: '#FCA5A5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgentBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  digestBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  digestBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4F46E5',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
  },
  bodyBox: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryActionBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  primaryActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
