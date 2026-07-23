import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

interface MorphHeaderProps {
  title: string;
  fileCount: number;
  isEditMode: boolean;
  onBack: () => void;
  onToggleEdit: () => void;
  onDeleteAction?: () => void;
  onShareAction?: () => void;
  onAddAction?: () => void;
}

export const MorphHeader: React.FC<MorphHeaderProps> = ({
  title,
  fileCount,
  isEditMode,
  onBack,
  onToggleEdit,
  onDeleteAction,
  onShareAction,
  onAddAction,
}) => {
  const defaultStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isEditMode ? 0 : 1, { duration: 280, easing: Easing.ease }),
    transform: [
      { translateY: withTiming(isEditMode ? -8 : 0, { duration: 320, easing: Easing.out(Easing.ease) }) },
    ],
  }));

  const editStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isEditMode ? 1 : 0, { duration: 280, easing: Easing.ease }),
    transform: [
      { translateY: withTiming(isEditMode ? 0 : 8, { duration: 320, easing: Easing.out(Easing.ease) }) },
    ],
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        {/* Left: Back Arrow */}
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.6}>
          <Feather name="arrow-left" size={20} color="#374151" />
        </TouchableOpacity>

        {/* Center */}
        <View style={styles.centerArea}>
          {/* Default: Title + File Count */}
          <Animated.View
            style={[styles.titleGroup, defaultStyle]}
            pointerEvents={isEditMode ? 'none' : 'auto'}
          >
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{fileCount} files</Text>
          </Animated.View>

          {/* Edit Mode: Action Toolbar */}
          <Animated.View
            style={[styles.toolbarGroup, editStyle]}
            pointerEvents={isEditMode ? 'auto' : 'none'}
          >
            <TouchableOpacity style={styles.toolBtn} onPress={onDeleteAction} activeOpacity={0.6}>
              <Feather name="trash-2" size={18} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={onShareAction} activeOpacity={0.6}>
              <Feather name="share" size={18} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={onAddAction} activeOpacity={0.6}>
              <Feather name="plus-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Right: Edit / Check toggle */}
        <TouchableOpacity style={styles.iconBtn} onPress={onToggleEdit} activeOpacity={0.6}>
          {isEditMode ? (
            <Feather name="check" size={20} color="#111827" />
          ) : (
            <Feather name="edit-2" size={17} color="#6B7280" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export const FloatingFooter: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <View style={styles.footerWrapper} pointerEvents="box-none">
    <TouchableOpacity activeOpacity={0.8} style={styles.footerPill} onPress={onPress}>
      <Text style={styles.footerText}>Tap to talk</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#ECEEF2',
    zIndex: 50,
  },
  headerBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerArea: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  titleGroup: {
    position: 'absolute',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  toolbarGroup: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerWrapper: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
  },
  footerPill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '400',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
});
