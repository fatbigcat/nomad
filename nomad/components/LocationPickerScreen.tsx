import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { GoogleMapsPlace } from "../app/data/googleMapsDb";

const screenHeight = Dimensions.get("window").height;

export type LocationSort = "opening" | "distance";

interface Props {
  places: GoogleMapsPlace[];
  sort: LocationSort;
  setSort: (s: LocationSort) => void;
  start: GoogleMapsPlace | undefined;
  setStart: (p: GoogleMapsPlace) => void;
  onBack: () => void;
  renderItem: (item: GoogleMapsPlace) => React.ReactNode;
  ListFooterComponent?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export default function LocationPickerScreen({
  places,
  sort,
  setSort,
  start,
  setStart,
  onBack,
  renderItem,
  ListFooterComponent,
  rightAction,
}: Readonly<Props>) {
  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Location</Text>
        {/* render rightAction if provided */}
        {rightAction ? (
          <View style={{ marginLeft: 8 }}>{rightAction}</View>
        ) : null}
      </View>
      {/* start point selector */}
      <View style={styles.startPointRow}>
        <Text style={styles.startPointLabel}>Start from:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {places.map((p) => (
            <TouchableOpacity
              key={p.name}
              style={[
                styles.startPointBtn,
                start && start.name === p.name && styles.startPointBtnActive,
              ]}
              onPress={() => setStart(p)}
            >
              <Text
                style={[
                  styles.startPointBtnText,
                  start &&
                    start.name === p.name &&
                    styles.startPointBtnTextActive,
                ]}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* controls */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity
          style={[styles.sortBtn, sort === "opening" && styles.sortBtnActive]}
          onPress={() => setSort("opening")}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={sort === "opening" ? Colors.card : Colors.primary}
          />
          <Text
            style={[
              styles.sortBtnText,
              sort === "opening" && styles.sortBtnTextActive,
            ]}
          >
            Opening
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortBtn, sort === "distance" && styles.sortBtnActive]}
          onPress={() => setSort("distance")}
          disabled={!start}
        >
          <Ionicons
            name="navigate-outline"
            size={18}
            color={sort === "distance" ? Colors.card : Colors.primary}
          />
          <Text
            style={[
              styles.sortBtnText,
              sort === "distance" && styles.sortBtnTextActive,
            ]}
          >
            Distance
          </Text>
        </TouchableOpacity>
      </View>
      {/* locations */}
      <View style={{ flex: 1 }}>
        {places.map((item) => renderItem(item))}
        {ListFooterComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingTop: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingBottom: 10,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },
  backBtn: {
    marginRight: 10,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
    letterSpacing: 0.5,
    flex: 1,
    textAlign: "center",
  },
  startPointRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  startPointLabel: {
    fontWeight: "bold",
    color: Colors.primary,
    marginRight: 8,
    fontSize: 16,
  },
  startPointBtn: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  startPointBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  startPointBtnText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  startPointBtnTextActive: {
    color: Colors.card,
    fontWeight: "bold",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  sortLabel: {
    fontWeight: "bold",
    color: Colors.primary,
    marginRight: 8,
    fontSize: 16,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  sortBtnText: {
    color: Colors.primary,
    fontWeight: "500",
    marginLeft: 4,
  },
  sortBtnTextActive: {
    color: Colors.card,
    fontWeight: "bold",
  },
});
