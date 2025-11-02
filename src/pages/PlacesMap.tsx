import { useMemo, useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRigvedaData } from "@/hooks/useRigvedaData";
import { RigvedaVerse } from "@/types/rigveda";
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle, Loader2, Search, Filter, ChevronLeft, MapPin, Users, Mountain, AlertCircle } from "lucide-react";

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Improved PLACES_DATA with refined coordinates (sourced from Wikipedia, Dharmawiki, and Rigvedic geography studies)
const PLACES_DATA = [
  // Rivers (Sapta Sindhu & others; central/modern ID points for visibility)
  { name: "Sarasvati", lat: 29.9, lng: 74.5, type: "river", verses: ["sarasvati", "saraswati", "सरस्वती"], uncertainty: true, desc: "Ghaggar-Hakra (dried) or Helmand? Central Haryana bed." },
  { name: "Sindhu (Indus)", lat: 31.4, lng: 71.0, type: "river", verses: ["sindhu", "indus", "सिन्धु"], uncertainty: false },
  { name: "Yamuna", lat: 28.5, lng: 77.2, type: "river", verses: ["yamuna", "यमुना"], uncertainty: false },
  { name: "Ganga", lat: 26.0, lng: 85.0, type: "river", verses: ["ganga", "ganges", "गङ्गा"], uncertainty: false },
  { name: "Vitasta (Jhelum)", lat: 33.0, lng: 73.5, type: "river", verses: ["vitasta", "झेलम"], uncertainty: false },
  { name: "Asikni (Chenab)", lat: 32.5, lng: 75.5, type: "river", verses: ["asikni", "chenab", "असिक्नी"], uncertainty: false },
  { name: "Parushni (Ravi)", lat: 31.6, lng: 74.8, type: "river", verses: ["parusni", "ravi", "परुष्णी"], uncertainty: false },
  { name: "Vipash (Beas)", lat: 31.7, lng: 75.8, type: "river", verses: ["vipas", "beas", "विपाश्"], uncertainty: false },
  { name: "Shutudri (Sutlej)", lat: 30.7, lng: 75.5, type: "river", verses: ["sutudri", "sutlej", "शतुद्री"], uncertainty: false },
  { name: "Kubha (Kabul)", lat: 34.0, lng: 69.0, type: "river", verses: ["kubha", "kabul", "कुभा"], uncertainty: false },
  { name: "Krumu (Kurram)", lat: 33.0, lng: 70.0, type: "river", verses: ["krumu", "कृमु"], uncertainty: false },
  { name: "Gomati (Gomal)", lat: 31.8, lng: 69.5, type: "river", verses: ["gomati", "gomel", "गोमती"], uncertainty: false },
  { name: "Drishadvati", lat: 29.0, lng: 75.5, type: "river", verses: ["drishadvati", "दृषद्वती"], uncertainty: false },
  { name: "Trstama", lat: 30.0, lng: 76.0, type: "river", verses: ["trstama"], uncertainty: true, desc: "Lost; possibly Markanda tributary." },
  { name: "Susoma", lat: 30.5, lng: 75.0, type: "river", verses: ["susoma", "सुसोमा"], uncertainty: false },
  { name: "Anitabha", lat: 31.0, lng: 73.0, type: "river", verses: ["anitabha"], uncertainty: true, desc: "Minor Punjab river." },
  { name: "Rasā (Mythical)", lat: 35.0, lng: 44.0, type: "river", verses: ["rasa", "रसा"], uncertainty: true, desc: "World-encircling; possibly Tigris." },
  { name: "Hariyupiya (Ravi upper)", lat: 32.0, lng: 75.0, type: "river", verses: ["hariyupiya"], uncertainty: false },
  { name: "Marudvridha", lat: 31.0, lng: 75.0, type: "river", verses: ["marudvridha", "मरुद्वृद्धा"], uncertainty: true, desc: "Identified with Mahuvardhavan in Punjab region." },

  // Tribes (Panchajana; approximate central settlements from Rigvedic battles/hymns)
  { name: "Bharatas", lat: 29.0, lng: 76.0, type: "tribe", verses: ["bharata", "भारत"], uncertainty: false },
  { name: "Anus", lat: 32.0, lng: 73.0, type: "tribe", verses: ["anu", "अनु"], uncertainty: true, desc: "Western Punjab plains." },
  { name: "Druhyus", lat: 31.0, lng: 72.0, type: "tribe", verses: ["druhyu", "द्रुह्यु"], uncertainty: false },
  { name: "Yadus", lat: 27.0, lng: 74.0, type: "tribe", verses: ["yadu", "यदु"], uncertainty: false },
  { name: "Purus", lat: 30.0, lng: 77.0, type: "tribe", verses: ["puru", "पुरु"], uncertainty: false },
  { name: "Turvashas", lat: 29.5, lng: 74.0, type: "tribe", verses: ["turvasha", "तुर्वश"], uncertainty: false },
  { name: "Krivis", lat: 30.0, lng: 76.5, type: "tribe", verses: ["krivi"], uncertainty: true, desc: "Near Kurukshetra." },
  { name: "Alinas", lat: 34.0, lng: 71.5, type: "tribe", verses: ["alina"], uncertainty: false },
  { name: "Pakhthas", lat: 34.0, lng: 71.0, type: "tribe", verses: ["pakhthas", "paktha", "पक्थ"], uncertainty: false },
  { name: "Dasyus", lat: 30.5, lng: 74.0, type: "tribe", verses: ["dasyus", "dasyu", "दस्यु"], uncertainty: true, desc: "Non-Aryan tribes opposed to Aryans in Sapta Sindhu." },

  // Mountains (Ranges; central points)
  { name: "Himavanta (Himalayas)", lat: 30.0, lng: 78.0, type: "mountain", verses: ["himavanta", "himalaya", "हिमवन्त"], uncertainty: false },
  { name: "Mujavat", lat: 35.0, lng: 70.0, type: "mountain", verses: ["mujavat", "मुजवत्"], uncertainty: true, desc: "Hindukush; Soma source." },
  { name: "Sushoma", lat: 36.0, lng: 76.0, type: "mountain", verses: ["sushoma"], uncertainty: true, desc: "Karakoram range." },
  { name: "Arjika", lat: 37.0, lng: 72.0, type: "mountain", verses: ["arjika"], uncertainty: true, desc: "Mythical Aryan northern range." },
] as const;

// Custom div icons for visibility (emojis, colored, larger)
const getCustomIcon = (type: string) => L.divIcon({
  className: "custom-div-icon bg-white shadow-lg rounded-full",
  html: `
    <div style="
      background-color: ${type === 'river' ? '#3b82f6' : type === 'tribe' ? '#10b981' : '#6b7280'};
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">
      ${type === 'river' ? '🌊' : type === 'tribe' ? '👥' : '⛰️'}
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

const PlacesMap = () => {
  const { data, loading, error } = useRigvedaData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all"); // Filter by type
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const mapRef = useRef<L.Map>(null);

  const placesWithVerses = useMemo(() => PLACES_DATA, []);

  const filteredPlaces = useMemo(() => {
    let filtered = placesWithVerses;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(place =>
        place.name.toLowerCase().includes(lowerTerm) ||
        place.verses.some(v => v.toLowerCase().includes(lowerTerm))
      );
    }
    if (selectedType !== "all") {
      filtered = filtered.filter(place => place.type === selectedType);
    }
    return filtered;
  }, [placesWithVerses, searchTerm, selectedType]);

  // Stats
  const totalPlaces = placesWithVerses.length;
  const byType = {
    river: placesWithVerses.filter(p => p.type === 'river').length,
    tribe: placesWithVerses.filter(p => p.type === 'tribe').length,
    mountain: placesWithVerses.filter(p => p.type === 'mountain').length,
  };

  // Fit map to all places on load
  useEffect(() => {
    if (mapRef.current && filteredPlaces.length > 0) {
      const bounds = filteredPlaces.map(p => [p.lat, p.lng]) as L.LatLngBoundsExpression;
      mapRef.current.fitBounds(bounds, { padding: [20, 20], maxZoom: 8 });
    }
  }, [filteredPlaces]);

  // Custom double right-click to zoom out (fixed logic)
  useEffect(() => {
    const mapInstance = mapRef.current;
    if (!mapInstance) return;

    const mapEl = mapInstance.getContainer();
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 2) return; // Only right mouse button

      e.preventDefault(); // Prevent context menu

      clickCount += 1;

      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          // Single right-click: Do nothing
          clickCount = 0;
        }, 250);
      } else if (clickCount === 2) {
        clearTimeout(clickTimer!);
        // Double right-click: Zoom out
        const latlng = mapInstance.mouseEventToLatLng(e);
        mapInstance.zoomOut(latlng, 1);
        clickCount = 0;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Prevent default context menu on right-click
    };

    mapEl.addEventListener('mousedown', handleMouseDown);
    mapEl.addEventListener('contextmenu', handleContextMenu);

    return () => {
      mapEl.removeEventListener('mousedown', handleMouseDown);
      mapEl.removeEventListener('contextmenu', handleContextMenu);
      if (clickTimer) clearTimeout(clickTimer);
    };
  }, [mapRef]);

  // Click handler to center and select
  const handlePlaceClick = (place: any) => {
    if (mapRef.current) {
      mapRef.current.setView([place.lat, place.lng], 10);
    }
    setSelectedPlace(place);
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="bg-destructive/10 text-destructive p-4 rounded-lg">Error loading verses: {error}</div>;

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3 flex items-center gap-2">
          🗺️ Rig Veda Geography Explorer
        </h1>
        <p className="text-lg text-muted-foreground">
          Interactive map of {totalPlaces} key rivers, tribes, and mountains. Toggle layers, search, and click for details.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search places or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedType("all"); }}>
            Clear
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedType === "all" ? "default" : "outline"}
            onClick={() => setSelectedType("all")}
          >
            All
          </Button>
          <Button
            variant={selectedType === "river" ? "default" : "outline"}
            onClick={() => setSelectedType("river")}
          >
            Rivers ({byType.river})
          </Button>
          <Button
            variant={selectedType === "tribe" ? "default" : "outline"}
            onClick={() => setSelectedType("tribe")}
          >
            Tribes ({byType.tribe})
          </Button>
          <Button
            variant={selectedType === "mountain" ? "default" : "outline"}
            onClick={() => setSelectedType("mountain")}
          >
            Mountains ({byType.mountain})
          </Button>
        </div>
      </div>

      {/* Map & Sidebar */}
      <div className="flex gap-4">
        {/* Sidebar */}
        <Card className={`w-80 transition-all ${showSidebar ? 'block' : 'hidden sm:block'}`}>
          <CardHeader className="flex flex-row justify-between items-center cursor-pointer" onClick={() => setShowSidebar(!showSidebar)}>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" /> Places List ({filteredPlaces.length})
            </CardTitle>
            <ChevronLeft className={`h-4 w-4 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto space-y-2">
            {filteredPlaces.map((place, idx) => (
              <Button
                key={idx}
                variant="ghost"
                className="w-full justify-start h-auto p-3 text-left hover:bg-accent"
                onClick={() => handlePlaceClick(place)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    place.type === 'river' ? 'bg-blue-500' : place.type === 'tribe' ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {place.type === 'river' ? '🌊' : place.type === 'tribe' ? '👥' : '⛰️'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{place.name}</div>
                    <div className="text-xs text-muted-foreground">{place.type}</div>
                    {place.uncertainty && (
                      <AlertTriangle className="h-3 w-3 text-yellow-500 inline ml-1" />
                    )}
                  </div>
                </div>
              </Button>
            ))}
            {filteredPlaces.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No places match your search. Try broadening it!</p>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <div className="flex-1">
          <div className="relative z-0">
            <MapContainer
              center={[30, 75]}
              zoom={6}
              style={{
                height: "600px",
                width: "100%",
                minWidth: "600px",
                position: "relative",
                zIndex: 0
              }}
              bounds={[[25, 65], [40, 85]]}
              ref={mapRef}
            >
              <LayersControl position="topright">
                {/* Base Layers Only */}
                <LayersControl.BaseLayer name="Default" checked>
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Terrain">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a> | <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satellite">
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a> | <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://www.esri.com/legal/conditions-of-use">Terms & Feedback</a>'
                    maxZoom={19}
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              {/* Markers rendered directly, controlled by filters */}
              {filteredPlaces.map((place) => {
                const icon = getCustomIcon(place.type);
                const isRiver = place.type === 'river';
                const isTribe = place.type === 'tribe';
                const isMountain = place.type === 'mountain';

                return (
                  <Marker
                    key={`${place.type}-${place.name}`}
                    position={[place.lat, place.lng]}
                    icon={icon}
                    eventHandlers={{
                      click: () => setSelectedPlace(place),
                    }}
                  >
                    <Popup maxWidth={350} className="custom-popup">
                      <div>
                        <h3 className="font-bold flex items-center gap-2 mb-2 text-lg">
                          {isRiver && <MapPin className="h-5 w-5 text-blue-500" />}
                          {isTribe && <Users className="h-5 w-5 text-green-500" />}
                          {isMountain && <Mountain className="h-5 w-5 text-gray-600" />}
                          {place.name} ({place.type.charAt(0).toUpperCase() + place.type.slice(1)})
                        </h3>
                        {place.uncertainty && (
                          <div className="flex items-center gap-1 text-yellow-600 text-sm mb-2 p-2 bg-yellow-50 rounded">
                            <AlertTriangle className="h-4 w-4" />
                            {place.desc}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Legend */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">🌊</div>
              Rivers (Sapta Sindhu core)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">👥</div>
              Tribes (Panchajana settlements)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">⛰️</div>
              Mountains (Northern ranges)
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-yellow-600 mb-2">
            <AlertTriangle className="h-6 w-6" />
            <span>Yellow alert triangle: Debated or mythical location.</span>
          </div>
          <p className="pt-5 text-sm text-muted-foreground">
            Coordinates refined from Wikipedia/Dharmawiki. Zoom/pan to explore the Vedic heartland!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlacesMap;