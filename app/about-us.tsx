import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import AboutUs from '../components/AboutUs';

export default function AboutUsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      <AboutUs />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
