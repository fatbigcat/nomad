// nomad/app/data/googleMapsDb.ts
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export type GoogleMapsPlace = {
  name: string;
  lat: number;
  lng: number;
  hours: string;
  type: "landmark" | "museum" | "food" | "park" | "store";
};

export type GoogleMapsList = {
  city: string;
  listName: string;
  places: GoogleMapsPlace[];
};

const googleMapsListsCol = collection(db, "googleMapsLists");

export async function addGoogleMapsList(list: GoogleMapsList) {
  const docRef = await addDoc(googleMapsListsCol, list);
  return docRef.id;
}

export async function getAllGoogleMapsLists() {
  const snapshot = await getDocs(googleMapsListsCol);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateGoogleMapsList(
  id: string,
  data: Partial<GoogleMapsList>
) {
  const docRef = doc(db, "googleMapsLists", id);
  await updateDoc(docRef, data);
}

export async function deleteGoogleMapsList(id: string) {
  const docRef = doc(db, "googleMapsLists", id);
  await deleteDoc(docRef);
}
