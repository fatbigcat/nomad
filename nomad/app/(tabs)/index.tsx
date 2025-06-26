import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Colors from "@/constants/Colors";
import { useRouter } from "expo-router";

export default function IndexScreen() {
  const router = useRouter();

  //placeholder: navigates to home
  const handleGoogleLogin = () => {
    //trigger Google authentication
    router.replace("/itinerary"); //go to home on success
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerBg}>
        <View style={styles.logoBox}>
          <Text style={styles.logo}>🌞</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Nomad</Text>
        <Text style={styles.subtitle}>Sync with your Google Maps.</Text>
        <Text style={styles.subtitle}>Plan your perfect travel itinerary.</Text>

        <Pressable
          style={({ pressed }) => [
            styles.googleButton,
            pressed && styles.googleButtonPressed,
          ]}
          onPress={handleGoogleLogin}
        >
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </Pressable>

        <View style={{ marginTop: 32, alignItems: "center" }}>
          <Text style={styles.helpText}>Need help?</Text>
          <Text style={styles.helpText}>
            Don't have an account? <Text style={styles.linkText}>Sign Up</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
IndexScreen.options = {
  headerShown: false,
};
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  headerBg: {
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
  },
  logoBox: {
    backgroundColor: Colors.primary,
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 56,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  logo: {
    fontSize: 44,
    color: Colors.card,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 80,
    paddingTop: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.card,
    marginBottom: 24,
    fontFamily: "System",
  },
  subtitle: {
    color: Colors.card,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "System",
  },
  googleButton: {
    backgroundColor: "#09607C",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 48,
    width: "90%",
    alignItems: "center",
  },
  googleButtonPressed: {
    backgroundColor: "#064961",
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  helpText: {
    color: Colors.card,
    fontSize: 16,
    marginBottom: 4,
    textAlign: "center",
  },
  linkText: {
    textDecorationLine: "underline",
    color: "#fff",
    fontWeight: "bold",
  },
});
