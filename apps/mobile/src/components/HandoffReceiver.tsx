import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useHandoffReceiver } from '../hooks/useHandoff';
import { Colors } from '../theme/colors';
import { MonitorUp } from 'lucide-react-native';

export function HandoffReceiver() {
  // Hardcoded for the current user for simplicity in this version
  const { activeSession } = useHandoffReceiver("89a5843a-23b6-411a-ab60-123456789abc");

  if (!activeSession) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.bubble} activeOpacity={0.8}>
        <MonitorUp size={20} color="#000" />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Resume from {activeSession.app}</Text>
          <Text style={styles.subtitle}>Tap to open {activeSession.path}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    zIndex: 100,
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  textContainer: {
    marginLeft: 12,
  },
  title: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 11,
  },
});
