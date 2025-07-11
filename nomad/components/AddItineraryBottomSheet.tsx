import React, { forwardRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from "react-native";
import { Modalize } from "react-native-modalize";
import Colors from "@/constants/Colors";
import { getAllGoogleMapsLists } from "../app/data/googleMapsDb";

type AddItineraryBottomSheetProps = {
  onAdd: (name: string, days: number, list: string) => void;
  error?: string;
  clearError?: () => void;
};

const AddItineraryBottomSheet = forwardRef<
  Modalize,
  AddItineraryBottomSheetProps
>(({ onAdd, error, clearError }, ref) => {
  const [availableLists, setAvailableLists] = useState<string[]>([]); //lists from firestore
  const [name, setName] = useState(""); //store current value
  const [days, setDays] = useState("");
  const [list, setList] = useState("");
  const [localError, setLocalError] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const refreshLists = () => {
    getAllGoogleMapsLists().then((lists) => {
      setAvailableLists(lists.map((l: any) => l.listName));
    });
  };

  React.useEffect(() => {
    refreshLists();
  }, []);

  const handleAdd = () => {
    if (!name.trim()) {
      if (clearError) clearError();
      setLocalError("Please enter a name.");
      return;
    }
    if (!list.trim()) {
      if (clearError) clearError();
      setLocalError("Please choose a list.");
      return;
    }
    if (!days.trim() || isNaN(Number(days)) || Number(days) < 1) {
      if (clearError) clearError();
      setLocalError("Please enter a valid number of days.");
      return;
    }
    if (clearError) clearError();
    setLocalError("");
    onAdd(name.trim(), Number(days), list.trim());
    setName("");
    setDays("");
    setList("");
  };

  return (
    <Modalize
      ref={ref}
      onOpen={refreshLists} //refresh lists every time the sheet opens
      adjustToContentHeight
      handleStyle={{
        backgroundColor: Colors.primary,
        marginTop: 10,
        width: 60,
      }}
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
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 0,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ alignItems: "center", marginBottom: 16 }}>
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

        {/* dropdown for choosing a list */}
        <TouchableOpacity
          style={[
            styles.input,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
          onPress={() => {
            setDropdownVisible(!dropdownVisible);
            if (!dropdownVisible) {
              Keyboard.dismiss();
            }
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: list ? Colors.text : Colors.border,
              fontSize: 18,
            }}
          >
            {list || "Choose list"}
          </Text>
          <Text style={{ color: Colors.border, fontSize: 18 }}>
            {dropdownVisible ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>
        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            {availableLists.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setList(item);
                  setDropdownVisible(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TextInput
          placeholder="Days"
          placeholderTextColor={Colors.border}
          style={styles.input}
          keyboardType="numeric"
          value={days}
          onChangeText={setDays}
          maxLength={2}
        />
        {error ?? localError ? (
          <Text style={styles.errorText}>{error ?? localError}</Text>
        ) : null}

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

        {/* extra room above keyboard */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </Modalize>
  );
});

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
  dropdownMenu: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderColor: Colors.border,
    borderWidth: 1,
    marginBottom: 12,
    marginTop: -8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 18,
    color: Colors.text,
  },
});

export default AddItineraryBottomSheet;
