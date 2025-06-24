import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";
import { PaperProvider } from "react-native-paper";
import { View, Text } from "react-native";
import Colors from "@/constants/Colors";
import { HeaderBackButton } from "./locationDetails";

export {
  // Error boundary for navigation tree
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // initial route for navigation
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

//custom header for location details
function LocationDetailsHeader({
  options,
  route,
}: Readonly<{ options: any; route: any }>) {
  const title = options?.title ?? "Location Details";
  //only show back button if not the root
  const showBack = options?.headerBackVisible !== false;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primary,
        paddingTop: 60,
        paddingBottom: 5,
        paddingHorizontal: 0,
      }}
    >
      {showBack && (
        <View
          style={{
            width: 44,
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <HeaderBackButton color={Colors.card} />
        </View>
      )}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            color: Colors.card,
            fontSize: 26,
            fontWeight: "bold",
            textAlign: "center",
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>
      {/*spacer to balance the row if needed*/}
      {showBack && <View style={{ width: 44 }} />}
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="locationDetails"
            options={{
              headerShown: true,
              header: LocationDetailsHeader,
            }}
          />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
