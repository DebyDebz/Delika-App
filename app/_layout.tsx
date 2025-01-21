import { Stack } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { NotificationProvider } from "../context/NotificationContext"
import { useEffect } from "react"
import { useRouter } from "expo-router"

function RootLayout() {
  const router = useRouter()

  useEffect(() => {
    if (!globalThis.userData) {
      router.replace("/")
    }
  }, [])

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NotificationProvider>
          <Stack>
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="home" options={{headerShown: false}} />
            <Stack.Screen name="menu_report" options={{headerShown: false}} />
          </Stack>
        </NotificationProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout