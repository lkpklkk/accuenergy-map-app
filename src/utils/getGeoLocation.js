export default function getGeolocation() {
  return new Promise((resolve, reject) => {
    const isSupported = 'geolocation' in navigator;

    if (isSupported) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          resolve({ coords, isSupported });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          reject(error);
        }
      );
    } else {
      resolve({ coords: { lat: 0, lng: 0 }, isSupported: false });
    }
  });
}
