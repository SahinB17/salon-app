import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix leaflet default icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    salons: {
        id: number;
        name: string;
        address: string;
        latitude?: number | null;
        longitude?: number | null;
    }[];
    center?: [number, number];
    zoom?: number;
    className?: string;
}

// Component to dynamically change center if needed
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export function Map({ salons, center = [40.4093, 49.8671], zoom = 12, className = "w-full h-96 rounded-xl z-0" }: MapProps) {
    // Filter salons with valid coordinates
    const mapSalons = salons.filter(s => s.latitude && s.longitude);
    
    // Auto-center based on first salon if center is default and salons exist
    const mapCenter: [number, number] = (mapSalons.length > 0 && mapSalons[0].latitude && mapSalons[0].longitude) 
        ? [mapSalons[0].latitude, mapSalons[0].longitude] 
        : center;

    return (
        <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={false} className={className} attributionControl={false}>
            <ChangeView center={mapCenter} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapSalons.map(salon => (
                <Marker key={salon.id} position={[salon.latitude!, salon.longitude!]}>
                    <Popup>
                        <div className="font-semibold">{salon.name}</div>
                        <div className="text-sm text-gray-600">{salon.address}</div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
