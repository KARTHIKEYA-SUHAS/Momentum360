import * as Location from "expo-location";

export type CurrentLocation = {
  latitude: number;
  longitude: number;
};

export async function getCurrentLocation(): Promise<CurrentLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== Location.PermissionStatus.GRANTED) {
    throw new Error("Location permission is required to check in.");
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
}
