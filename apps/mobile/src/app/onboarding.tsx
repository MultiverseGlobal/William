import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ONBOARDING_QUESTIONS = [
  { key: 'name', question: 'What should I call you?', placeholder: 'Your name or pseudonym...' },
  { key: 'identity', question: 'Who are you striving to become?', placeholder: 'Architect, systems builder, creator...' },
  { key: 'values', question: 'What core values guide your decisions?', placeholder: 'Autonomy, mastery, relentless focus...' },
  { key: 'building', question: 'What main project or vision are you building?', placeholder: 'Mobile companion platform, deep work systems...' },
  { key: 'principles', question: 'What non-negotiable principles rule your life?', placeholder: 'Systems over willpower, focus on high leverage...' }
];

export default function MobileOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentInput, setCurrentInput] = useState('');

  const activeQuestion = ONBOARDING_QUESTIONS[currentStep];

  const handleNext = async () => {
    if (!currentInput.trim()) return;

    const updatedAnswers = { ...answers, [activeQuestion.key]: currentInput.trim() };
    setAnswers(updatedAnswers);
    setCurrentInput('');

    if (currentStep < ONBOARDING_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save completed profile locally and navigate to main app
      const portraitData = {
        name: updatedAnswers.name || 'William User',
        identity: updatedAnswers.identity || 'Systems Architect',
        values: updatedAnswers.values || 'Autonomy, mastery',
        principles: updatedAnswers.principles || 'Systems over willpower',
        strengths: 'Rapid execution',
        blind_spots: 'Over-engineering',
        dreams: updatedAnswers.building || 'High agency execution',
        relationships: 'Core collaborators'
      };

      await AsyncStorage.setItem('william_portrait', JSON.stringify(portraitData));
      await AsyncStorage.setItem('william_onboarded', 'true');

      // Sync with server if connected
      try {
        await fetch('http://localhost:3005/api/portrait', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(portraitData)
        });
      } catch (_) {}

      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.iconCircle}>
              <CompassIcon color="#ffffff" size={18} />
            </View>
            <Text style={styles.headerTitle}>William Companion</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity
              onPress={() => handleNext()}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.12)'
              }}
            >
              <Text style={{ color: '#9ca3af', fontSize: 11, fontWeight: '500' }}>Skip & Learn As I Go</Text>
            </TouchableOpacity>
            <Text style={styles.stepBadge}>{currentStep + 1} / {ONBOARDING_QUESTIONS.length}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Glass Card Container */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Feather name="cpu" size={20} color="#818cf8" />
              <Text style={styles.cardHeaderTitle}>Cognitive Setup</Text>
            </View>


            <Text style={styles.questionText}>{activeQuestion.question}</Text>

            <TextInput
              style={styles.input}
              value={currentInput}
              onChangeText={setCurrentInput}
              placeholder={activeQuestion.placeholder}
              placeholderTextColor="#6b7280"
              autoFocus
              multiline={currentStep > 0}
            />

            <TouchableOpacity
              style={[styles.nextButton, !currentInput.trim() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!currentInput.trim()}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === ONBOARDING_QUESTIONS.length - 1 ? 'Enter William' : 'Continue'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Progress dots */}
          <View style={styles.progressRow}>
            {ONBOARDING_QUESTIONS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === currentStep && styles.dotActive,
                  idx < currentStep && styles.dotCompleted
                ]}
              />
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CompassIcon({ color, size }: { color: string; size: number }) {
  return <Ionicons name="compass-outline" size={size} color={color} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  stepBadge: {
    color: '#818cf8',
    fontSize: 13,
    fontWeight: '600'
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20
  },
  cardHeaderTitle: {
    color: '#818cf8',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  questionText: {
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 28
  },
  input: {
    backgroundColor: 'rgba(3, 7, 18, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 24,
    minHeight: 50
  },
  nextButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 28
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  },
  dotActive: {
    backgroundColor: '#6366f1',
    width: 20
  },
  dotCompleted: {
    backgroundColor: '#818cf8'
  }
});
