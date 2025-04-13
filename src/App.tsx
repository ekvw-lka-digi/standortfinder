import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Building2, Link as LinkIcon, Info, FileText, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
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

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrgType, setSelectedOrgType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
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
          <div className="text-sm">Service</div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-ekvw-blue">Standortfinder</h1>
              <p className="text-gray-600 text-sm">Evangelische Kirche von Westfalen</p>
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
                  icon={defaultIcon}
                  eventHandlers={{
                    click: () => setSelectedLocation(location)
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
          <div className="h-[600px] overflow-y-auto">
            <div className="space-y-3 px-2">
              {filteredLocations.map(location => (
                <div
                  key={location.name}
                  ref={selectedLocation?.name === location.name ? selectedCardRef : null}
                  className={`bg-white rounded-lg shadow-sm border overflow-hidden cursor-pointer transition-all hover:border-ekvw-blue ${
                    selectedLocation?.name === location.name 
                      ? 'ring-2 ring-ekvw-blue border-ekvw-blue shadow-md transform scale-[1.02]' 
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedLocation(location)}
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