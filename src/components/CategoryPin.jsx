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
    html: `
      <div style="position:relative; width:26px; height:26px; display:flex; align-items:center; justify-content:center;">
        <span style="position:absolute; inset:0; border-radius:9999px; background:rgba(14,165,233,0.22); border:1px solid rgba(14,165,233,0.35);"></span>
        <span style="position:absolute; width:14px; height:14px; border-radius:9999px; background:#0ea5e9; border:3px solid white; box-shadow:0 6px 16px rgba(14,165,233,0.35);"></span>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}
