import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import HelpSupport from '../components/HelpSupport';

export default function HelpSupportScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      <HelpSupport />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
