import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import itineraries, { Itinerary } from "../data/itineraries";

export default function ItineraryScreen() {
  const handleItineraryPress = (itinerary: Itinerary) => {
    // Navigate to details screen if needed
    alert(`Open itinerary for ${itinerary.city}`);
  };

  const handleAddPress = () => {
    // Show create itinerary modal or navigate to create screen
    alert("Create a new itinerary!");
  };

  const renderEmpty = () => (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>No itineraries yet</Text>
      <Pressable style={styles.createButton} onPress={handleAddPress}>
        <Text style={styles.createButtonText}>Create your first itinerary</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Itineraries</Text>
      <FlatList
        data={itineraries}
        keyExtractor={(item) => item.city}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
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
      <Pressable style={styles.fab} onPress={handleAddPress}>
        <Ionicons name="add" size={44} color={Colors.card} />
      </Pressable>
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
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  city: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.accent,
  },
  cardInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cardInfo: {
    color: Colors.accent,
    fontWeight: "bold",
    fontSize: 18,
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
