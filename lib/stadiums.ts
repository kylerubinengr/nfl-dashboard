export const STADIUM_REGISTRY: Record<string, { lat: number; lon: number; indoor: boolean }> = {
  // OPEN-AIR STADIUMS
  "Highmark Stadium": { lat: 42.7738, lon: -78.7874, indoor: false },
  "Levi's Stadium": { lat: 37.4033, lon: -121.9702, indoor: false },
  "Paycor Stadium": { lat: 39.0955, lon: -84.5161, indoor: false },
  "Lambeau Field": { lat: 44.5013, lon: -88.0622, indoor: false },
  "GEHA Field at Arrowhead Stadium": { lat: 39.0489, lon: -94.4839, indoor: false },
  "Arrowhead Stadium": { lat: 39.0489, lon: -94.4839, indoor: false }, // Alias
  "Commanders Field": { lat: 38.9076, lon: -76.8645, indoor: false },
  "Northwest Stadium": { lat: 38.9076, lon: -76.8645, indoor: false }, // Alias
  "Soldier Field": { lat: 41.8623, lon: -87.6167, indoor: false },
  "Acrisure Stadium": { lat: 40.4467, lon: -80.0158, indoor: false },
  "MetLife Stadium": { lat: 40.8128, lon: -74.0742, indoor: false },
  "Lincoln Financial Field": { lat: 39.9008, lon: -75.1675, indoor: false },
  "Gillette Stadium": { lat: 42.0909, lon: -71.2643, indoor: false },
  "Empower Field at Mile High": { lat: 39.7439, lon: -105.0201, indoor: false },
  "Lumen Field": { lat: 47.5952, lon: -122.3316, indoor: false },
  "M&T Bank Stadium": { lat: 39.2780, lon: -76.6227, indoor: false },
  "Bank of America Stadium": { lat: 35.2258, lon: -80.8528, indoor: false },
  "FirstEnergy Stadium": { lat: 41.5061, lon: -81.6995, indoor: false },
  "Cleveland Browns Stadium": { lat: 41.5061, lon: -81.6995, indoor: false }, // Alias
  "TIAA Bank Field": { lat: 30.3240, lon: -81.6373, indoor: false },
  "EverBank Stadium": { lat: 30.3240, lon: -81.6373, indoor: false }, // Alias
  "Hard Rock Stadium": { lat: 30.3240, lon: -81.6373, indoor: false },
  "Nissan Stadium": { lat: 36.1665, lon: -86.7713, indoor: false },
  "Raymond James Stadium": { lat: 25.9580, lon: -80.2389, indoor: false },
  
  // DOMES / FULLY ENCLOSED
  "U.S. Bank Stadium": { lat: 44.9735, lon: -93.2575, indoor: true },
  "Ford Field": { lat: 42.3400, lon: -83.0456, indoor: true },
  "Caesars Superdome": { lat: 29.9511, lon: -90.0812, indoor: true },
  "Allegiant Stadium": { lat: 36.0909, lon: -115.1833, indoor: true },

  // RETRACTABLE / TRANSLUCENT (Treat as Indoor if roof is typically closed)
  "SoFi Stadium": { lat: 33.9535, lon: -118.3392, indoor: true }, 
  "AT&T Stadium": { lat: 32.7473, lon: -97.0945, indoor: true },
  "State Farm Stadium": { lat: 33.5276, lon: -112.2626, indoor: true },
  "Mercedes-Benz Stadium": { lat: 33.7553, lon: -84.4006, indoor: true },
  "Lucas Oil Stadium": { lat: 39.7601, lon: -86.1639, indoor: true },
  "NRG Stadium": { lat: 29.6847, lon: -95.4107, indoor: true }
};