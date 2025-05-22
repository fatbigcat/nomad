// /data/demoItinerary.ts

export type Place = {
  name: string;
  type: "food" | "museum" | "store";
  hours: string;
  lat: number;
  lng: number;
};

export type ItineraryDay = {
  day: number;
  places: Place[];
};

const demoItinerary: ItineraryDay[] = [
  {
    day: 1,
    places: [
      {
        name: "Terroirs d’Avenir",
        type: "food",
        hours: "08:00 - 20:00",
        lat: 48.8655,
        lng: 2.3611,
      },
      {
        name: "Musée du Parfum",
        type: "museum",
        hours: "08:00 - 17:30",
        lat: 48.8705,
        lng: 2.3272,
      },
      {
        name: "Galeries Lafayette",
        type: "store",
        hours: "08:00 - 20:00",
        lat: 48.872,
        lng: 2.3325,
      },
    ],
  },
  {
    day: 2,
    places: [
      {
        name: "CORTADO",
        type: "food",
        hours: "08:00 - 20:00",
        lat: 48.8582,
        lng: 2.347,
      },
      {
        name: "La Closerie des Lilas",
        type: "food",
        hours: "08:00 - 20:00",
        lat: 48.8415,
        lng: 2.3385,
      },
      {
        name: "Musée d'Orsay",
        type: "museum",
        hours: "09:30 - 18:00",
        lat: 48.86,
        lng: 2.3266,
      },
    ],
  },
  {
    day: 3,
    places: [
      {
        name: "Le Marais Market",
        type: "food",
        hours: "09:00 - 19:00",
        lat: 48.857,
        lng: 2.362,
      },
      {
        name: "Louvre Museum",
        type: "museum",
        hours: "09:00 - 18:00",
        lat: 48.8606,
        lng: 2.3376,
      },
      {
        name: "Printemps Haussmann",
        type: "store",
        hours: "09:30 - 20:00",
        lat: 48.8722,
        lng: 2.3288,
      },
    ],
  },
];

export default demoItinerary;
