import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ParadaRutaOptimizada, PuntoOrigen } from '../../utils/optimizadorRutas';
import { RouteStop } from '../../types';

interface PropiedadesMapaRutas {
  origen?: PuntoOrigen | { name: string; lat: number; lng: number };
  paradas?: (ParadaRutaOptimizada | RouteStop)[];
  // Propiedades en inglés para compatibilidad retroactiva
  origin?: { name: string; lat: number; lng: number };
  stops?: (ParadaRutaOptimizada | RouteStop)[];
}

export const RouteMap: React.FC<PropiedadesMapaRutas> = ({
  origen,
  paradas,
  origin,
  stops
}) => {
  const contenedorMapaRef = useRef<HTMLDivElement>(null);
  const instanciaMapaRef = useRef<L.Map | null>(null);
  const capaMarcadoresRef = useRef<L.LayerGroup | null>(null);

  // Normalizar datos de origen y paradas
  const puntoOrigen = origen || origin || {
    name: 'CDMX - Origen',
    lat: 19.4270,
    lng: -99.1677
  };

  const nombreOrigen = 'nombre' in puntoOrigen ? puntoOrigen.nombre : puntoOrigen.name;
  const latOrigen = puntoOrigen.lat;
  const lngOrigen = puntoOrigen.lng;

  const listaParadas = paradas || stops || [];

  useEffect(() => {
    if (!contenedorMapaRef.current) return;

    if (!instanciaMapaRef.current) {
      // Inicializar mapa centrado en la Zona Metropolitana del Valle de México
      const mapa = L.map(contenedorMapaRef.current).setView([19.4326, -99.1332], 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap &bull; Develop Logistics PAP',
        maxZoom: 18,
      }).addTo(mapa);

      instanciaMapaRef.current = mapa;
      capaMarcadoresRef.current = L.layerGroup().addTo(mapa);
    }

    const mapa = instanciaMapaRef.current;
    const capaMarcadores = capaMarcadoresRef.current;

    if (!mapa || !capaMarcadores) return;

    capaMarcadores.clearLayers();

    // 1. Marcador personalizado para el Origen (CDMX) con Azul Institucional Develop
    const iconoOrigen = L.divIcon({
      className: 'marcador-origen-develop',
      html: `
        <div style="background: linear-gradient(135deg, #0f094f, #29008e); color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; border: 2.5px solid white; box-shadow: 0 8px 18px rgba(15,9,79,0.45);">
          📍
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const marcadorOrigen = L.marker([latOrigen, lngOrigen], { icon: iconoOrigen })
      .bindPopup(`
        <div style="font-family: 'Inter', system-ui, sans-serif; font-size: 12px; padding: 2px;">
          <span style="background: rgba(15,9,79,0.08); color: #0f094f; font-weight: 700; padding: 2px 6px; border-radius: 4px; font-size: 10px; text-transform: uppercase;">Sede Base &bull; Salida y Retorno</span>
          <h4 style="margin: 6px 0 2px; font-weight: 700; color: #111; font-size: 13px;">${nombreOrigen}</h4>
          <p style="margin: 0; color: #555; font-size: 11px;">Inicio y conclusión oficial del circuito cerrado</p>
        </div>
      `);
    capaMarcadores.addLayer(marcadorOrigen);

    const puntosPolilinea: [number, number][] = [[latOrigen, lngOrigen]];

    // 2. Marcadores numerados para cada universidad en el orden óptimo calculado
    listaParadas.forEach((parada) => {
      const orden = 'orden' in parada ? parada.orden : parada.order;
      const nombre = 'nombre' in parada ? parada.nombre : parada.name;
      const municipio = 'municipio' in parada ? parada.municipio : parada.municipality;
      const estado = 'estado' in parada ? parada.estado : parada.state;
      const horaLlegada = 'hora_reunion_recomendada' in parada ? parada.hora_reunion_recomendada : parada.recommendedMeetingHour;
      const director = 'director_nombre' in parada ? parada.director_nombre : parada.directorName;
      const lat = parada.lat;
      const lng = parada.lng;

      puntosPolilinea.push([lat, lng]);

      const iconoParada = L.divIcon({
        className: 'marcador-parada-develop',
        html: `
          <div style="background: linear-gradient(135deg, #29008e, #640354); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; border: 2px solid white; box-shadow: 0 4px 12px rgba(41,0,142,0.35);">
            ${orden}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marcadorParada = L.marker([lat, lng], { icon: iconoParada })
        .bindPopup(`
          <div style="font-family: 'Inter', system-ui, sans-serif; font-size: 12px; max-width: 230px; padding: 2px;">
            <span style="background: rgba(41,0,142,0.1); color: #29008e; font-weight: 700; padding: 2px 8px; border-radius: 999px; font-size: 10px;">PARADA #${orden}</span>
            <h4 style="margin: 6px 0 3px; font-weight: 700; font-size: 13px; color: #111;">${nombre}</h4>
            <p style="margin: 0; color: #666; font-size: 11px;">${municipio}, ${estado}</p>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee;">
              <p style="margin: 0 0 3px; color: #111; font-size: 11px;"><strong>Llegada est.:</strong> ${horaLlegada}</p>
              <p style="margin: 0; color: #111; font-size: 11px;"><strong>Contacto:</strong> ${director}</p>
            </div>
          </div>
        `);
      capaMarcadores.addLayer(marcadorParada);
    });

    // 3. Cerrar el circuito retornando al origen
    puntosPolilinea.push([latOrigen, lngOrigen]);

    // 4. Dibujar la polilínea del circuito cerrado con tono Violeta Develop
    if (puntosPolilinea.length > 2) {
      const polilineaCircuito = L.polyline(puntosPolilinea, {
        color: '#29008e',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 6',
      });
      capaMarcadores.addLayer(polilineaCircuito);

      // Ajustar encuadre del mapa para contener todos los puntos
      const limites = L.latLngBounds(puntosPolilinea);
      const margen = window.innerWidth < 640 ? 20 : 45;
      mapa.fitBounds(limites, { padding: [margen, margen] });
    }
  }, [puntoOrigen, listaParadas, latOrigen, lngOrigen, nombreOrigen]);

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[490px] rounded-[20px] sm:rounded-[24px] overflow-hidden border border-black/10 shadow-develop-card">
      <div ref={contenedorMapaRef} className="w-full h-full" />

      {/* Leyenda con Identidad Develop Glass */}
      <div className="absolute bottom-3 right-3 sm:top-4 sm:right-4 sm:bottom-auto z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl border border-black/10 shadow-develop-card text-[10px] sm:text-xs font-medium space-y-1 sm:space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#0f094f] inline-block shadow-xs"></span>
          <span className="text-[#111111] font-semibold">Origen & Retorno (CDMX)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-[#29008e] to-[#640354] inline-block shadow-xs"></span>
          <span className="text-[#555555]">Sedes Optimizadas (1..{listaParadas.length})</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="w-4 h-0.5 border-t-2 border-dashed border-[#29008e] inline-block"></span>
          <span className="text-[#555555]">Circuito TSP (2-Opt)</span>
        </div>
      </div>
    </div>
  );
};
