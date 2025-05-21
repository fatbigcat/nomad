// /data/itineraries.ts
export type Itinerary = {
  city: string;
  days: number;
  locations: number;
};

const itineraries: Itinerary[] = [
  { city: "Paris", days: 4, locations: 18 },
  { city: "Milano", days: 3, locations: 20 },
  { city: "New York", days: 7, locations: 29 },
  { city: "Frankfurt", days: 2, locations: 10 },
  { city: "Copenhagen", days: 5, locations: 12 },
];

export default itineraries;
