import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NotificationProvider } from "../context/NotificationContext"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "expo-router"
import { Animated, TouchableOpacity } from "react-native"
import Profile from "../components/Profile"
import { SelectedBranchProvider } from '../context/SelectedBranchContext'
import { Slot } from 'expo-router'

export default function RootLayout() {
  const router = useRouter()
  const [isProfileVisible, setIsProfileVisible] = useState(false)
  const slideAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!globalThis.userData) {
      router.replace("/")
    }
  }, [])

  const toggleProfile = () => {
    if (isProfileVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsProfileVisible(false))
    } else {
      setIsProfileVisible(true)
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }

  return (
    <SafeAreaProvider>
      <SelectedBranchProvider>
        <NotificationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="home" />
            <Stack.Screen name="menu_report" />
          </Stack>
          <Profile 
            isVisible={isProfileVisible}
            onClose={() => toggleProfile()}
            slideAnim={slideAnim}
          />
          <TouchableOpacity onPress={toggleProfile}>
            {/* Your existing profile picture component */}
          </TouchableOpacity>
        </NotificationProvider>
      </SelectedBranchProvider>
    </SafeAreaProvider>
  )
}