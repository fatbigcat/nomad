import React from "react";
import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import Colors from "@/constants/Colors";

export type ShareItineraryProps = {
  city: string;
  days: number;
  locations: number;
  details?: Array<{
    day: number;
    places: Array<{ name: string; hours: string; lat: number; lng: number }>;
  }>;
  buttonStyle?: any;
  iconColor?: string;
};

export default function ShareItinerary({
  city,
  days,
  locations,
  details = [],
  buttonStyle,
  iconColor = Colors.accent,
}: ShareItineraryProps) {
  const handleShare = async () => {
    const fileName = `${city.replace(/\s+/g, "_")}_itinerary.pdf`;
    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              background: #f8f6f1;
              color: ${Colors.primary};
              margin: 0;
              padding: 0 24px 24px 24px;
            }
            .header {
              text-align: center;
              margin-top: 32px;
            }
            .city {
              font-size: 32px;
              font-weight: bold;
              color: ${Colors.accent};
              margin-bottom: 8px;
            }
            .meta {
              color: ${Colors.accent};
              font-size: 18px;
              margin-bottom: 24px;
            }
            .day {
              margin-top: 24px;
              margin-bottom: 8px;
              font-size: 22px;
              font-weight: 700;
              color: ${Colors.primary};
            }
            .place-list {
              list-style: none;
              padding: 0;
            }
            .place {
              background: #fff;
              border-radius: 18px;
              margin-bottom: 12px;
              padding: 14px 18px;
              box-shadow: 0 2px 8px #0001;
              font-size: 16px;
              color: ${Colors.primary};
            }
            .hours {
              color: ${Colors.accent};
              font-size: 13px;
              font-weight: 500;
              margin-left: 8px;
            }
            .gmap-link {
              color: #1499b2;
              text-decoration: underline;
              font-size: 13px;
              margin-left: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="city">${city}</div>
            <div class="meta">${days} days &nbsp; • &nbsp; ${locations} locations</div>
          </div>
          ${details
            .map(
              (day) => `
                <div class="day">Day ${day.day}</div>
                <ul class="place-list">
                  ${day.places
                    .map((place) => {
                      const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
                        place.name
                      )}+@${place.lat},${place.lng}`;
                      return `<li class="place"><b>${place.name}</b><span class="hours">${place.hours}</span><br/><a href='${mapsUrl}' class="gmap-link">Open in Google Maps (${place.lat.toFixed(5)}, ${place.lng.toFixed(5)})</a></li>`;
                    })
                    .join("")}
                </ul>
              `
            )
            .join("")}
        </body>
      </html>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    const newUri = FileSystem.cacheDirectory + fileName;
    await FileSystem.moveAsync({ from: uri, to: newUri });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newUri);
    } else {
      alert("Sharing is not available on this device");
    }
  };

  return (
    <Pressable
      onPress={handleShare}
      style={[
        { padding: 4, flexDirection: "row", alignItems: "center" },
        buttonStyle,
      ]}
      accessibilityLabel="Share itinerary as PDF"
    >
      <Ionicons name="share-social" size={24} color={iconColor} />
    </Pressable>
  );
}
