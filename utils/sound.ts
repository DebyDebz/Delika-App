import { Audio } from 'expo-av';

export async function playNotificationSound() {
  try {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/notification.wav'),
      { shouldPlay: true }
    );

    // Unload after a short delay
    setTimeout(async () => {
      await sound.unloadAsync();
    }, 1000);

  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
} 