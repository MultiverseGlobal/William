import * as Speech from 'expo-speech';

export const speakBriefing = (text: string) => {
  try {
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.95,
    });
  } catch (err) {
    console.log('TTS Error:', err);
  }
};

export const stopSpeech = () => {
  try {
    Speech.stop();
  } catch (err) {
    console.log('Stop TTS Error:', err);
  }
};
