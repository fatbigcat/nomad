import React, { useRef, useState } from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { getAllItineraries, addItinerary } from "../data/itineraryDb";
import type { Itinerary } from "../data/itineraryDb";
import AddItineraryBottomSheet from "@/components/AddItineraryBottomSheet";

export default function ItineraryScreen() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<
    (Itinerary & { id: string })[]
  >([]);
  const modalizeRef = useRef<any>(null);

  React.useEffect(() => {
    getAllItineraries().then((data) => setItineraries(data));
  }, []);

  const openSheet = () => modalizeRef.current?.open();
  const handleItineraryPress = (itinerary: Itinerary & { id: string }) => {
    router.push({
      pathname: "/itineraryDetails",
      params: { city: itinerary.city },
    });
  };

  const handleAddItinerary = async (
    name: string,
    days: number,
    list: string
  ) => {
    const newItinerary = {
      city: name,
      days,
      locations: Math.floor(Math.random() * 25) + 3, // Or get actual value
      details: [], // You may want to fetch or pass details from the list
    };
    await addItinerary(newItinerary);
    getAllItineraries().then((data) => setItineraries(data));
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
            // Only open details when pressing the card, not the share icon
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
                <Text style={styles.cardInfo}>{item.locations} locations</Text>
              </View>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: `Itinerary for ${item.city}`,
                      text: `Check out my itinerary for ${item.city}: ${item.days} days, ${item.locations} locations!`,
                    });
                  } else {
                    alert(`Share itinerary for ${item.city}`);
                  }
                }}
                hitSlop={10}
                style={{ padding: 4 }}
              >
                <Ionicons name="share-social" size={36} color={Colors.accent} />
              </Pressable>
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

      <AddItineraryBottomSheet ref={modalizeRef} onAdd={handleAddItinerary} />
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
