import React, { forwardRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Modalize } from "react-native-modalize";
import Colors from "@/constants/Colors";

type AddItineraryBottomSheetProps = {
  onAdd: (name: string, days: number, list: string) => void;
  availableLists?: string[];
};

const AddItineraryBottomSheet = forwardRef<
  Modalize,
  AddItineraryBottomSheetProps
>(
  (
    { onAdd, availableLists = ["Favorites", "Google List 1", "Google List 2"] },
    ref
  ) => {
    const [name, setName] = useState("");
    const [days, setDays] = useState("");
    const [list, setList] = useState("");
    const [error, setError] = useState("");

    const handleAdd = () => {
      if (!name.trim()) {
        setError("Please enter a name.");
        return;
      }
      if (!list.trim()) {
        setError("Please choose a list.");
        return;
      }
      if (!days.trim() || isNaN(Number(days)) || Number(days) < 1) {
        setError("Please enter a valid number of days.");
        return;
      }
      setError("");
      onAdd(name.trim(), Number(days), list.trim());
      setName("");
      setDays("");
      setList("");
    };

    return (
      <Modalize
        ref={ref}
        adjustToContentHeight
        handleStyle={{ backgroundColor: "#CCC" }}
        modalStyle={{
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          backgroundColor: Colors.card,
        }}
        withHandle={true}
        keyboardAvoidingBehavior="padding"
        keyboardAvoidingOffset={0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 0,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: "center", marginBottom: 16 }}>
            <View style={styles.grabber} />
            <Text style={styles.title}>Create new itinerary</Text>
          </View>

          <TextInput
            placeholder="Name"
            placeholderTextColor={Colors.border}
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoFocus
          />
          <TextInput
            placeholder="Choose list"
            placeholderTextColor={Colors.border}
            style={styles.input}
            value={list}
            onChangeText={setList}
          />
          <TextInput
            placeholder="Days"
            placeholderTextColor={Colors.border}
            style={styles.input}
            keyboardType="numeric"
            value={days}
            onChangeText={setDays}
            maxLength={2}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.addButton,
              !(name && days && list) && { backgroundColor: Colors.border },
            ]}
            disabled={!(name && days && list)}
            onPress={handleAdd}
          >
            <Text style={styles.addButtonText}>Add itinerary</Text>
          </TouchableOpacity>

          {/* Add a spacer to guarantee extra room above keyboard!!!!!!!! */}
          <View style={{ height: 120 }} />
        </ScrollView>
      </Modalize>
    );
  }
);

const styles = StyleSheet.create({
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ccc",
    marginBottom: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 20,
    color: Colors.accent,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderColor: Colors.border,
    borderWidth: 1.3,
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 12,
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.3,
  },
  errorText: {
    color: "#c00",
    marginBottom: 8,
    marginTop: -6,
  },
});

export default AddItineraryBottomSheet;
