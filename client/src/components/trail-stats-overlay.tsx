import { Card } from "@/components/ui/card";
import { TrailPoint } from "@shared/schema";

interface TrailStatsOverlayProps {
  points: TrailPoint[];
  distance: number;
  estimatedTime: number;
}

export function TrailStatsOverlay({ points, distance, estimatedTime }: TrailStatsOverlayProps) {
  const calculateElevationGain = (points: TrailPoint[]): number => {
    if (points.length < 2) return 0;
    
    let gain = 0;
    for (let i = 1; i < points.length; i++) {
      const diff = points[i].altitude - points[i - 1].altitude;
      if (diff > 0) gain += diff;
    }
    return Math.round(gain);
  };

  const elevationGain = calculateElevationGain(points);
  const distanceKm = (distance / 1000).toFixed(1);
  const timeMinutes = Math.round(estimatedTime / 60000);

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <Card className="p-4 min-w-64 bg-white shadow-lg">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{distanceKm}</p>
            <p className="text-xs text-gray-500">km</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-secondary">+{elevationGain}</p>
            <p className="text-xs text-gray-500">elevation (m)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{timeMinutes}</p>
            <p className="text-xs text-gray-500">min</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
