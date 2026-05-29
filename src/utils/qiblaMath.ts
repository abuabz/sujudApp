export const MECCA_LATITUDE = 21.422487;
export const MECCA_LONGITUDE = 39.826206;

/**
 * Calculates the bearing to the Qibla (Mecca) from a given coordinate.
 * Uses the Haversine formula for spherical trigonometry.
 * 
 * @param lat Current latitude in degrees
 * @param lng Current longitude in degrees
 * @returns The bearing in degrees from North (0-360)
 */
export function calculateQiblaBearing(lat: number, lng: number): number {
  // Convert degrees to radians
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  
  const meccaLatRad = (MECCA_LATITUDE * Math.PI) / 180;
  const meccaLngRad = (MECCA_LONGITUDE * Math.PI) / 180;
  
  // Calculate difference in longitude
  const dLng = meccaLngRad - lngRad;
  
  // Formula for bearing
  const y = Math.sin(dLng) * Math.cos(meccaLatRad);
  const x = Math.cos(latRad) * Math.sin(meccaLatRad) - Math.sin(latRad) * Math.cos(meccaLatRad) * Math.cos(dLng);
  
  let bearingRad = Math.atan2(y, x);
  
  // Convert bearing from radians to degrees
  let bearingDeg = (bearingRad * 180) / Math.PI;
  
  // Normalize to 0-360
  return (bearingDeg + 360) % 360;
}
