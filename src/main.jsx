import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Fix Leaflet default marker icons
import "./utils/fixLeafletIcons";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => console.log("SW registered:", reg.scope))
      .catch((err) => console.log("SW registration failed:", err));
  });
}
