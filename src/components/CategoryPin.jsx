import L from "leaflet";
import { CATEGORY_COLORS } from "../utils/categoryColors";

function createPinMarkup({ fill, glyph, ring }) {
  return `
    <div style="position:relative; width:30px; height:40px; display:flex; align-items:flex-start; justify-content:center;">
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M15 2C8.373 2 3 7.373 3 14c0 8.776 9.285 18.956 11.46 21.217a.75.75 0 0 0 1.08 0C17.715 32.956 27 22.776 27 14 27 7.373 21.627 2 15 2Z" fill="${fill}" stroke="${ring}" stroke-width="1.5"/>
        <circle cx="15" cy="14" r="6.5" fill="white" fill-opacity="0.95"/>
        ${glyph}
      </svg>
    </div>
  `;
}

export function createCategoryIcon(category) {
  const color = CATEGORY_COLORS[category] || "#6B7280";
  return L.divIcon({
    className: "",
    html: createPinMarkup({
      fill: color,
      ring: "rgba(255,255,255,0.9)",
      glyph: `<circle cx="15" cy="14" r="3" fill="${color}" />`,
    }),
    iconSize: [30, 40],
    iconAnchor: [15, 36],
    popupAnchor: [0, -32],
  });
}

export function createCurrentLocationIcon() {
  return L.divIcon({
    className: "",
    html: createPinMarkup({
      fill: "#0D9488",
      ring: "rgba(255,255,255,0.95)",
      glyph: `
        <path d="M15 9.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 1.8a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" fill="#0D9488"/>
        <path d="M15 6.8a.9.9 0 0 1 .9.9v1.1a.9.9 0 1 1-1.8 0V7.7a.9.9 0 0 1 .9-.9Zm0 12.4a.9.9 0 0 1 .9.9v1.1a.9.9 0 1 1-1.8 0v-1.1a.9.9 0 0 1 .9-.9Zm7.3-6.2a.9.9 0 0 1 0 1.8h-1.1a.9.9 0 0 1 0-1.8h1.1Zm-12.4 0a.9.9 0 0 1 0 1.8H8.8a.9.9 0 0 1 0-1.8h1.1Z" fill="#0D9488"/>
      `,
    }),
    iconSize: [30, 40],
    iconAnchor: [15, 36],
    popupAnchor: [0, -32],
  });
}
