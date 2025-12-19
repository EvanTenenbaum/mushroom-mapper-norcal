/**
 * Checks if a point is inside a polygon using the Ray Casting algorithm.
 * @param point [longitude, latitude]
 * @param vs Array of polygon vertices [[lng, lat], [lng, lat], ...]
 */
export function pointInPolygon(point: [number, number], vs: number[][]) {
  const x = point[0], y = point[1];
  let inside = false;
  
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];
    
    const intersect = ((yi > y) !== (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}

/**
 * Checks if a coordinate is within any public land feature.
 * @param lat Latitude
 * @param lng Longitude
 * @param publicLands GeoJSON FeatureCollection
 * @returns The name of the public land if found, otherwise null.
 */
export function checkPublicLand(lat: number, lng: number, publicLands: any): string | null {
  if (!publicLands || !publicLands.features) return null;

  for (const feature of publicLands.features) {
    if (feature.geometry.type === "Polygon") {
      // Handle simple Polygons (array of rings, first ring is outer boundary)
      const coordinates = feature.geometry.coordinates[0]; 
      if (pointInPolygon([lng, lat], coordinates)) {
        return feature.properties.name;
      }
    } else if (feature.geometry.type === "MultiPolygon") {
      // Handle MultiPolygons
      for (const polygon of feature.geometry.coordinates) {
        const coordinates = polygon[0];
        if (pointInPolygon([lng, lat], coordinates)) {
          return feature.properties.name;
        }
      }
    }
  }
  
  return null;
}
