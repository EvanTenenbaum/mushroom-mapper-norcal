# Technical Specification: NorCal Mushroom Probability Mapper

## 1. Overview
A hyperlocal mushroom probability mapping system for Northern California, visualizing guild-specific probabilities, uncertainty, and weather data on an interactive map.

## 2. Architecture
- **Frontend**: React 19 + Tailwind 4 (Static SPA)
- **Mapping Engine**: Google Maps JavaScript API (via Manus Proxy)
- **State Management**: React Context + Hooks
- **Data Storage**: Static JSON/GeoJSON files (simulating API responses for this static build)
- **Routing**: Wouter (Client-side routing)

## 3. Core Components

### 3.1 Map Interface (`components/Map/`)
- **MainMap**: Wrapper around Google Maps instance.
- **LayerControl**: Floating HUD for toggling guilds, uncertainty, and weather layers.
- **ProbabilityLayer**: Custom overlay (Canvas or ImageMapType) rendering probability tiles.
- **UncertaintyOverlay**: Pattern overlay for uncertainty levels.
- **POIMarker**: Markers for specific points of interest (trailheads, parking).

### 3.2 Data Layers (Simulated)
- **Guilds**:
  - Chanterelle (Golden)
  - Hedgehog (Bellybutton/Sweet Tooth)
  - Black Trumpet
  - Candy Cap
  - Porcini
  - Burn Morel
- **Weather**:
  - Precipitation (Last 7 days)
  - Soil Moisture Index (SMI)

### 3.3 UI Components (`components/UI/`)
- **GuildCard**: Detailed card for selected guild info.
- **WeatherWidget**: Current weather + 7-day outlook summary.
- **UncertaintyBadge**: Visual indicator of data confidence (A/B/C).
- **TimelineSlider**: Control to view historical or forecast probability.

## 4. Data Structure (Static)

### 4.1 Guild Metadata (`data/guilds.json`)
```json
[
  {
    "id": "chanterelle_oak",
    "name": "Golden Chanterelle",
    "scientificName": "Cantharellus californicus",
    "tier": "A",
    "color": "#FFD700",
    "seasonality": "Late Fall - Winter",
    "habitat": "Live Oak, Tanoak",
    "description": "..."
  },
  ...
]
```

### 4.2 GeoJSON Data (`data/geo/`)
- `aoi.geojson`: Region of Interest boundary.
- `hotspots.geojson`: Simulated high-probability zones for demo.

## 5. Design System ("Mycelial Network")
- **Colors**:
  - Background: Deep Forest Green / Black (`#0a1f1c`)
  - Accents: Bioluminescent Blue (`#00f0ff`), Spore Orange (`#ff9a00`), Toxic Purple (`#bd00ff`)
  - Text: Off-white / Pale Grey (`#e0e0e0`)
- **Typography**:
  - Headings: *Space Grotesk*
  - Body: *Inter*
  - Mono: *JetBrains Mono*
- **Effects**:
  - Glassmorphism for HUD panels.
  - Glowing borders for active states.
  - Subtle particle animations.

## 6. Implementation Plan
1.  **Setup**: Install dependencies (lucide-react, clsx, tailwind-merge).
2.  **Assets**: Place generated images and download fonts.
3.  **Components**: Build atomic UI components (Buttons, Cards, Badges).
4.  **Map Integration**: Implement Google Maps wrapper and custom styling.
5.  **Layer Logic**: Create the logic to switch between guild data layers.
6.  **Data Integration**: Populate with research data from Phase 2.
7.  **Polish**: Apply "Mycelial Network" styling and animations.
