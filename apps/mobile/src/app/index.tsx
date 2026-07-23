import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useWilliamStore, WilliamFileCard } from '../store/useWilliamStore';
import { NaturalVoiceView } from '../components/NaturalVoiceView';
import { OrbConstellationView } from '../components/OrbConstellationView';
import { FileCardStack } from '../components/FileCardStack';
import { MorphHeader } from '../components/MorphHeader';
import { ExecutiveDock } from '../components/ExecutiveDock';
import { ZoomCard } from '../components/ZoomCard';

import { useRouter } from 'expo-router';
import { Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import { sendChatMessage } from '../services/apiService';

import { fetchActiveCommands, createNewCommand } from '../services/dbService';

export default function HomeScreen() {
  const router = useRouter();
  const {
    stage,
    activeNode,
    isEditMode,
    queryText,
    files,
    nodes,
    setStage,
    selectNode,
    toggleEditMode,
    resetToListening,
    deleteLastFile,
    addFile,
  } = useWilliamStore();

  const [inputMode, setInputMode] = useState<'voice' | 'text'>('text');
  const [promptText, setPromptText] = useState('');
  const [activeCommand, setActiveCommand] = useState<any>(null);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFocusModal, setShowFocusModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');

  useEffect(() => {
    fetchActiveCommands().then((data) => {
      if (data && data.length > 0) {
        setActiveCommand(data[0]);
      }
    });
  }, []);

  const handleCreateNewCommand = async () => {
    if (!newItemTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    const title = newItemTitle;
    setNewItemTitle('');
    setShowAddModal(false);

    try {
      const created = await createNewCommand(title, '30m');
      setActiveCommand(created);
    } catch (err) {
      console.log('Error creating command in Supabase:', err);
    }
  };

  const QUICK_PROMPTS = [
    'Show Apple meeting files',
    "Summarize today's agenda",
    'Check schedule conflicts',
  ];

  const handlePromptSubmit = async (text: string) => {
    if (!text.trim()) return;
    const currentText = text;
    setPromptText('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    // Stream real Claude 3.5 Sonnet response directly from OpenRouter
    const res = await sendChatMessage(currentText);
    setSelectedFile({
      id: `chat_${Date.now()}`,
      name: `William AI (Claude 3.5 Sonnet)`,
      format: res.reply,
      size: `Query: "${currentText}"`,
      timestamp: res.time,
      iconType: 'shield',
    });
  };

  const [selectedFile, setSelectedFile] = useState<WilliamFileCard | null>(null);

  const handleHeaderDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    deleteLastFile();
  };

  const handleHeaderShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Share.share({
        message: `William Executive Briefing: ${activeNode.label} (${files.length} items)`,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const handleHeaderAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const newDoc: WilliamFileCard = {
      id: `f_${Date.now()}`,
      name: `Executive_Memo_${files.length + 1}`,
      format: 'DOCX • 1.2 MB',
      size: '1.2 MB',
      timestamp: 'Just now',
      iconType: 'document',
    };
    addFile(newDoc);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ECEEF2" />

      {/* Mode Switcher Header Pill */}
      {stage === 'LISTENING' && (
        <View style={styles.modeSwitcherWrapper} pointerEvents="box-none">
          <View style={styles.modeSwitcher}>
            <TouchableOpacity
              onPress={() => setInputMode('voice')}
              style={[styles.modeBtn, inputMode === 'voice' && styles.modeBtnActive]}
            >
              <Feather
                name="mic"
                size={13}
                color={inputMode === 'voice' ? '#111827' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.modeText,
                  inputMode === 'voice' && styles.modeTextActive,
                ]}
              >
                Voice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setInputMode('text')}
              style={[styles.modeBtn, inputMode === 'text' && styles.modeBtnActive]}
            >
              <Feather
                name="message-square"
                size={13}
                color={inputMode === 'text' ? '#111827' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.modeText,
                  inputMode === 'text' && styles.modeTextActive,
                ]}
              >
                Text Prompt
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Stage 1: Natural Voice Listening or Text Prompt View */}
      {stage === 'LISTENING' && (
        <>
          {inputMode === 'voice' ? (
            <NaturalVoiceView
              queryText={queryText}
              onVoiceComplete={() => setStage('PROCESSING')}
            />
          ) : (
            <View style={styles.textPromptContainer}>
              {/* Daily Command Hero Card */}
              <View style={styles.dailyCommandCard}>
                <View style={styles.dailyCommandHeader}>
                  <View style={styles.commandTag}>
                    <Feather name="zap" size={12} color="#2563EB" />
                    <Text style={styles.commandTagText}>DAILY COMMAND</Text>
                  </View>
                  <Text style={styles.commandTime}>{activeCommand?.estimated_duration || '45m'}</Text>
                </View>
                <Text style={styles.commandTitle}>
                  {activeCommand?.title || 'Finalize Chief of Staff Platform Architecture'}
                </Text>
                <Text style={styles.commandSubtitle}>High-leverage focus: Execution state & context adapters.</Text>
                <TouchableOpacity
                  style={styles.startCommandBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                    setShowFocusModal(true);
                  }}
                >
                  <Feather name="play-circle" size={16} color="#FFFFFF" />
                  <Text style={styles.startCommandText}>Start Focus Session</Text>
                </TouchableOpacity>
              </View>

              {/* Suggestions */}
              <View style={styles.chipsRow}>
                {QUICK_PROMPTS.map((chip, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.chip}
                    onPress={() => handlePromptSubmit(chip)}
                  >
                    <Feather name="zap" size={11} color="#4B5563" />
                    <Text style={styles.chipText}>{chip}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Input Bar */}
              <View style={styles.inputBar}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Tell William what to pull up..."
                  placeholderTextColor="#9CA3AF"
                  value={promptText}
                  onChangeText={setPromptText}
                  onSubmitEditing={() => handlePromptSubmit(promptText)}
                />
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={() => handlePromptSubmit(promptText)}
                >
                  <Feather name="arrow-up" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Floating + New Executive Action Item Button */}
              <TouchableOpacity
                style={styles.floatingAddBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  setShowAddModal(true);
                }}
              >
                <Feather name="plus" size={20} color="#FFFFFF" />
                <Text style={styles.floatingAddText}>New Action</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* Stage 2 & 3: Unified 60 FPS Spinning Orb + Particle Explosion + Constellation Nodes */}
      {(stage === 'PROCESSING' || stage === 'CONSTELLATION') && (
        <OrbConstellationView
          nodes={nodes}
          onSelectNode={(node) => selectNode(node)}
          onBack={() => resetToListening()}
          autoExplode={true}
        />
      )}

      {/* Stage 4 & 5: File Card Stack + Edit Mode */}
      {(stage === 'FILE_STACK' || stage === 'EDIT_MODE') && (
        <View style={styles.stackWrapper}>
          <MorphHeader
            title={activeNode.label}
            fileCount={files.length}
            isEditMode={isEditMode}
            onBack={() => setStage('CONSTELLATION')}
            onToggleEdit={toggleEditMode}
            onDeleteAction={handleHeaderDelete}
            onShareAction={handleHeaderShare}
            onAddAction={handleHeaderAdd}
          />

          <FileCardStack
            files={files}
            isEditMode={isEditMode}
            onSelectFile={(file) => setSelectedFile(file)}
          />
        </View>
      )}

      {/* Executive Briefing Detail Drawer Popup */}
      <ZoomCard
        visible={!!selectedFile}
        fileCard={selectedFile}
        onDismiss={() => setSelectedFile(null)}
        onAction={(action) => console.log('Executed:', action)}
      />

      {/* Modal 1: + New Action Item Creator */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Daily Command Action</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Feather name="x" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Finalize Pseudonyms Architecture"
              placeholderTextColor="#9CA3AF"
              value={newItemTitle}
              onChangeText={setNewItemTitle}
              autoFocus
            />
            <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleCreateNewCommand}>
              <Text style={styles.modalSubmitText}>Save to Supabase Cloud</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal 2: Focus Session Timer Overlay */}
      <Modal visible={showFocusModal} transparent animationType="fade">
        <View style={styles.focusOverlay}>
          <View style={styles.focusBox}>
            <View style={styles.focusBadge}>
              <Feather name="zap" size={14} color="#2563EB" />
              <Text style={styles.focusBadgeText}>DEEP WORK FOCUS ACTIVE</Text>
            </View>
            <Text style={styles.focusTitle}>
              {activeCommand?.title || 'Finalize Platform Architecture'}
            </Text>
            <Text style={styles.focusTimerText}>44 : 58</Text>
            <Text style={styles.focusSubText}>Notifications silenced • High-agency mode</Text>
            <TouchableOpacity
              style={styles.focusStopBtn}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                setShowFocusModal(false);
              }}
            >
              <Feather name="check-circle" size={16} color="#FFFFFF" />
              <Text style={styles.focusStopText}>Complete Focus Block</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Bottom Navigation Dock (Hidden during fullscreen ChatGPT-style Voice Listening) */}
      {!(stage === 'LISTENING' && inputMode === 'voice') && (
        <ExecutiveDock onResetOrb={() => setStage('PROCESSING')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEEF2',
  },
  modeSwitcherWrapper: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 80,
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  modeBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  modeTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  textPromptContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  dailyCommandCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  dailyCommandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commandTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  commandTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  commandTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  commandTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  commandSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 14,
  },
  startCommandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  startCommandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  promptHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  promptSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackWrapper: {
    flex: 1,
    position: 'relative',
  },
  floatingAddBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  floatingAddText: {
    fontSize: 13,
    fontWeight: '700',
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
  focusOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  focusBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  focusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  focusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  focusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  focusTimerText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: 2,
    marginBottom: 8,
  },
  focusSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 24,
  },
  focusStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  focusStopText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});