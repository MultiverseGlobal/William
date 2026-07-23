import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ExecutiveDock } from '../../components/ExecutiveDock';
import { ZoomCard } from '../../components/ZoomCard';
import { WilliamFileCard } from '../../store/useWilliamStore';

export default function IntelligenceScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<WilliamFileCard | null>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const KNOWLEDGE_NODES = [
    {
      id: 'k1',
      title: 'Pseudonyms Market Analysis Q3',
      category: 'Market Intelligence',
      fileType: 'PDF Report',
      size: '18,5 MB',
      updated: 'Yesterday',
      summary: 'Quarterly competitive analysis highlighting AI assistant position and mobile interface trends.',
    },
    {
      id: 'k2',
      title: 'Executive Briefing Templates',
      category: 'Templates',
      fileType: 'Markdown',
      size: '420 KB',
      updated: '3 days ago',
      summary: 'Standardized structure for daily executive syncs, mission tracking, and schedule conflict resolution.',
    },
    {
      id: 'k3',
      title: 'William Web-v2 Architecture Notes',
      category: 'Engineering',
      fileType: 'Doc',
      size: '3,4 MB',
      updated: '1 week ago',
      summary: 'Technical specification for companion orb renderer, brain gateway adapter, and Next.js co-located endpoints.',
    },
  ];

  const filteredNodes = KNOWLEDGE_NODES.filter(node =>
    node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenNode = (node: typeof KNOWLEDGE_NODES[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedNode({
      id: node.id,
      name: node.title,
      format: node.fileType,
      size: node.size,
      timestamp: node.updated,
      iconType: 'document',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECEEF2" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Knowledge Intelligence</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="search" size={18} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Feather name="search" size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search William's knowledge graph..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content List */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>INDEXED KNOWLEDGE NODES ({filteredNodes.length})</Text>
        {filteredNodes.map((node) => (
          <View key={node.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{node.category.toUpperCase()}</Text>
              </View>
              <Text style={styles.updatedText}>{node.updated}</Text>
            </View>

            <Text style={styles.cardTitle}>{node.title}</Text>
            
            <View style={styles.metaRow}>
              <Feather name="file-text" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{node.fileType} • {node.size}</Text>
            </View>

            <Text style={styles.summaryText}>{node.summary}</Text>

            <TouchableOpacity style={styles.openBtn} onPress={() => handleOpenNode(node)}>
              <Text style={styles.openBtnText}>Open Knowledge Node</Text>
              <Feather name="arrow-right" size={12} color="#111827" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Intelligence Node Detail Drawer */}
      <ZoomCard
        visible={!!selectedNode}
        fileCard={selectedNode}
        onDismiss={() => setSelectedNode(null)}
        onAction={(action) => console.log('Action:', action)}
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
  searchWrapper: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
    marginTop: 4,
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
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  updatedText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#6B7280',
  },
  summaryText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 12,
  },
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  openBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
});
