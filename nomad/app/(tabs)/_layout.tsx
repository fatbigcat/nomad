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
        }}
      >
        <Drawer.Screen
          name="home"
          options={{ drawerLabel: "Home", title: "Home" }}
        />
        <Drawer.Screen
          name="itinerary"
          options={{ drawerLabel: "Itinerary", title: "Itinerary" }}
        />
      </Drawer>
    </PaperProvider>
  );
}
