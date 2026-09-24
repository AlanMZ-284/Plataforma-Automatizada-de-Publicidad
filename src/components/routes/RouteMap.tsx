import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteStop } from '../../types';

interface RouteMapProps {
  origin: { name: string; lat: number; lng: number };
  stops: RouteStop[];
}

export const RouteMap: React.FC<RouteMapProps> = ({ origin, stops }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Inicializar mapa centrado en el Valle de México
      const map = L.map(mapContainerRef.current).setView([19.45, -99.2], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors • Develop Logistics',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Icono personalizado para el Origen (CDMX) con Azul Institucional Develop
    const originIcon = L.divIcon({
      className: 'custom-origin-pin',
      html: `
        <div style="background: linear-gradient(135deg, #0f094f, #29008e); color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2.5px solid white; box-shadow: 0 8px 18px rgba(15,9,79,0.45);">
          📍
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    // Marcador de Origen
    const originMarker = L.marker([origin.lat, origin.lng], { icon: originIcon })
      .bindPopup(`
        <div style="font-family: 'Inter', system-ui, sans-serif; font-size: 12px; padding: 2px;">
          <span style="background: rgba(15,9,79,0.08); color: #0f094f; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">Punto de Salida & Retorno</span>
          <h4 style="margin: 6px 0 2px; font-weight: 700; color: #111; font-size: 13px;">${origin.name}</h4>
          <p style="margin: 0; color: #555; font-size: 11px;">Inicio y conclusión de la ruta de campo</p>
        </div>
      `);
    layerGroup.addLayer(originMarker);

    const latLngs: [number, number][] = [[origin.lat, origin.lng]];

    // Marcadores para cada parada en el orden óptimo (Develop Violet & Glow)
    stops.forEach((stop) => {
      latLngs.push([stop.lat, stop.lng]);

      const stopIcon = L.divIcon({
        className: 'custom-stop-pin',
        html: `
          <div style="background: linear-gradient(135deg, #29008e, #640354); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; border: 2px solid white; box-shadow: 0 4px 12px rgba(41,0,142,0.35);">
            ${stop.order}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const stopMarker = L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .bindPopup(`
          <div style="font-family: 'Inter', system-ui, sans-serif; font-size: 12px; max-width: 220px; padding: 2px;">
            <span style="background: rgba(41,0,142,0.1); color: #29008e; font-weight: 700; padding: 2px 8px; border-radius: 999px; font-size: 10px;">PARADA #${stop.order}</span>
            <h4 style="margin: 6px 0 3px; font-weight: 700; font-size: 13px; color: #111;">${stop.name}</h4>
            <p style="margin: 0; color: #666; font-size: 11px;">${stop.municipality}, ${stop.state}</p>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee;">
              <p style="margin: 0 0 3px; color: #111; font-size: 11px;">🕒 <strong>Llegada est.:</strong> ${stop.recommendedMeetingHour}</p>
              <p style="margin: 0; color: #111; font-size: 11px;">👤 <strong>Contacto:</strong> ${stop.directorName}</p>
            </div>
          </div>
        `);
      layerGroup.addLayer(stopMarker);
    });

    // Cerrar el circuito regresando al origen
    latLngs.push([origin.lat, origin.lng]);

    // Dibujar la polilínea de la ruta óptima con color Develop Violet
    if (latLngs.length > 2) {
      const polyline = L.polyline(latLngs, {
        color: '#29008e',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 6',
      });
      layerGroup.addLayer(polyline);

      // Ajustar la vista del mapa a los límites de la ruta
      const bounds = L.latLngBounds(latLngs);
      const fitPad = window.innerWidth < 640 ? 15 : 40;
      map.fitBounds(bounds, { padding: [fitPad, fitPad] });
    }
  }, [origin, stops]);

  return (
    <div className="relative w-full h-[300px] sm:h-[380px] lg:h-[480px] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-black/10 shadow-develop-card">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Leyenda con Identidad Develop Glass */}
      <div className="absolute bottom-3 right-3 sm:top-4 sm:right-4 sm:bottom-auto z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-black/10 shadow-develop-card text-[10px] sm:text-xs font-medium space-y-1 sm:space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#0f094f] inline-block shadow-xs"></span>
          <span className="text-[#111111] font-semibold">Origen & Retorno (CDMX)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#29008e] to-[#640354] inline-block shadow-xs"></span>
          <span className="text-[#555555]">Sedes Optimizadas (1..{stops.length})</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-[#29008e] inline-block"></span>
          <span className="text-[#555555]">Circuito TSP (2-Opt)</span>
        </div>
      </div>
    </div>
  );
};
