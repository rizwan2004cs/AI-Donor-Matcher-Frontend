import L from "leaflet";
import { CATEGORY_COLORS } from "../utils/categoryColors";

export function createCategoryIcon(category) {
  const color = CATEGORY_COLORS[category] || "#6B7280";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:24px; height:24px; border-radius:50%;
      background:${color}; border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);">
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
