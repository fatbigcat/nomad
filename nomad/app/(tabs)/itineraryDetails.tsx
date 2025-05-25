import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Modalize } from "react-native-modalize";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import Colors from "@/constants/Colors";
import { getAllItineraries, addItinerary } from "../data/itineraryDb";
import { useLocalSearchParams } from "expo-router";

const screenHeight = Dimensions.get("window").height;

// Define types if not imported from Firestore-aware file
export type Place = {
  name: string;
  type: "food" | "museum" | "store" | "landmark" | "park";
  hours: string;
  lat: number;
  lng: number;
};

export type ItineraryDay = {
  day: number;
  places: Place[];
};

function getPlaceIcon(type: Place["type"]) {
  if (type === "food")
    return (
      <MaterialCommunityIcons
        name="silverware-fork-knife"
        size={28}
        color={Colors.accent}
        style={{ marginRight: 12 }}
      />
    );
  if (type === "museum")
    return (
      <MaterialCommunityIcons
        name="bank"
        size={28}
        color={Colors.accent}
        style={{ marginRight: 12 }}
      />
    );
  if (type === "store")
    return (
      <Ionicons
        name="cart"
        size={28}
        color={Colors.accent}
        style={{ marginRight: 12 }}
      />
    );
  return (
    <Ionicons
      name="location"
      size={28}
      color={Colors.accent}
      style={{ marginRight: 12 }}
    />
  );
}

export default function ItineraryDetailsScreen() {
  const modalizeRef = useRef<Modalize>(null);
  const { city } = useLocalSearchParams();
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch itinerary from Firestore on mount
  useEffect(() => {
    async function fetchItinerary() {
      setLoading(true);
      try {
        const all = await getAllItineraries();
        // For now, just use the first itinerary (improve as needed)
        if (all.length > 0 && all[0].days) {
          // Ensure we have an array for each day, even if no places
          const numDays = all[0].days;
          const details = all[0].details || [];
          const fullItinerary = Array.from({ length: numDays }, (_, i) => {
            const found = details.find((d: ItineraryDay) => d.day === i + 1);
            return found || { day: i + 1, places: [] };
          });
          setItinerary(fullItinerary);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchItinerary();
    modalizeRef.current?.open();
  }, []);

  // Add a function to create and store a new itinerary in Firestore
  async function handleCreateItinerary(cityName: string, days: number) {
    const newItinerary = {
      city: cityName,
      days,
      locations: 0, // Start with 0 locations
      details: Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        places: [],
      })),
    };
    await addItinerary(newItinerary);
    // Optionally, fetch and update local state
    const all = await getAllItineraries();
    if (all.length > 0 && all[0].details) {
      setItinerary(all[0].details);
    }
  }

  const removePlace = (dayIndex: number, placeIndex: number) => {
    setItinerary((prevItinerary) =>
      prevItinerary.map((day: ItineraryDay, idx: number) =>
        idx === dayIndex
          ? {
              ...day,
              places: day.places.filter(
                (_: Place, placeIdx: number) => placeIdx !== placeIndex
              ),
            }
          : day
      )
    );
  };

  const renderRightActions = (
    dayIndex: number,
    placeIndex: number,
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
      <View style={styles.deleteContainer}>
        <Animated.View
          style={[
            styles.deleteAction,
            { transform: [{ translateX: trans }, { scale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removePlace(dayIndex, placeIndex)}
          >
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderDay = ({
    item: day,
    index: dayIndex,
  }: {
    item: ItineraryDay;
    index: number;
  }) => (
    <View style={styles.daySection}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>Day {day.day}</Text>
        <TouchableOpacity style={styles.addActivityBtn}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Always render at least the empty state for each day */}
      {day.places.length === 0 && (
        <View
          style={[styles.placeCard, { opacity: 0.5, justifyContent: "center" }]}
        >
          <Text style={{ color: Colors.primary, fontStyle: "italic" }}>
            No locations yet
          </Text>
        </View>
      )}
      {day.places.map((place: Place, placeIndex: number) => (
        <Swipeable
          key={place.name + placeIndex}
          renderRightActions={(
            progress: Animated.AnimatedInterpolation<number>
          ) => renderRightActions(dayIndex, placeIndex, progress)}
          rightThreshold={40}
          overshootRight={false}
        >
          <View style={styles.placeCard}>
            {getPlaceIcon(place.type)}
            <View style={{ flex: 1 }}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeHours}>Open {place.hours}</Text>
            </View>
          </View>
        </Swipeable>
      ))}
    </View>
  );

  const initialRegion = {
    latitude: 48.864716,
    longitude: 2.349014,
    latitudeDelta: 0.06,
    longitudeDelta: 0.04,
  };

  // Derive allPlaces from itinerary state
  const allPlaces = itinerary.flatMap((day) => day.places);

  return (
    <View style={{ flex: 1 }}>
      {/* MAP */}
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        customMapStyle={mapStyle}
      >
        {allPlaces.map((place, idx) => (
          <Marker
            key={place.name + idx}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            title={place.name}
            description={place.hours}
            pinColor="#1499b2"
          />
        ))}
      </MapView>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerCity}>{city || "Itinerary"}</Text>
      </View>

      {/* MODALIZE SHEET */}
      <Modalize
        ref={modalizeRef}
        modalStyle={styles.modal}
        handleStyle={styles.handle}
        alwaysOpen={screenHeight * 0.23}
        adjustToContentHeight={false}
        modalHeight={screenHeight * 0.93}
        flatListProps={{
          data: itinerary,
          renderItem: renderDay,
          keyExtractor: (item) => "day" + item.day,
          contentContainerStyle: {
            paddingBottom: 85,
            paddingHorizontal: 14,
            paddingTop: 14,
          },
          showsVerticalScrollIndicator: false,
          ListFooterComponent: (
            <>
              <View style={styles.addDayContainer}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: Colors.primary,
                    marginBottom: 10,
                  }}
                ></Text>
                <TouchableOpacity style={styles.addDayButton}>
                  <Ionicons
                    name="add"
                    size={22}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.addDayText}>Add Day</Text>
                </TouchableOpacity>
              </View>
              {loading && (
                <Text style={{ textAlign: "center", marginTop: 20 }}>
                  Loading...
                </Text>
              )}
            </>
          ),
        }}
      />
    </View>
  );
}

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#f8f6f1" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
];

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 48,
    left: 0,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // center the text
    paddingHorizontal: 24,
    zIndex: 2,
  },
  headerCity: {
    fontSize: 26, // match layout title size
    fontWeight: "bold",
    color: Colors.card, // match layout color
    letterSpacing: 1.2,
    backgroundColor: Colors.primary, // match layout background
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 22,
    overflow: "hidden",
    marginRight: 0, // remove extra margin
    shadowColor: Colors.primary,
    shadowOpacity: 0.17,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    textAlign: "center", // ensure text is centered
  },
  modal: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
    paddingHorizontal: 0,
    borderWidth: 0,
  },
  handle: {
    backgroundColor: Colors.primary,
    width: 48,
    height: 6,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 10,
  },
  daySection: {
    marginBottom: 18,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginHorizontal: 4,
    justifyContent: "space-between",
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 0.2,
  },
  addActivityBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 17,
    padding: 4,
    marginLeft: 6,
    justifyContent: "center",
    alignItems: "center",
    width: 32,
    height: 32,
    shadowColor: Colors.accent,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff", // set card background to white
    marginBottom: 12,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.18, // increase shadow opacity
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 }, // increase shadow offset
    elevation: 6, // increase elevation for Android
  },
  placeName: {
    fontWeight: "bold",
    fontSize: 16.5,
    color: Colors.primary,
    marginBottom: 2,
  },
  placeHours: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: "500",
    opacity: 0.9,
  },
  addDayContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
    bottom: 0,
    left: 0,
  },
  addDayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.accent,
    borderRadius: 28,
    paddingHorizontal: 40,
    paddingVertical: 15,
    shadowColor: Colors.accent,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  addDayText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.4,
  },
  deleteContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#ff4757",
    marginBottom: 12,
    borderRadius: 22,
    paddingRight: 20,
  },
  deleteAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 54, // smaller width
    paddingLeft: 20,
    height: "100%",
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: 44, // smaller button
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ff4757",
    alignSelf: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    textAlign: "center",
  },
});
