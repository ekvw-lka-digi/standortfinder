import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Building2, Link as LinkIcon, Info, FileText, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLng, DivIcon } from 'leaflet';
import locationData from './locations.json';
import 'leaflet/dist/leaflet.css';

interface Location {
  name: string;
  address: string;
  lat: number;
  lng: number;
  orgtype: string;
  notes: string;
  searchterm: string;
  link: string;
}

// MapController component for programmatic map control
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

const locations: Location[] = locationData.locations;

// Calculate bounds for Westphalia region
const defaultCenter: [number, number] = [51.8, 8.2]; // Center of NRW approximately
const defaultZoom = 8;

// Create custom marker icons using SVG
const createMarkerIcon = (color: string) => {
  return new DivIcon({
    html: `
      <svg width="27" height="43" viewBox="0 0 27 43" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.5 1C6.59644 1 1 6.59644 1 13.5C1 22.875 13.5 42 13.5 42C13.5 42 26 22.875 26 13.5C26 6.59644 20.4036 1 13.5 1ZM13.5 18C11.0147 18 9 15.9853 9 13.5C9 11.0147 11.0147 9 13.5 9C15.9853 9 18 11.0147 18 13.5C18 15.9853 15.9853 18 13.5 18Z" 
        fill="${color}" stroke="white" stroke-width="1"/>
      </svg>
    `,
    className: '',
    iconSize: [27, 43],
    iconAnchor: [13, 43],
    popupAnchor: [1, -34],
  });
};

const blueIcon = createMarkerIcon('#0b3f73');
const redIcon = createMarkerIcon('#e50039');

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgType, setSelectedOrgType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const selectedCardRef = useRef<HTMLDivElement>(null);

  const orgTypes = ['all', ...new Set(locations.map(loc => loc.orgtype).filter(Boolean))];

  const filteredLocations = locations.filter(location => {
    const searchString = `${location.name} ${location.address} ${location.searchterm}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    const matchesOrgType = selectedOrgType === 'all' || location.orgtype === selectedOrgType;
    return matchesSearch && matchesOrgType;
  });

  // Update map view when location is selected
  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.lat, selectedLocation.lng]);
      setMapZoom(16);
      // Scroll selected card into view
      selectedCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      setMapCenter(defaultCenter);
      setMapZoom(defaultZoom);
    }
  }, [selectedLocation]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedOrgType('all');
    setSelectedLocation(null);
    setMapCenter(defaultCenter);
    setMapZoom(defaultZoom);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-merriweather">
      {/* Top Bar */}
      <div className="bg-ekvw-blue text-white py-1">
        <div className="container mx-auto px-4">
          <div className="text-sm">Web Services | Evangelische Kirche von Westfalen</div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ekvw-blue">Standortfinder</h1>
            </div>
            <img 
              src="https://www.evangelisch-in-westfalen.de/typo3conf/ext/ekvw_template/Resources/Public/Images/logo-neu.svg" 
              alt="EKvW Logo" 
              className="h-12"
            />
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Suche nach Namen, Adressen oder Stichworten..."
                className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:border-ekvw-blue focus:ring-1 focus:ring-ekvw-blue text-gray-900"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="relative">
              <select
                className="pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:border-ekvw-blue focus:ring-1 focus:ring-ekvw-blue text-gray-900 bg-white appearance-none"
                value={selectedOrgType}
                onChange={(e) => setSelectedOrgType(e.target.value)}
              >
                <option value="all">Alle Organisationstypen</option>
                {orgTypes.filter(type => type !== 'all').map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {selectedOrgType !== 'all' && (
                <button
                  onClick={() => setSelectedOrgType('all')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {(searchTerm || selectedOrgType !== 'all' || selectedLocation) && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-white bg-ekvw-red hover:bg-red-700 rounded-lg transition-colors"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2 h-[600px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              className="h-full w-full"
            >
              <MapController center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredLocations.map(location => (
                <Marker
                  key={location.name}
                  position={[location.lat, location.lng]}
                  icon={selectedLocation?.name === location.name || hoveredLocation?.name === location.name ? redIcon : blueIcon}
                  eventHandlers={{
                    click: () => setSelectedLocation(location),
                    mouseover: () => setHoveredLocation(location),
                    mouseout: () => setHoveredLocation(null),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <h3 className="font-semibold">{location.name}</h3>
                      <p>{location.address}</p>
                      {location.orgtype && <p className="text-gray-600">Typ: {location.orgtype}</p>}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Location List */}
          <div className="h-[600px] overflow-y-auto px-2">
            <div className="space-y-3 py-2">
              {filteredLocations.map(location => (
                <div
                  key={location.name}
                  ref={selectedLocation?.name === location.name ? selectedCardRef : null}
                  className={`bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer transition-all hover:border-ekvw-red ${
                    selectedLocation?.name === location.name 
                      ? 'ring-2 ring-ekvw-red border-ekvw-red shadow-md transform scale-[1.02]' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedLocation(location)}
                  onMouseEnter={() => setHoveredLocation(location)}
                  onMouseLeave={() => setHoveredLocation(null)}
                >
                  <div className="p-3">
                    <h2 className="text-lg font-semibold mb-2 text-ekvw-blue">{location.name}</h2>
                    <div className="space-y-2 text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0 text-ekvw-red" />
                        <span className="text-sm">{location.address}</span>
                      </div>
                      {location.orgtype && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 flex-shrink-0 text-ekvw-red" />
                          <span className="text-sm">{location.orgtype}</span>
                        </div>
                      )}
                      {location.notes && (
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 flex-shrink-0 text-ekvw-red" />
                          <span className="text-sm">{location.notes}</span>
                        </div>
                      )}
                      <a
                        href={location.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-ekvw-blue hover:text-ekvw-red transition-colors text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <LinkIcon className="w-4 h-4 flex-shrink-0" />
                        <span>Weitere Informationen</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;