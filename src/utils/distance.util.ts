export class DistanceUtil {
  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static findNearestPoint(
    currentPoint: { lat: number; lon: number },
    points: Array<{ lat: number; lon: number; id: number }>,
  ): { id: number; distance: number } {
    let nearest = { id: -1, distance: Infinity };

    for (const point of points) {
      const distance = this.calculateDistance(
        currentPoint.lat,
        currentPoint.lon,
        point.lat,
        point.lon,
      );

      if (distance < nearest.distance) {
        nearest = { id: point.id, distance };
      }
    }

    return nearest;
  }
} 