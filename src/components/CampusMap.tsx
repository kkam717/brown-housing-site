import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Map, {
  Marker,
  NavigationControl,
  FullscreenControl,
  Popup,
  type ViewStateChangeEvent,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { loadDorms, getBuildingMarkers } from "../services/dormData";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import type { BuildingMarker } from "../types";
import "./CampusMap.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
const MAPBOX_TOKEN_IS_PUBLIC = MAPBOX_TOKEN?.startsWith("pk.") ?? false;

export default function CampusMap() {
  useDocumentTitle("Campus Map");

  const [searchParams] = useSearchParams();
  const highlightBuilding = searchParams.get("building");

  const [markers, setMarkers] = useState<BuildingMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<BuildingMarker | null>(null);
  const [viewState, setViewState] = useState({
    longitude: -71.4,
    latitude: 41.8245,
    zoom: 14.5,
    bearing: 0,
    pitch: 10,
  });

  useEffect(() => {
    loadDorms()
      .then((dorms) => {
        const m = getBuildingMarkers(dorms);
        setMarkers(m);
        if (highlightBuilding) {
          const match = m.find(
            (b) => b.name.toLowerCase() === highlightBuilding.toLowerCase(),
          );
          if (match) {
            setSelected(match);
            setViewState((v) => ({
              ...v,
              longitude: match.lng,
              latitude: match.lat,
              zoom: 16,
            }));
          }
        }
      })
      .finally(() => setLoading(false));
  }, [highlightBuilding]);

  if (!MAPBOX_TOKEN || !MAPBOX_TOKEN_IS_PUBLIC) {
    const tokenMessage = !MAPBOX_TOKEN
      ? <>Map unavailable — set <code>VITE_MAPBOX_TOKEN</code> in your <code>.env</code> file.</>
      : <>Map unavailable — use a <strong>public</strong> Mapbox token (<code>pk.</code>…), not a secret token (<code>sk.</code>…). Create one at{" "}
          <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noreferrer">
            account.mapbox.com/access-tokens
          </a>.</>;

    return (
      <div className="campus-map">
        <div className="campus-map__header">
          <h1>Campus Map</h1>
          <p>Brown University dorm locations</p>
        </div>
        <div className="campus-map__fallback">
          <p>{tokenMessage}</p>
          <Link to="/listings" className="campus-map__fallback-link">
            Browse room listings instead
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="campus-map">
      <div className="campus-map__header">
        <h1>Campus Map</h1>
        <p>Brown University dorm locations — click a marker for details</p>
      </div>

      {loading ? (
        <p className="campus-map__loading">Loading map data...</p>
      ) : (
        <div className="campus-map__layout">
          <aside className="campus-map__sidebar" aria-label="Building list">
            <h2>Buildings ({markers.length})</h2>
            <ul>
              {markers.map((marker) => (
                <li key={marker.name}>
                  <button
                    type="button"
                    className={selected?.name === marker.name ? "active" : ""}
                    onClick={() => {
                      setSelected(marker);
                      setViewState((v) => ({
                        ...v,
                        longitude: marker.lng,
                        latitude: marker.lat,
                        zoom: 16,
                      }));
                    }}
                  >
                    {marker.name}
                    <span>{marker.roomCount} rooms</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <div className="campus-map__container">
            <Map
              {...viewState}
              onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
              mapboxAccessToken={MAPBOX_TOKEN}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              minZoom={13}
              doubleClickZoom={false}
            >
              <NavigationControl position="top-right" />
              <FullscreenControl position="top-right" />
              {markers.map((marker) => (
                <Marker
                  key={marker.name}
                  longitude={marker.lng}
                  latitude={marker.lat}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    setSelected(marker);
                  }}
                >
                  <button
                    type="button"
                    className={`campus-map__pin ${selected?.name === marker.name ? "active" : ""}`}
                    aria-label={`${marker.name}, ${marker.roomCount} rooms`}
                  />
                </Marker>
              ))}
              {selected && (
                <Popup
                  longitude={selected.lng}
                  latitude={selected.lat}
                  anchor="bottom"
                  onClose={() => setSelected(null)}
                  closeOnClick={false}
                >
                  <div className="campus-map__popup">
                    <strong>{selected.name}</strong>
                    <p>{selected.address}</p>
                    <p>{selected.roomCount} rooms · {selected.campusside} Campus</p>
                    <Link to={`/listings?q=${encodeURIComponent(selected.name)}`}>
                      View listings
                    </Link>
                  </div>
                </Popup>
              )}
            </Map>
          </div>
        </div>
      )}
    </div>
  );
}
