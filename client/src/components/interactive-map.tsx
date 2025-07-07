import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrailPoint } from "@shared/schema";
import { Plus, Minus, Pencil, Undo, Trash2 } from "lucide-react";

// Leaflet CSS is imported globally in index.css

const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const startIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface InteractiveMapProps {
  points: TrailPoint[];
  onPointAdd: (point: TrailPoint) => void;
  onPointRemove: (index: number) => void;
  onClearAll: () => void;
  drawingMode: boolean;
  onDrawingModeToggle: () => void;
}

function MapClickHandler({ 
  onPointAdd, 
  drawingMode 
}: { 
  onPointAdd: (point: TrailPoint) => void;
  drawingMode: boolean;
}) {
  useMapEvents({
    click: (e) => {
      if (!drawingMode) return;
      
      const { lat, lng } = e.latlng;
      const point: TrailPoint = {
        id: Date.now().toString(),
        time: new Date().toISOString(),
        lat,
        lon: lng,
        altitude: 100 + Math.random() * 100, // Simulated altitude
      };
      onPointAdd(point);
    },
  });

  return null;
}

export function InteractiveMap({
  points,
  onPointAdd,
  onPointRemove,
  onClearAll,
  drawingMode,
  onDrawingModeToggle,
}: InteractiveMapProps) {
  const mapRef = useRef<any>(null);
  const [center] = useState<LatLngExpression>([47.6062, -122.3321]); // Seattle default
  const [mapKey, setMapKey] = useState(0); // Force re-render if needed
  
  useEffect(() => {
    console.log("InteractiveMap component mounted");
    console.log("Leaflet available:", typeof window !== 'undefined' && window.L);
  }, []);

  const handleUndo = () => {
    if (points.length > 0) {
      onPointRemove(points.length - 1);
    }
  };

  const handleZoomIn = () => {
    const map = mapRef.current;
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (map) {
      map.zoomOut();
    }
  };

  // Convert points to LatLng for polyline
  const pathCoordinates: LatLngExpression[] = points.map(point => [point.lat, point.lon]);

  return (
    <div className="flex-1 relative map-container">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] space-y-2">
        <Card className="p-2 bg-white shadow-lg">
          <div className="flex flex-col space-y-1">
            <Button
              size="sm"
              variant={drawingMode ? "default" : "outline"}
              onClick={onDrawingModeToggle}
              className="w-10 h-10 p-0"
              title="Toggle Drawing Mode"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUndo}
              disabled={points.length === 0}
              className="w-10 h-10 p-0"
              title="Undo Last Point"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClearAll}
              disabled={points.length === 0}
              className="w-10 h-10 p-0"
              title="Clear All Points"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
        
        <Card className="p-2 bg-white shadow-lg">
          <div className="flex flex-col space-y-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomIn}
              className="w-10 h-10 p-0"
              title="Zoom In"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleZoomOut}
              className="w-10 h-10 p-0"
              title="Zoom Out"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Drawing Mode Status */}
      {drawingMode && (
        <div className="absolute top-4 left-4 z-[1000]">
          <Card className="px-4 py-2 bg-white shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900">Drawing Mode Active</span>
              <span className="text-xs text-gray-500">Click to add points</span>
            </div>
          </Card>
        </div>
      )}

      {/* Map Container with Error Boundary */}
      <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          className="leaflet-container"
          key={`map-${mapKey}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onPointAdd={onPointAdd} drawingMode={drawingMode} />
          
          {/* Render markers */}
          {points.map((point, index) => {
            const isStart = index === 0;
            const isEnd = index === points.length - 1 && points.length > 1;
            let markerIcon = icon;
            
            if (isStart) markerIcon = startIcon;
            else if (isEnd) markerIcon = endIcon;
            
            return (
              <Marker
                key={point.id}
                position={[point.lat, point.lon]}
                icon={markerIcon}
              />
            );
          })}
          
          {/* Render path */}
          {pathCoordinates.length > 1 && (
            <Polyline
              positions={pathCoordinates}
              color="#1976D2"
              weight={4}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
