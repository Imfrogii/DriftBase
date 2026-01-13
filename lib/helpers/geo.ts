import wkx from "wkx";

export const getLatLng = (geom: string | null | undefined) => {
  if (!geom) return { latitude: 0, longitude: 0 };

  try {
    const buffer = Buffer.from(geom, "hex");
    const geometry = wkx.Geometry.parse(buffer);
    const { coordinates } = geometry.toGeoJSON();

    if (Array.isArray(coordinates) && coordinates.length === 2) {
      return {
        longitude: coordinates[0] as number,
        latitude: coordinates[1] as number,
      };
    }
  } catch (error) {
    console.warn("Failed to parse geom:", error);
  }

  return { latitude: 0, longitude: 0 };
};
