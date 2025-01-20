import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import HelpSupport from '../components/HelpSupport';

export default function HelpSupportScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerTitleAlign: 'center',
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
  headerTitle: {
    marginLeft: -10,
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: -10,
  },
});
