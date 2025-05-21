import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <Drawer>
      <Drawer.Screen
        name="home"
        options={{ drawerLabel: "Home", title: "Home" }}
      />
      <Drawer.Screen
        name="itinerary"
        options={{ drawerLabel: "Itinerary", title: "Itinerary" }}
      />
    </Drawer>
  );
}
