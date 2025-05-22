import React, { useMemo, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import BottomSheet from "@gorhom/bottom-sheet";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import demoItinerary, { ItineraryDay, Place } from "../data/demoItinerary";
import { useLocalSearchParams } from "expo-router";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

function getPlaceIcon(type: Place["type"]) {
  if (type === "food")
    return (
      <MaterialCommunityIcons
        name="silverware-fork-knife"
        size={32}
        color="#fff"
        style={{ marginRight: 12 }}
      />
    );
  if (type === "museum")
    return (
      <MaterialCommunityIcons
        name="bank"
        size={32}
        color="#fff"
        style={{ marginRight: 12 }}
      />
    );
  if (type === "store")
    return (
      <Ionicons
        name="cart"
        size={32}
        color="#fff"
        style={{ marginRight: 12 }}
      />
    );
  return (
    <Ionicons
      name="location"
      size={32}
      color="#fff"
      style={{ marginRight: 12 }}
    />
  );
}

export default function ItineraryDetailsScreen() {
  const { city } = useLocalSearchParams();

  // Only Paris has demo data
  const isParis = city === "Paris";
  const itineraryDays = isParis ? demoItinerary : [];
  const allPlaces = isParis ? demoItinerary.flatMap((day) => day.places) : [];

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["17%", "50%", "92%"], []);

  // Initial region for Paris demo
  const initialRegion = {
    latitude: 48.864716,
    longitude: 2.349014,
    latitudeDelta: 0.06,
    longitudeDelta: 0.04,
  };

  // Render each day section
  const renderDay = ({ item: day }: { item: ItineraryDay }) => {
    console.log("day", day); // Debug: check day object
    return (
      <View style={styles.daySection}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>
            {day.day ? `Day ${day.day}` : "Day ?"}
          </Text>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={22} color={Colors.card} />
          </TouchableOpacity>
        </View>
        {(Array.isArray(day.places) ? day.places : []).map((place, idx) => {
          console.log("place", place); // Debug: check place object
          return (
            <View style={styles.placeCard} key={(place?.name || "") + idx}>
              {getPlaceIcon(place?.type || "food")}
              <View style={{ flex: 1 }}>
                <Text style={styles.placeName}>
                  {place?.name || "Unknown Place"}
                </Text>
                <Text style={styles.placeHours}>
                  Open {place?.hours || "—"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={26} color="#fff" />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* REAL MAP BACKGROUND */}
      <MapView
        style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        customMapStyle={mapStyle}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
      >
        {allPlaces.map((place, idx) =>
          place &&
          typeof place.lat === "number" &&
          typeof place.lng === "number" ? (
            <Marker
              key={(place.name || "marker") + idx}
              coordinate={{
                latitude: place.lat,
                longitude: place.lng,
              }}
              title={place.name || ""}
              description={place.hours || ""}
              pinColor={Colors.accent}
            />
          ) : null
        )}
      </MapView>

      {/* Optional overlay for readability */}
      <View style={[styles.mapOverlay, { zIndex: 1 }]} pointerEvents="none" />

      {/* Floating header */}
      <View style={styles.header}>
        <Text style={styles.headerCity}>{city}</Text>
        <Ionicons name="menu" size={32} color={Colors.card} />
      </View>

      {/* BOTTOM SHEET */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        style={styles.sheet}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        enablePanDownToClose={false}
      >
        {isParis ? (
          <FlatList
            data={itineraryDays}
            renderItem={renderDay}
            keyExtractor={(item, idx) => "day" + (item?.day ?? idx)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 60 }}
          />
        ) : (
          <View style={{ padding: 32, alignItems: "center" }}>
            <Text
              style={{ color: Colors.accent, fontSize: 20, fontWeight: "bold" }}
            >
              No itinerary data for {city}
            </Text>
          </View>
        )}
        {/* Floating Add Day button */}
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={36} color={Colors.card} />
        </TouchableOpacity>
      </BottomSheet>
    </View>
  );
}

// OPTIONAL: Desaturated map style for modern look
const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
  // ...more, see https://snazzymaps.com/
];

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  header: {
    position: "absolute",
    top: 48,
    left: 0,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    zIndex: 2,
  },
  headerCity: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.card,
    letterSpacing: 1.1,
  },
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 18,
  },
  sheetBackground: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: Colors.card,
  },
  handleIndicator: {
    backgroundColor: Colors.border,
    width: 48,
    height: 7,
    borderRadius: 3.5,
    alignSelf: "center",
    marginVertical: 7,
  },
  daySection: {
    marginBottom: 24,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginHorizontal: 8,
    justifyContent: "space-between",
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.accent,
  },
  addBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    padding: 5,
    marginLeft: 16,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accentLight,
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 7,
    elevation: 2,
  },
  placeName: {
    fontWeight: "bold",
    fontSize: 17,
    color: Colors.card,
  },
  placeHours: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.88,
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 18,
    right: 26,
    backgroundColor: Colors.accent,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: Colors.accent,
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
  },
});
