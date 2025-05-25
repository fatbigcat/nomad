// nomad/app/data/itineraryDb.ts
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { ItineraryDay } from "./demoItinerary";

export type Itinerary = {
  city: string;
  days: number;
  locations: number;
  details: ItineraryDay[];
};

const itinerariesCol = collection(db, "itineraries");

export async function addItinerary(itinerary: Itinerary) {
  const docRef = await addDoc(itinerariesCol, itinerary);
  return docRef.id;
}

export async function getAllItineraries() {
  const snapshot = await getDocs(itinerariesCol);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Itinerary),
  }));
}

export async function updateItinerary(id: string, data: Partial<Itinerary>) {
  const docRef = doc(db, "itineraries", id);
  await updateDoc(docRef, data);
}

export async function deleteItinerary(id: string) {
  const docRef = doc(db, "itineraries", id);
  await deleteDoc(docRef);
}
