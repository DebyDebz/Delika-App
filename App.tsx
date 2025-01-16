import { Stack } from 'expo-router';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#000000',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    border: '#CCCCCC',
    notification: '#FF0000'
  }
};

export default function App() {
  return (
    <ThemeProvider value={theme}>
      <Stack />
    </ThemeProvider>
  );
} 