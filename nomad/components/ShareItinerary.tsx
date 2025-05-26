import React from "react";
import { Pressable } from "react-native";
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
}: Readonly<ShareItineraryProps>) {
  const handleShare = async () => {
    const fileName = `${city.replace(/\s+/g, "_")}_itinerary.pdf`;
    const html = `
<html>
<head>
  <meta charset="utf-8">
  <title>${city} Itinerary</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Montserrat', Arial, sans-serif;
      background: transparent;
      color: ${Colors.primary};
      margin: 0;
      padding: 0 0 24px 0;
    }
    .header {
      text-align: center;
      margin-top: 32px;
      margin-bottom: 16px;
      background: transparent;
    }
    .city {
      font-size: 32px;
      font-weight: 700;
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
      padding-left: 24px;
    }
    .place-list {
      list-style: none;
      padding: 0 24px 0 24px;
      margin: 0;
    }
    .place {
      background: #f8f6f1;
      border-radius: 18px;
      margin-bottom: 14px;
      padding: 14px 18px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.09);
      font-size: 16px;
      color: ${Colors.primary};
      display: flex;
      align-items: flex-start;
    }
    .icon {
      font-size: 20px;
      margin-right: 10px;
      margin-top: 2px;
      width: 22px;
      text-align: center;
    }
    .place-content {
      flex: 1;
    }
    .place-name {
      font-weight: 600;
      color: ${Colors.accent};
      font-size: 17px;
    }
    .hours {
      color: ${Colors.accent};
      font-size: 13px;
      font-weight: 500;
      margin-left: 4px;
    }
    .gmap-link {
      color: #1499b2;
      text-decoration: underline;
      font-size: 13px;
      margin-left: 0;
      display: block;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="city">${city}</div>
    <div class="meta">${days} days • ${locations} locations</div>
  </div>
  ${details
    .map(
      (day) => `
        <div class="day">Day ${day.day}</div>
        <ul class="place-list">
          ${day.places
            .map((place) => {
              let icon = "📍"; // default
              if (/beach/i.test(place.name)) icon = "🏖️";
              else if (
                /mercado|market|restaurant|food|boqueria/i.test(place.name)
              )
                icon = "🍴";
              else if (/corte/i.test(place.name)) icon = "🛒";
              // Add more rules as needed
              const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
                place.name
              )}+@${place.lat},${place.lng}`;
              return `<li class="place">
                <div class="icon">${icon}</div>
                <div class="place-content">
                  <div class="place-name">${place.name}</div>
                  <span class="hours">${place.hours}</span>
                  <a href="${mapsUrl}" class="gmap-link">Open in Google Maps (${place.lat.toFixed(
                5
              )}, ${place.lng.toFixed(5)})</a>
              <a href="${mapsUrl}" style="font-size:12px; color:#888; word-break:break-all; margin-top:2px; text-decoration:underline;">${mapsUrl}</a>
              <a href="${mapsUrl}" class="gmap-link" style="display: none;"></a>
                </div>
              </li>`;
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
