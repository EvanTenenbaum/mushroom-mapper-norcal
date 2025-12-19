import { useEffect, useRef, useState } from 'react';
import { MapView } from '@/components/Map';
import { updateProbabilityLayer } from './ProbabilityLayer';
import { addUncertaintyLayer } from './UncertaintyLayer';

interface MainMapProps {
  onMapLoad?: (map: google.maps.Map) => void;
  selectedGuildId?: string;
  showUncertainty?: boolean;
}

export default function MainMap({ onMapLoad, selectedGuildId, showUncertainty }: MainMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const probabilityLayerRef = useRef<{ remove: () => void } | null>(null);
  const uncertaintyLayerRef = useRef<{ remove: () => void } | null>(null);

  // Northern California Bounds
  const NORCAL_BOUNDS = {
    north: 42.0,
    south: 36.5,
    west: -124.5,
    east: -119.0,
  };

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);
    
    // Set initial view to NorCal
    map.setCenter({ lat: 38.5, lng: -122.5 }); // Centered near Santa Rosa
    map.setZoom(8);
    
    // Restrict bounds
    map.setOptions({
      restriction: {
        latLngBounds: NORCAL_BOUNDS,
        strictBounds: false,
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: DARK_MAP_STYLE, // Apply custom dark theme
    });

    if (onMapLoad) onMapLoad(map);
  };

  // Update Probability Layer (Guilds)
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedGuildId) return;

    // Cleanup previous layer
    if (probabilityLayerRef.current) {
      probabilityLayerRef.current.remove();
    }

    // Add new layer
    probabilityLayerRef.current = updateProbabilityLayer(mapRef.current, selectedGuildId);

    return () => {
      if (probabilityLayerRef.current) probabilityLayerRef.current.remove();
    };
  }, [mapReady, selectedGuildId]);

  // Update Uncertainty Layer
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (showUncertainty) {
      if (!uncertaintyLayerRef.current) {
        uncertaintyLayerRef.current = addUncertaintyLayer(mapRef.current);
      }
    } else {
      if (uncertaintyLayerRef.current) {
        uncertaintyLayerRef.current.remove();
        uncertaintyLayerRef.current = null;
      }
    }
  }, [mapReady, showUncertainty]);

  return (
    <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
      <MapView 
        className="w-full h-full"
        onMapReady={handleMapReady}
      />
      
      {/* Loading Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-primary font-mono text-sm animate-pulse">INITIALIZING SATELLITE UPLINK...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Dark Map Style for "Mycelial Network" theme
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];
