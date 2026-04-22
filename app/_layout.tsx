import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "PlusJakartaSans-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "PlusJakartaSans-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "PlusJakartaSans-BoldItalic": require("../assets/fonts/PlusJakartaSans-BoldItalic.ttf"),
    "PlusJakartaSans-Italic": require("../assets/fonts/PlusJakartaSans-Italic.ttf"),
    "PlusJakartaSans-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "PlusJakartaSans-LightItalic": require("../assets/fonts/PlusJakartaSans-LightItalic.ttf"),
    "NotoSerif-Regular": require("../assets/fonts/NotoSerif-Regular.ttf"),
    "NotoSerif-Bold": require("../assets/fonts/NotoSerif-Bold.ttf"),
    "NotoSerif-BoldItalic": require("../assets/fonts/NotoSerif-BoldItalic.ttf"),
    "NotoSerif-Italic": require("../assets/fonts/NotoSerif-Italic.ttf"),
    "NotoSerif-Light": require("../assets/fonts/NotoSerif-Light.ttf"),
    "NotoSerif-LightItalic": require("../assets/fonts/NotoSerif-LightItalic.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  return <Stack> 
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="pages/RegisterPage" options={{ headerShown: false }} />
    <Stack.Screen name="pages/LoginPage" options={{ headerShown: false }} />
    <Stack.Screen name="pages/HomePage" options={{ headerShown: false }} />
  </Stack>;
}
