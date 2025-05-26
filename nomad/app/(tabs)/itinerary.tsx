import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import {
  getAllItineraries,
  addItinerary,
  deleteItinerary,
} from "../data/itineraryDb";
import { importDemoGoogleMapsLists } from "../data/importGoogleMapsLists";
import { getAllGoogleMapsLists, GoogleMapsList } from "../data/googleMapsDb";
import type { Itinerary } from "../data/itineraryDb";
import AddItineraryBottomSheet from "@/components/AddItineraryBottomSheet";
import { Swipeable } from "react-native-gesture-handler";
import ShareItinerary from "../../components/ShareItinerary";

function logoutFromGoogle() {
  // TODO: Integrate Google logout logic here (e.g., GoogleSignIn.signOutAsync())
}

function HeaderLogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <Pressable
      onPress={onLogout}
      style={{ marginRight: 16, padding: 4 }}
      accessibilityLabel="Log out"
    >
      <Ionicons name="log-out-outline" size={26} color={Colors.lightText} />
    </Pressable>
  );
}

export default function ItineraryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [itineraries, setItineraries] = useState<
    (Itinerary & { id: string })[]
  >([]);
  const [importing, setImporting] = useState(false);
  const [bottomSheetError, setBottomSheetError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const modalizeRef = useRef<any>(null);

  const fetchItineraries = async () => {
    const data = await getAllItineraries();
    setItineraries(data);
  };

  React.useEffect(() => {
    fetchItineraries();
  }, []);

  const handleLogout = React.useCallback(() => {
    logoutFromGoogle();
    router.replace("/");
  }, [router]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <HeaderLogoutButton onLogout={handleLogout} />, // Use modular header right
    });
  }, [navigation, handleLogout]);

  const openSheet = () => modalizeRef.current?.open();
  const handleItineraryPress = async (
    itinerary: Itinerary & { id: string }
  ) => {
    // Fetch all Google Maps lists
    const lists = await getAllGoogleMapsLists();
    // Try to find the list by city name (case-insensitive)
    const list = lists.find(
      (l: any) =>
        typeof l.city === "string" &&
        l.city.toLowerCase() === itinerary.city.toLowerCase() &&
        Array.isArray(l.places) &&
        l.places.length > 0
    ) as GoogleMapsList | undefined;
    let center = undefined;
    if (list) {
      const avg = list.places.reduce(
        (acc, p) => {
          return { lat: acc.lat + p.lat, lng: acc.lng + p.lng };
        },
        { lat: 0, lng: 0 }
      );
      center = {
        latitude: avg.lat / list.places.length,
        longitude: avg.lng / list.places.length,
      };
    }
    router.push({
      pathname: "/itineraryDetails",
      params: {
        city: itinerary.city,
        center: center ? JSON.stringify(center) : undefined,
      },
    });
  };

  const handleAddItinerary = async (
    name: string,
    days: number,
    list: string
  ) => {
    // Check for duplicate itinerary name
    const allItineraries = await getAllItineraries();
    if (
      allItineraries.some(
        (it) => it.city.toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      setBottomSheetError("An itinerary with this name already exists.");
      return;
    }
    setBottomSheetError("");
    // Create a new itinerary with 0 locations and empty days, and reference to Google Maps list
    const newItinerary = {
      city: name,
      days,
      locations: 0, // Start with 0 locations
      details: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        places: [],
      })),
      googleMapsList: list, // Reference to connected Google Maps list
    };
    await addItinerary(newItinerary);
    getAllItineraries().then((data) => setItineraries(data));
    modalizeRef.current?.close();
  };

  const handleImport = async () => {
    setImporting(true);
    await importDemoGoogleMapsLists();
    setImporting(false);
    // Optionally refresh itineraries or Google Maps lists here
  };

  // Swipe-to-delete for itineraries
  const handleDeleteItinerary = async (id: string) => {
    await deleteItinerary(id);
    fetchItineraries();
  };

  const renderRightActions = (
    id: string,
    progress: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [192, 0],
    });
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          backgroundColor: "#ff4757",
          marginBottom: 16,
          borderRadius: 18,
          paddingRight: 20,
        }}
      >
        <Animated.View
          style={{ transform: [{ translateX: trans }, { scale }] }}
        >
          <Pressable
            style={{
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              width: 44,
              height: 44,
              borderRadius: 18,
              backgroundColor: "#ff4757",
              alignSelf: "center",
              // Center content
              display: "flex",
            }}
            onPress={() => handleDeleteItinerary(id)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="trash-outline" size={24} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: "600",
                  marginTop: 2,
                  textAlign: "center",
                }}
              >
                Delete
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>No itineraries yet</Text>
      <Pressable style={styles.createButton} onPress={openSheet}>
        <Text style={styles.createButtonText}>Create your first itinerary</Text>
      </Pressable>
      <Pressable
        style={[
          styles.createButton,
          {
            marginTop: 16,
            backgroundColor: importing ? Colors.border : Colors.accent,
          },
        ]}
        onPress={handleImport}
        disabled={importing}
      >
        <Text style={styles.createButtonText}>
          {importing ? "Importing..." : "Import Demo Google Maps Lists"}
        </Text>
      </Pressable>
    </View>
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItineraries();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={itineraries}
        keyExtractor={(item) => item.city}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={(progress) =>
              renderRightActions(item.id, progress)
            }
            rightThreshold={40}
            overshootRight={false}
          >
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={() => handleItineraryPress(item)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={styles.city}>{item.city}</Text>
                  <Text style={styles.cardInfo}>{item.days} days</Text>
                  <Text style={styles.cardInfo}>
                    {item.locations} locations
                  </Text>
                </View>
                <ShareItinerary
                  city={item.city}
                  days={item.days}
                  locations={item.locations}
                  details={item.details}
                  buttonStyle={{ padding: 4 }}
                  iconColor={Colors.accent}
                />
              </View>
            </Pressable>
          </Swipeable>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 64 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* Floating Add Button */}
      <Pressable
        style={{
          position: "absolute",
          right: 28,
          bottom: 36,
          width: 72,
          height: 72,
          backgroundColor: Colors.accent,
          borderRadius: 36,
          alignItems: "center",
          justifyContent: "center",
          elevation: 5,
        }}
        onPress={openSheet}
      >
        <Ionicons name="add" size={44} color={Colors.card} />
      </Pressable>

      <AddItineraryBottomSheet
        ref={modalizeRef}
        onAdd={handleAddItinerary}
        error={bottomSheetError}
        clearError={() => setBottomSheetError("")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingTop: 32,
    paddingHorizontal: 0,
  },
  heading: {
    fontSize: 28,
    color: Colors.card,
    fontWeight: "bold",
    marginLeft: 24,
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  city: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.accent,
    marginBottom: 4,
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cardInfo: {
    color: Colors.accent,
    fontWeight: "500",
    fontSize: 15,
    opacity: 0.8,
  },
  fab: {
    position: "absolute",
    right: 28,
    bottom: 36,
    width: 72,
    height: 72,
    backgroundColor: Colors.accent,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 32,
    margin: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: "bold",
  },
});
