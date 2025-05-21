import React, { useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import initialItineraries, { Itinerary } from "../data/itineraries";
import AddItineraryBottomSheet from "@/components/AddItineraryBottomSheet";

export default function ItineraryScreen() {
  // Use state for itineraries so you can add new ones
  const [itineraries, setItineraries] =
    useState<Itinerary[]>(initialItineraries);
  const modalizeRef = useRef<any>(null);

  const openSheet = () => modalizeRef.current?.open();
  const handleItineraryPress = (itinerary: Itinerary) => {
    // Navigate to details screen if needed
    alert(`Open itinerary for ${itinerary.city}`);
  };

  const handleAddItinerary = (name: string, days: number, list: string) => {
    setItineraries((prev) => [
      ...prev,
      { city: name, days, locations: Math.floor(Math.random() * 25) + 3 }, // Or get actual value
    ]);
    modalizeRef.current?.close();
  };

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>No itineraries yet</Text>
      <Pressable style={styles.createButton} onPress={openSheet}>
        <Text style={styles.createButtonText}>Create your first itinerary</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={itineraries}
        keyExtractor={(item) => item.city}
        renderItem={({ item }) => (
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
              <Text style={styles.city}>{item.city}</Text>
              <Ionicons name="arrow-forward" size={36} color={Colors.accent} />
            </View>
            <View style={styles.cardInfoRow}>
              <Text style={styles.cardInfo}>{item.days} days</Text>
              <Text style={styles.cardInfo}>{item.locations} locations</Text>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 64 }}
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
        availableLists={["Favorites", "Google List 1", "Google List 2"]}
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
