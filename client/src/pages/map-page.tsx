import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import { Listing, Category } from "@shared/schema";
import { MapPin, ExternalLink, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewType, setViewType] = useState<'map' | 'virtual'>('map');
  const [mapType, setMapType] = useState<'map' | 'satellite'>('map');

  // Fetch approved listings
  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ['/api/listings'],
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Filter listings
  const filteredListings = listings.filter(listing => {
    // Filter by view type (map/virtual)
    if (viewType === 'map' && listing.isOnlineOnly) return false;
    if (viewType === 'virtual' && !listing.isOnlineOnly) return false;
    
    // Filter by search term
    if (searchTerm && !listing.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !listing.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by categories - exclude uncategorized items when specific categories selected
    if (selectedCategories.length > 0) {
      if (!listing.categoryId || !selectedCategories.includes(listing.categoryId)) {
        return false;
      }
    }
    
    return true;
  });

  // Get map locations (those with coordinates)
  const mapLocations = filteredListings.filter(
    listing => listing.latitude && listing.longitude && !listing.isOnlineOnly
  );

  const virtualLocations = filteredListings.filter(listing => listing.isOnlineOnly);

  // Calculate center
  const center: [number, number] = mapLocations.length > 0
    ? [
        mapLocations.reduce((sum, l) => sum + parseFloat(l.latitude || '0'), 0) / mapLocations.length,
        mapLocations.reduce((sum, l) => sum + parseFloat(l.longitude || '0'), 0) / mapLocations.length
      ]
    : [22.3193, 114.1694];

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const displayListings = viewType === 'map' ? mapLocations : virtualLocations;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header forceSolid={true} />
      
      <div className="flex-1 pt-16 flex">
        {/* Left Sidebar */}
        <div className="w-full md:w-96 border-r border-gray-200 flex flex-col bg-white">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setViewType('map')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                viewType === 'map'
                  ? 'bg-white text-gray-900 border-b-2 border-primary'
                  : 'bg-gray-50 text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-map-locations"
            >
              Map Locations ({mapLocations.length})
            </button>
            <button
              onClick={() => setViewType('virtual')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                viewType === 'virtual'
                  ? 'bg-white text-gray-900 border-b-2 border-primary'
                  : 'bg-gray-50 text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-virtual-locations"
            >
              Virtual Locations ({virtualLocations.length})
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-map-search"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategories.length === 0 ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategories([])}
                data-testid="filter-all"
              >
                All
              </Badge>
              {categories.map(category => (
                <Badge
                  key={category.id}
                  variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategoryToggle(category.id)}
                  data-testid={`filter-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Listings */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : displayListings.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No listings found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {displayListings.map((listing, index) => (
                  <div
                    key={listing.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setLocation(`/business/${listing.id}`)}
                    data-testid={`listing-item-${listing.id}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1" data-testid={`text-listing-title-${listing.id}`}>
                            {listing.title}
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </h3>
                        </div>
                        {listing.address && (
                          <p className="text-xs text-gray-600 mb-1">
                            {listing.address}, {listing.city}
                          </p>
                        )}
                        {listing.description && (
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {listing.description}
                          </p>
                        )}
                        <div className="mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getCategoryName(listing.categoryId)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Map */}
        <div className="flex-1 relative hidden md:block">
          {/* Map Type Toggle */}
          <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-md overflow-hidden flex">
            <button
              onClick={() => setMapType('map')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mapType === 'map'
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              data-testid="toggle-map"
            >
              Map
            </button>
            <button
              onClick={() => setMapType('satellite')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mapType === 'satellite'
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              data-testid="toggle-satellite"
            >
              Satellite
            </button>
          </div>

          {mapLocations.length === 0 ? (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Locations Available</h2>
                <p className="text-gray-600">
                  There are no businesses with location data to display on the map.
                </p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              data-testid="container-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url={
                  mapType === 'satellite'
                    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
              />
              {mapLocations.map((listing) => {
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
                        
                        <Button
                          size="sm"
                          className="w-full mt-2"
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
          )}
        </div>
      </div>
    </div>
  );
}
