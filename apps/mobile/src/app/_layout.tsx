import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';


export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0C' },
        }}
      />
    </ThemeProvider>
  );
}

