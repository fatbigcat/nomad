import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Modalize } from "react-native-modalize";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import Colors from "@/constants/Colors";
import { getAllItineraries, updateItinerary } from "../data/itineraryDb";
import {
  getAllGoogleMapsLists,
  GoogleMapsList,
  GoogleMapsPlace,
} from "../data/googleMapsDb";
import LocationPickerScreen, {
  LocationSort,
} from "../../components/LocationPickerScreen";
import {
  Stack,
  useNavigation,
  useLocalSearchParams,
  useFocusEffect,
} from "expo-router";
import { confirmDelete } from "../../components/common/confirmDelete";

const screenHeight = Dimensions.get("window").height;

//define types if not imported from Firestore-aware file
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

//utility: convert any Place to a Firestore-compatible Place (only supported types)
function toFirestorePlace(
  p: any
): import("../data/demoItinerary").Place | null {
  if (
    p.type === "food" ||
    p.type === "museum" ||
    p.type === "store" ||
    p.type === "landmark" ||
    p.type === "park"
  ) {
    return {
      name: p.name,
      type: p.type,
      hours: p.hours,
      lat: p.lat,
      lng: p.lng,
    };
  }
  return null;
}

//type guard for Firestore Place
function isFirestorePlace(p: any): p is import("../data/demoItinerary").Place {
  return (
    !!p &&
    typeof p.name === "string" &&
    typeof p.type === "string" &&
    typeof p.hours === "string" &&
    typeof p.lat === "number" &&
    typeof p.lng === "number"
  );
}

function getItineraryForCity(all: any[], city: string): any | undefined {
  return all.find((it) => it.city.toLowerCase() === city.toLowerCase());
}

function EditListButton({
  editMode,
  onPress,
}: {
  editMode: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.editListBtn}
      onPress={onPress}
      accessibilityLabel={editMode ? "Done editing list" : "Edit list"}
    >
      <Ionicons
        name={editMode ? "close" : "create-outline"}
        size={24}
        color="#fff"
      />
    </TouchableOpacity>
  );
}

// --- reusable placecard component ---
function PlaceCard({
  name,
  hours,
  isSelected,
  onPress,
  showCheckmark,
  disabled,
  style,
  icon,
}: {
  name: string;
  hours: string;
  isSelected?: boolean;
  onPress?: () => void;
  showCheckmark?: boolean;
  disabled?: boolean;
  style?: any;
  icon?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.placeCard,
        isSelected && {
          borderColor: Colors.accent,
          borderWidth: 2,
          backgroundColor: "#e6f7fa",
        },
        style,
      ]}
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={disabled}
    >
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <View style={{ flex: 1 }}>
        <Text style={styles.placeName}>{name}</Text>
        <Text style={styles.placeHours}>Open {hours}</Text>
      </View>
      {showCheckmark && isSelected && (
        <Ionicons
          name="checkmark-circle"
          size={22}
          color={Colors.accent}
          style={{ marginLeft: 8 }}
        />
      )}
    </TouchableOpacity>
  );
}

const MemoizedEditListButton = React.memo(EditListButton);

function buildFullItinerary(match: any): ItineraryDay[] {
  if (match && match.days) {
    const numDays = match.days;
    const details = match.details || [];
    return Array.from({ length: numDays }, (_, i) => {
      const found = details.find((d: ItineraryDay) => d.day === i + 1);
      return found || { day: i + 1, places: [] };
    });
  }
  return [];
}
function HeaderRight({
  editMode,
  onPress,
}: {
  editMode: boolean;
  onPress: () => void;
}) {
  return <EditListButton editMode={editMode} onPress={onPress} />;
}

function HeaderLeft() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("itinerary" as never)}
      style={{ marginLeft: 12, padding: 4 }}
      accessibilityLabel="Go back"
    >
      <Ionicons name="arrow-back" size={26} color={Colors.lightText} />
    </TouchableOpacity>
  );
}

export default function ItineraryDetailsScreen() {
  const navigation = useNavigation();
  const modalizeRef = useRef<Modalize>(null);
  const mapRef = useRef<MapView>(null);
  const { city, latitude, longitude } = useLocalSearchParams();
  const lat = latitude ? parseFloat(latitude as string) : 0;
  const lng = longitude ? parseFloat(longitude as string) : 0;
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [addLocationMode, setAddLocationMode] = useState<{
    active: boolean;
    dayIndex: number | null;
    places: GoogleMapsPlace[];
    startPoint?: GoogleMapsPlace;
  }>({ active: false, dayIndex: null, places: [] });
  const [locationSort, setLocationSort] = useState<LocationSort>("opening");
  const [locationStart, setLocationStart] = useState<
    GoogleMapsPlace | undefined
  >(undefined);
  const [alwaysOpenValue, setAlwaysOpenValue] = useState(screenHeight * 0.23);
  const [editMode, setEditMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<{
    [key: string]: boolean;
  }>({});

  //multi-select state
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  //toggle selection in add location sheet
  const handleToggleLocation = (name: string) => {
    setSelectedLocations((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // add multiple selected locations to the itinerary
  const handleAddMultipleLocations = () => {
    if (addLocationMode.dayIndex === null || selectedLocations.length === 0)
      return;
    const selectedPlaces = addLocationMode.places.filter((p) =>
      selectedLocations.includes(p.name)
    );
    const firestorePlaces = selectedPlaces
      .map(toFirestorePlace)
      .filter(isFirestorePlace);
    if (firestorePlaces.length === 0) return;
    const updated = itinerary.map((day, idx) =>
      idx === addLocationMode.dayIndex
        ? { ...day, places: [...day.places, ...firestorePlaces] }
        : day
    );
    setItinerary(updated);
    setAddLocationMode({ active: false, dayIndex: null, places: [] });
    setSelectedLocations([]);
    setAlwaysOpenValue(screenHeight * 0.23);
    (async () => {
      const all = await getAllItineraries();
      const match = all.find(
        (it) => it.city.toLowerCase() === (city?.toString() || "").toLowerCase()
      );
      if (match && match.id) {
        const filteredDetails = updated.map((day) => ({
          ...day,
          places: day.places.map(toFirestorePlace).filter(isFirestorePlace),
        }));
        const newLocationsCount = filteredDetails.reduce(
          (acc, d) => acc + d.places.length,
          0
        );
        await updateItinerary(match.id, {
          details:
            filteredDetails as import("../data/demoItinerary").ItineraryDay[],
          locations: newLocationsCount,
        });
      }
    })();
  };

  //fetch itinerary from firestore on mount
  useEffect(() => {
    setLoading(true);
    getAllItineraries().then((all) => {
      const itineraryCity = city?.toString() || "";
      const match = getItineraryForCity(all, itineraryCity);
      setItinerary(buildFullItinerary(match));
      setLoading(false);
    });
  }, [city]);

  const removePlace = (dayIndex: number, placeIndex: number) => {
    const updated = itinerary.map((day, idx) =>
      idx === dayIndex
        ? {
            ...day,
            places: day.places.filter((_, placeIdx) => placeIdx !== placeIndex),
          }
        : day
    );
    setItinerary(updated);
    updateItineraryInFirestore(city, updated);
  };

  const getFirestoreDetailsAndCount = (days: ItineraryDay[]) => {
    const details = days.map((day) => ({
      ...day,
      places: day.places.map(toFirestorePlace).filter(isFirestorePlace),
    }));
    const count = details.reduce((acc, d) => acc + d.places.length, 0);
    return { details, count };
  };

  const updateItineraryInFirestore = async (
    city: string | string[] | undefined,
    updated: ItineraryDay[]
  ) => {
    const all = await getAllItineraries();
    const match = all.find(
      (it) => it.city.toLowerCase() === (city?.toString() || "").toLowerCase()
    );
    if (match && match.id) {
      const { details: filteredDetails, count: newLocationsCount } =
        getFirestoreDetailsAndCount(updated);
      await updateItinerary(match.id, {
        details:
          filteredDetails as import("../data/demoItinerary").ItineraryDay[],
        locations: newLocationsCount,
      });
    }
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
            onPress={() =>
              confirmDelete(() => removePlace(dayIndex, placeIndex), {
                title: "Delete location?",
                message:
                  "Are you sure you want to delete this location from the itinerary? This action cannot be undone.",
                confirmText: "Delete",
                cancelText: "Cancel",
              })
            }
          >
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  //add location to a day in the itinerary
  const handleAddLocation = async (dayIndex: number) => {
    const lists = (await getAllGoogleMapsLists()) as (GoogleMapsList & {
      id: string;
    })[];
    const allItineraries = await getAllItineraries();
    const itineraryCity = city?.toString() || "";

    const match = allItineraries.find(
      (it) => it.city.toLowerCase() === itineraryCity.toLowerCase()
    );
    if (!match || !match.googleMapsList) {
      confirmDelete(() => {}, {
        title: "No Google Maps list linked",
        message: `This itinerary does not have a linked Google Maps list. Please edit the itinerary to add one.`,
        confirmText: "OK",
        cancelText: undefined,
      });
      return;
    }
    // Find the Google Maps list by the googleMapsList property (listName)
    const cityList = lists.find((l) => l.listName === match.googleMapsList);
    if (!cityList || !cityList.places || cityList.places.length === 0) {
      confirmDelete(() => {}, {
        title: "No locations available",
        message: `No Google Maps list found for this itinerary or the list is empty.`,
        confirmText: "OK",
        cancelText: undefined,
      });
      return;
    }
    //filter out places already in this day
    const usedNames = new Set(itinerary[dayIndex].places.map((p) => p.name));
    const availablePlaces = cityList.places.filter(
      (p: GoogleMapsPlace) => !usedNames.has(p.name)
    );
    if (availablePlaces.length === 0) {
      confirmDelete(() => {}, {
        title: "All locations added",
        message:
          "All available locations for this day have already been added.",
        confirmText: "OK",
        cancelText: undefined,
      });
      return;
    }
    setAddLocationMode({ active: true, dayIndex, places: availablePlaces });
  };

  const handleAddLocationBack = () => {
    setAddLocationMode({ active: false, dayIndex: null, places: [] });
    setSelectedLocations([]);
  };

  const getSortedPlaces = (places: GoogleMapsPlace[]) => {
    if (locationSort === "opening") {
      return [...places].sort((a, b) => {
        const getHour = (h: string) =>
          parseInt(h.split(":")[0].replace(/\D/g, "")) || 0;
        return getHour(a.hours) - getHour(b.hours);
      });
    } else if (locationSort === "distance" && locationStart) {
      const getDistance = (a: GoogleMapsPlace, b: GoogleMapsPlace) => {
        const dx = a.lat - b.lat;
        const dy = a.lng - b.lng;
        return Math.sqrt(dx * dx + dy * dy);
      };
      return [...places].sort(
        (a, b) => getDistance(a, locationStart) - getDistance(b, locationStart)
      );
    }
    return places;
  };

  // region state for controlled MapView, initially null
  const [region, setRegion] = useState<null | {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }>({
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.06,
    longitudeDelta: 0.04,
  });

  useEffect(() => {
    if (latitude && longitude) {
      setRegion({
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
        latitudeDelta: 0.06,
        longitudeDelta: 0.04,
      });
    }
  }, [latitude, longitude]);

  const allPlaces = itinerary.flatMap((day) => day.places);

  //edit mode handlers
  const handleToggleEditMode = () => {
    setEditMode((prev) => !prev);
    setSelectedForDelete({});
  };

  const cityTitle = Array.isArray(city) ? city[0] : city || "Itinerary";

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: cityTitle,
      headerLeft: () => <HeaderLeft />,
      headerRight: () => (
        <HeaderRight editMode={editMode} onPress={handleToggleEditMode} />
      ),
    });
  }, [cityTitle, editMode]);

  function removeSelectedPlacesForDay(dayIndex: number) {
    const updated = itinerary.map((d: ItineraryDay, idx: number) => {
      if (idx !== dayIndex) return d;
      return {
        ...d,
        places: d.places.filter(
          (_: Place, placeIdx: number) =>
            !selectedForDelete[`${dayIndex}-${placeIdx}`]
        ),
      };
    });
    setItinerary(updated);
    setSelectedForDelete((prev: { [key: string]: boolean }) => {
      const next = { ...prev };
      Object.keys(next).forEach((key: string) => {
        if (key.startsWith(`${dayIndex}-`)) delete next[key];
      });
      return next;
    });
    updateItineraryInFirestore(city, updated);
  }

  //selection for a place in edit mode
  function handleToggleLocationDelete(dayIndex: number, placeIndex: number) {
    const key = `${dayIndex}-${placeIndex}`;
    setSelectedForDelete((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <View style={{ flex: 1, position: "relative" }}>
        {region ? (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            region={region}
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
        ) : (
          <View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: "#181a20", // dark placeholder
              zIndex: 1,
            }}
          />
        )}

        {/* MODALIZE SHEET */}
        <Modalize
          ref={modalizeRef}
          modalStyle={styles.modal}
          handleStyle={styles.handle}
          alwaysOpen={alwaysOpenValue}
          adjustToContentHeight={false}
          modalHeight={screenHeight * 0.93}
          flatListProps={
            addLocationMode.active
              ? {
                  data: getSortedPlaces(addLocationMode.places),
                  renderItem: ({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.placeCard,
                        selectedLocations.includes(item.name) &&
                          styles.placeCardSelected,
                        { marginLeft: 0 },
                      ]}
                      onPress={() => handleToggleLocation(item.name)}
                    >
                      <View style={styles.iconWrap}>
                        {item.type === "food" && (
                          <MaterialCommunityIcons
                            name="silverware-fork-knife"
                            size={24}
                            color={Colors.accent}
                          />
                        )}
                        {item.type === "museum" && (
                          <MaterialCommunityIcons
                            name="bank"
                            size={24}
                            color={Colors.accent}
                          />
                        )}
                        {item.type === "store" && (
                          <Ionicons
                            name="cart"
                            size={24}
                            color={Colors.accent}
                          />
                        )}
                        {item.type === "landmark" && (
                          <Ionicons
                            name="location"
                            size={24}
                            color={Colors.accent}
                          />
                        )}
                        {item.type === "park" && (
                          <MaterialCommunityIcons
                            name="tree"
                            size={24}
                            color={Colors.accent}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.placeName}>{item.name}</Text>
                        <Text style={styles.placeHours}>Open {item.hours}</Text>
                      </View>
                      {selectedLocations.includes(item.name) && (
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color={Colors.accent}
                          style={{ marginLeft: 8 }}
                        />
                      )}
                    </TouchableOpacity>
                  ),
                  keyExtractor: (item) => item.name,
                  contentContainerStyle: {
                    paddingHorizontal: 18,
                    paddingTop: 8,
                    paddingBottom: 20,
                  },
                  ListHeaderComponent: (
                    <LocationPickerScreen
                      places={addLocationMode.places}
                      sort={locationSort}
                      setSort={setLocationSort}
                      start={locationStart}
                      setStart={setLocationStart}
                      onBack={handleAddLocationBack}
                      renderItem={() => null}
                      rightAction={
                        <TouchableOpacity
                          onPress={handleAddMultipleLocations}
                          disabled={selectedLocations.length === 0}
                          style={[
                            styles.addActivityBtn,
                            {
                              marginLeft: 8,
                              opacity: selectedLocations.length === 0 ? 0.4 : 1,
                            },
                          ]}
                          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                          <Ionicons name="checkmark" size={20} color="#fff" />
                        </TouchableOpacity>
                      }
                    />
                  ),
                  ListFooterComponent: <View style={{ height: 60 }} />, // Add extra space at the bottom
                }
              : {
                  data: itinerary,
                  renderItem: ({ item: day, index: dayIndex }) => (
                    <View style={styles.daySection}>
                      <View style={styles.dayHeader}>
                        <Text style={styles.dayTitle}>Day {day.day}</Text>
                        {editMode ? (
                          <TouchableOpacity
                            style={[
                              styles.addActivityBtn,
                              { backgroundColor: "#ff4757" },
                            ]}
                            onPress={() => {
                              confirmDelete(
                                () => removeSelectedPlacesForDay(dayIndex),
                                {
                                  title: "Delete selected locations?",
                                  message:
                                    "Are you sure you want to delete the selected locations from this day? This action cannot be undone.",
                                  confirmText: "Delete",
                                  cancelText: "Cancel",
                                }
                              );
                            }}
                            disabled={
                              !day.places.some(
                                (_: Place, placeIdx: number) =>
                                  selectedForDelete[`${dayIndex}-${placeIdx}`]
                              )
                            }
                          >
                            <Ionicons
                              name="trash-outline"
                              size={20}
                              color="#fff"
                            />
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity
                            style={styles.addActivityBtn}
                            onPress={() => handleAddLocation(dayIndex)}
                          >
                            <Ionicons name="add" size={20} color="#fff" />
                          </TouchableOpacity>
                        )}
                      </View>
                      {/* always render at least the empty state for each day */}
                      {day.places.length === 0 && (
                        <View
                          style={[
                            styles.placeCard,
                            { opacity: 0.5, justifyContent: "center" },
                          ]}
                        >
                          <Text
                            style={{
                              color: Colors.primary,
                              fontStyle: "italic",
                            }}
                          >
                            No locations yet
                          </Text>
                        </View>
                      )}
                      {day.places.map((place: Place, placeIndex: number) => {
                        const isSelected =
                          editMode &&
                          selectedForDelete[`${dayIndex}-${placeIndex}`];
                        return (
                          <Swipeable
                            key={place.name + placeIndex}
                            renderRightActions={(
                              progress: Animated.AnimatedInterpolation<number>
                            ) =>
                              renderRightActions(dayIndex, placeIndex, progress)
                            }
                            rightThreshold={40}
                            overshootRight={false}
                            enabled={!editMode}
                          >
                            <PlaceCard
                              name={place.name}
                              hours={place.hours}
                              isSelected={isSelected}
                              onPress={
                                editMode
                                  ? () =>
                                      handleToggleLocationDelete(
                                        dayIndex,
                                        placeIndex
                                      )
                                  : () => {
                                      navigation.navigate("locationDetails", {
                                        name: place.name,
                                        type: place.type,
                                        hours: place.hours,
                                        lat: place.lat,
                                        lng: place.lng,
                                        city: cityTitle,
                                        day: day.day,
                                      });
                                    }
                              }
                              showCheckmark={editMode}
                              disabled={false}
                              icon={getPlaceIcon(place.type)}
                              style={
                                editMode && isSelected
                                  ? styles.placeCardSelected
                                  : undefined
                              }
                            />
                          </Swipeable>
                        );
                      })}
                    </View>
                  ),
                  keyExtractor: (item) => "day" + item.day,
                  contentContainerStyle: {
                    paddingBottom: editMode ? 120 : 85,
                    paddingHorizontal: 14,
                    paddingTop: 14,
                  },
                  showsVerticalScrollIndicator: false,
                  ListFooterComponent: (
                    <>
                      {editMode && (
                        <View style={styles.addDayContainer}>
                          <TouchableOpacity
                            style={styles.addDayButton}
                            onPress={() => {
                              //add new day to itinerary
                              setItinerary((prev) => [
                                ...prev,
                                { day: prev.length + 1, places: [] },
                              ]);
                            }}
                          >
                            <Ionicons
                              name="add"
                              size={22}
                              color="#fff"
                              style={{ marginRight: 6 }}
                            />
                            <Text style={styles.addDayText}>Add Day</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[
                              styles.addDayButton,
                              {
                                backgroundColor: "#ff4757",
                                marginTop: 12,
                              },
                            ]}
                            onPress={() => {
                              // Remove the last day from the itinerary
                              setItinerary((prev) =>
                                prev.length > 0 ? prev.slice(0, -1) : prev
                              );
                            }}
                            disabled={itinerary.length === 0}
                          >
                            <Ionicons
                              name="remove"
                              size={22}
                              color="#fff"
                              style={{ marginRight: 6 }}
                            />
                            <Text style={styles.addDayText}>Remove Day</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {loading && (
                        <Text style={{ textAlign: "center", marginTop: 20 }}>
                          Loading...
                        </Text>
                      )}
                    </>
                  ),
                }
          }
        />
      </View>
    </>
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
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 2,
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
    width: 60,
    height: 6,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 10,
  },
  daySection: {
    marginVertical: 10,
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
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  placeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 12,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  placeCardSelected: {
    borderColor: Colors.accent,
    borderWidth: 2,
    backgroundColor: "#e6f7fa",
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
    width: "100%",
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
    width: 54,
    paddingLeft: 20,
    height: "100%",
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: 40,
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
  iconWrap: {
    marginRight: 12,
  },
  editListBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 12,
    elevation: 2,
  },
});
