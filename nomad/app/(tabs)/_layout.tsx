import { Drawer } from "expo-router/drawer";
import Colors from "@/constants/Colors";
import { PaperProvider } from "react-native-paper";

export default function Layout() {
  return (
    <PaperProvider>
      <Drawer
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.card, // Color for title and hamburger
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 26,
          },
          headerLeft: () => null, // Remove hamburger icon from all screens by default
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            drawerLabel: "Welcome",
            title: "Welcome",
            headerShown: false,
          }}
        />

        <Drawer.Screen
          name="itinerary"
          options={{
            drawerLabel: "Itinerary",
            title: "Itinerary",
            headerLeft: () => null, // Remove hamburger icon specifically for itinerary
          }}
        />
      </Drawer>
    </PaperProvider>
  );
}
