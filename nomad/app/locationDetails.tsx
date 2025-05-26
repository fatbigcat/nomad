import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";

// Modular back button for use in any screen
export function HeaderBackButton({
  color = Colors.lightText,
  city,
}: Readonly<{ color?: string; city?: string }>) {
  const navigation = useNavigation();
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => {
        if (navigation.canGoBack?.()) {
          navigation.goBack();
        } else if (city) {
          router.push({
            pathname: "/(tabs)/itineraryDetails",
            params: { city: String(city) },
          });
        } else {
          router.push("/itinerary"); // fallback to itinerary list
        }
      }}
      style={{ marginLeft: 12, padding: 4 }}
      accessibilityLabel="Go back"
    >
      <Ionicons name="arrow-back" size={26} color={color} />
    </TouchableOpacity>
  );
}

export default function LocationDetailsScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  // Expecting params: name, type, hours, lat, lng, city, day
  const { name, type, hours, lat, lng, city, day } = params;

  function getPlaceIcon(type: string) {
    if (type === "food")
      return (
        <MaterialCommunityIcons
          name="silverware-fork-knife"
          size={32}
          color={Colors.accent}
          style={{ marginRight: 14 }}
        />
      );
    if (type === "museum")
      return (
        <MaterialCommunityIcons
          name="bank"
          size={32}
          color={Colors.accent}
          style={{ marginRight: 14 }}
        />
      );
    if (type === "store")
      return (
        <Ionicons
          name="cart"
          size={32}
          color={Colors.accent}
          style={{ marginRight: 14 }}
        />
      );
    if (type === "park")
      return (
        <MaterialCommunityIcons
          name="tree"
          size={32}
          color={Colors.accent}
          style={{ marginRight: 14 }}
        />
      );
    return (
      <Ionicons
        name="location"
        size={32}
        color={Colors.accent}
        style={{ marginRight: 14 }}
      />
    );
  }

  React.useLayoutEffect(() => {
    // Remove headerLeft hack: header is now set globally in _layout.tsx
    navigation.setOptions({
      title: name || "Location Details",
    });
  }, [navigation, name]);

  function openInGoogleMaps(lat: number, lng: number) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.openURL(url);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {getPlaceIcon(type as string)}
        <Text style={styles.name}>{name}</Text>
      </View>
      <Text style={styles.info}>Type: {type}</Text>
      <Text style={styles.info}>Open: {hours}</Text>
      <Text style={styles.info}>Latitude: {lat}</Text>
      <Text style={styles.info}>Longitude: {lng}</Text>
      {city && <Text style={styles.info}>City: {city}</Text>}
      {day && <Text style={styles.info}>Day: {day}</Text>}
      {/* Google Maps Navigation Button */}
      {lat && lng && (
        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: Colors.accent,
            padding: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
          onPress={() => openInGoogleMaps(Number(lat), Number(lng))}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
            Navigate to location
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
  },
  info: {
    fontSize: 18,
    color: Colors.accent,
    marginBottom: 8,
  },
});
