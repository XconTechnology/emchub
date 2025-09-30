import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Listing, Category } from "@shared/schema";
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Custom marker icon
const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapPage() {
  const [, setLocation] = useLocation();

  // Fetch approved listings only
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
    queryFn: async () => {
      const response = await fetch('/api/listings');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      return response.json();
    },
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Filter listings with valid coordinates
  const validListings = listings.filter(
    listing => listing.latitude && listing.longitude && !listing.isOnlineOnly
  );

  // Calculate center based on listings or default to Hong Kong center
  const center: [number, number] = validListings.length > 0
    ? [
        validListings.reduce((sum, l) => sum + parseFloat(l.latitude || '0'), 0) / validListings.length,
        validListings.reduce((sum, l) => sum + parseFloat(l.longitude || '0'), 0) / validListings.length
      ]
    : [22.3193, 114.1694]; // Hong Kong center

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-map-title">
              Map of Listings
            </h1>
            <p className="text-lg text-green-50" data-testid="text-map-description">
              Explore {validListings.length} halal businesses across Hong Kong
            </p>
          </div>
        </div>

        {/* Map Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">Loading map...</p>
            </div>
          ) : validListings.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Locations Available</h2>
                <p className="text-gray-600">
                  There are currently no businesses with location data to display on the map.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="h-[600px] rounded-lg overflow-hidden shadow-xl border border-gray-200" data-testid="container-map">
              <MapContainer
                center={center}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {validListings.map((listing) => {
                  if (!listing.latitude || !listing.longitude) return null;
                  
                  return (
                    <Marker
                      key={listing.id}
                      position={[parseFloat(listing.latitude), parseFloat(listing.longitude)]}
                      icon={customIcon}
                    >
                      <Popup maxWidth={300}>
                        <div className="p-2" data-testid={`popup-listing-${listing.id}`}>
                          {listing.images && listing.images.length > 0 && (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                          )}
                          
                          <h3 className="font-bold text-lg mb-1" data-testid={`text-popup-title-${listing.id}`}>
                            {listing.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            {getCategoryName(listing.categoryId)}
                          </p>
                          
                          {listing.address && (
                            <div className="flex items-start gap-2 text-sm mb-2">
                              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{listing.address}, {listing.city}</span>
                            </div>
                          )}
                          
                          {listing.phone && (
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <a href={`tel:${listing.phone}`} className="text-blue-600 hover:underline">
                                {listing.phone}
                              </a>
                            </div>
                          )}
                          
                          {listing.email && (
                            <div className="flex items-center gap-2 text-sm mb-3">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <a href={`mailto:${listing.email}`} className="text-blue-600 hover:underline">
                                {listing.email}
                              </a>
                            </div>
                          )}
                          
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setLocation(`/business/${listing.id}`)}
                            data-testid={`button-view-business-${listing.id}`}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
