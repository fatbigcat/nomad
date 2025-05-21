// /app/home.tsx
import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nomad</Text>
      <Text style={styles.subtitle}>Travel Itinerary Builder</Text>
      <Text style={styles.description}>
        Welcome! Use the menu to build your trip, organize days, and plan your
        route with Google Maps lists.
      </Text>
      <Link href="/itinerary" asChild>
        <Button title="Go to Itinerary" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    color: "#888",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: "#444",
  },
});
