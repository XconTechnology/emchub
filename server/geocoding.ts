// Geocoding service using Nominatim (OpenStreetMap)
// Free service, no API key required

interface GeocodeResult {
  latitude: string;
  longitude: string;
}

export async function geocodeAddress(address: string, city?: string): Promise<GeocodeResult | null> {
  try {
    // Helper function to try geocoding with a query
    const tryGeocode = async (query: string): Promise<GeocodeResult | null> => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'EMC-HUB-Business-Directory/1.0'
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
    };
    
    // Strategy 1: Try full address with city
    const fullQuery = city ? `${address}, ${city}` : address;
    let result = await tryGeocode(fullQuery);
    if (result) {
      console.log('Geocoded with full address:', fullQuery);
      return result;
    }
    
    // Strategy 2: If address contains detailed info (commas, floor/unit numbers), simplify it
    if (address.includes(',')) {
      // Extract the main location name (usually before the first comma)
      const mainLocation = address.split(',')[0].trim();
      const simplifiedQuery = city ? `${mainLocation}, ${city}` : `${mainLocation}, Hong Kong`;
      
      await delay(1000); // Respect API rate limits
      result = await tryGeocode(simplifiedQuery);
      if (result) {
        console.log('Geocoded with simplified address:', simplifiedQuery);
        return result;
      }
    }
    
    // Strategy 3: Try with just "Hong Kong" if city wasn't provided
    if (!city && !address.toLowerCase().includes('hong kong')) {
      const hongKongQuery = `${address}, Hong Kong`;
      
      await delay(1000);
      result = await tryGeocode(hongKongQuery);
      if (result) {
        console.log('Geocoded with Hong Kong added:', hongKongQuery);
        return result;
      }
    }
    
    console.log('Geocoding failed after all strategies for:', address);
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
