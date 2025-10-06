// Geocoding service using Nominatim (OpenStreetMap)
// Free service, no API key required

interface GeocodeResult {
  latitude: string;
  longitude: string;
}

export async function geocodeAddress(address: string, city?: string): Promise<GeocodeResult | null> {
  try {
    // Combine address and city for better results
    const searchQuery = city ? `${address}, ${city}` : address;
    
    // Use Nominatim API (OpenStreetMap's geocoding service)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EMC-HUB-Business-Directory/1.0' // Required by Nominatim
      }
    });
    
    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: data[0].lat,
        longitude: data[0].lon
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Rate limiting helper - wait between requests to respect API limits
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
