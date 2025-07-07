import { TrailPoint, RouteSegment } from "@shared/schema";

// OpenRouteService API configuration
const ORS_API_KEY = '5b3ce3597851110001cf62489ee1f0d7885a41ba8e33b90e91ac6066'; // Public demo key
const ORS_BASE_URL = 'https://api.openrouteservice.org/v2';

interface ORSDirectionsResponse {
  features: Array<{
    geometry: {
      coordinates: number[][];
    };
    properties: {
      summary: {
        distance: number;
        duration: number;
      };
    };
  }>;
}

/**
 * Get route between two points using OpenRouteService
 */
export async function getRouteBetweenPoints(
  start: TrailPoint,
  end: TrailPoint,
  profile: 'foot-walking' | 'cycling-regular' | 'driving-car' = 'foot-walking'
): Promise<RouteSegment | null> {
  try {
    const url = `${ORS_BASE_URL}/directions/${profile}`;
    const coordinates = [
      [start.lon, start.lat],
      [end.lon, end.lat]
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coordinates,
        format: 'geojson',
        instructions: false,
        geometry_simplify: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Routing request failed: ${response.status}`);
    }

    const data: ORSDirectionsResponse = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        coordinates: feature.geometry.coordinates,
        distance: feature.properties.summary.distance,
        duration: feature.properties.summary.duration,
      };
    }

    return null;
  } catch (error) {
    console.warn('Routing failed, falling back to straight line:', error);
    return null;
  }
}

/**
 * Get routed path for multiple trail points
 */
export async function getRoutedTrail(points: TrailPoint[]): Promise<RouteSegment[]> {
  if (points.length < 2) {
    return [];
  }

  const segments: RouteSegment[] = [];
  
  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    
    const segment = await getRouteBetweenPoints(start, end);
    if (segment) {
      segments.push(segment);
    } else {
      // Fallback to straight line
      segments.push({
        coordinates: [
          [start.lon, start.lat],
          [end.lon, end.lat]
        ],
        distance: calculateDistance(start, end),
        duration: 0,
      });
    }
  }

  return segments;
}

/**
 * Calculate straight-line distance between two points (Haversine formula)
 */
function calculateDistance(point1: TrailPoint, point2: TrailPoint): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lon - point1.lon) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

/**
 * Convert route segments to Leaflet polyline coordinates
 */
export function routeSegmentsToLatLngs(segments: RouteSegment[]): [number, number][] {
  const coordinates: [number, number][] = [];
  
  segments.forEach((segment) => {
    segment.coordinates.forEach(([lng, lat]) => {
      coordinates.push([lat, lng]); // Leaflet uses [lat, lng]
    });
  });

  return coordinates;
}

/**
 * Calculate total distance from route segments
 */
export function calculateTotalRouteDistance(segments: RouteSegment[]): number {
  return segments.reduce((total, segment) => total + (segment.distance || 0), 0);
}

/**
 * Calculate total duration from route segments
 */
export function calculateTotalRouteDuration(segments: RouteSegment[]): number {
  return segments.reduce((total, segment) => total + (segment.duration || 0), 0);
}