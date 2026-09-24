import React, { useState, useMemo } from 'react';
import { Company, OptimizedTrip } from '../../types';
import { solveOptimalRoute, generateGoogleMapsUrl } from '../../utils/routeOptimizer';
import { RouteMap } from './RouteMap';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  TrendingUp, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Phone, 
  Award, 
  Calendar, 
  Building2, 
  RefreshCw,
  Fuel,
  Receipt,
  Utensils,
  CheckCircle2,
  Car
} from 'lucide-react';

interface SchoolRoutePlannerProps {
  schools: Company[];
  onSelectSchoolForCRM?: (schoolId: string) => void;
  onLogRouteToCRM?: (trip: OptimizedTrip) => void;
}

const CDMX_ORIGIN_OPTIONS = [
  {
    name: 'CDMX - Paseo de la Reforma (Ángel de la Independencia)',
    address: 'Paseo de la Reforma s/n, Juárez, Cuauhtémoc, CDMX',
    lat: 19.4270,
    lng: -99.1677
  },
  {
    name: 'CDMX - Insurgentes Sur (Col. Del Valle / Mixcoac)',
    address: 'Av. Insurgentes Sur 1200, Benito Juárez, CDMX',
    lat: 19.3780,
    lng: -99.1785
  },
  {
    name: 'CDMX - Polanco (Miguel Hidalgo)',
    address: 'Av. Pdte. Masaryk 111, Polanco, CDMX',
    lat: 19.4326,
    lng: -99.1915
  },
  {
    name: 'CDMX - Centro Histórico (Zócalo)',
    address: 'Plaza de la Constitución s/n, Centro, CDMX',
    lat: 19.4326,
    lng: -99.1332
  }
];

export const SchoolRoutePlanner: React.FC<SchoolRoutePlannerProps> = ({
  schools,
  onSelectSchoolForCRM,
  onLogRouteToCRM
}) => {
  const [selectedOriginIndex, setSelectedOriginIndex] = useState<number>(0);
  const [filterState, setFilterState] = useState<string>('Estado de México');
  
  // Por defecto, universidades del Estado de México para la ruta inicial
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>(() => {
    return schools
      .filter((s) => s.state === 'Estado de México')
      .map((s) => s.id);
  });

  const [optimizedTrip, setOptimizedTrip] = useState<OptimizedTrip | null>(() => {
    const origin = CDMX_ORIGIN_OPTIONS[0];
    const initialSchools = schools.filter((s) => s.state === 'Estado de México');
    return solveOptimalRoute(origin, initialSchools, 'Estado de México');
  });

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [routeSavedInCRM, setRouteSavedInCRM] = useState<boolean>(false);

  // Filtrado de lista según estado
  const filteredSchools = useMemo(() => {
    if (filterState === 'Todas') return schools;
    return schools.filter((s) => s.state === filterState);
  }, [schools, filterState]);

  const toggleSelectSchool = (id: string) => {
    setSelectedSchoolIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredSchools.map((s) => s.id);
    setSelectedSchoolIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
  };

  const unselectAllFiltered = () => {
    const allFilteredIds = new Set(filteredSchools.map((s) => s.id));
    setSelectedSchoolIds((prev) => prev.filter((id) => !allFilteredIds.has(id)));
  };

  const handleComputeRoute = () => {
    setIsCalculating(true);
    setRouteSavedInCRM(false);
    setTimeout(() => {
      const origin = CDMX_ORIGIN_OPTIONS[selectedOriginIndex];
      const targetSchools = schools.filter((s) => selectedSchoolIds.includes(s.id));
      const trip = solveOptimalRoute(origin, targetSchools, filterState);
      setOptimizedTrip(trip);
      setIsCalculating(false);
    }, 450);
  };

  const handleSaveToCRM = () => {
    if (optimizedTrip && onLogRouteToCRM) {
      onLogRouteToCRM(optimizedTrip);
    }
    setRouteSavedInCRM(true);
    setTimeout(() => setRouteSavedInCRM(false), 4000);
  };

  const googleMapsUrl = optimizedTrip ? generateGoogleMapsUrl(optimizedTrip) : '';

  return (
    <div className="space-y-7">
      {/* HEADER HERO ESTÁTICO DEVELOP */}
      <div className="internal-hero-surface rounded-[20px] sm:rounded-[28px] p-4 sm:p-7 lg:p-8 shadow-develop-modal border border-white/10 text-white relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 pill-dark text-xs font-bold uppercase tracking-widest text-[#a78bfa]">
              <Sparkles className="w-3.5 h-3.5" />
              Develop Logistics · TSP & Viáticos Enterprise
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Planificador de Rutas Universitarias & <span className="gradient-text">Control de Viáticos</span>
            </h1>
            <p className="text-white/70 text-xs lg:text-sm leading-relaxed">
              Algoritmo de optimización de traslados: genera circuitos cerrados sin trayectorias repetidas, agenda sincronizada con directores y cotizador de viáticos (gasolina, casetas y alimentos) listo para autorización de dirección comercial.
            </p>
          </div>

          {optimizedTrip && (
            <div className="card-glass-dark p-3.5 sm:px-6 sm:py-4 rounded-2xl flex items-center gap-3 sm:gap-4 text-left border border-white/20 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#f472b6] flex items-center justify-center font-bold text-white shadow-develop-box">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] uppercase text-white/60 font-bold tracking-wider">Eficiencia Logística</div>
                <div className="text-2xl font-black gradient-text">+{optimizedTrip.efficiencyGainPct}%</div>
                <div className="text-xs text-[#a78bfa] font-medium">Ahorro vs. ruta no ordenada</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {routeSavedInCRM && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            ¡Itinerario de visitas y presupuesto de viáticos guardados exitosamente en la agenda del CRM de Develop!
          </span>
        </div>
      )}

      {/* PANEL DE CONFIGURACIÓN Y MAPA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Parámetros y Selector de Universidades (4 Columnas) */}
        <div className="lg:col-span-4 card-light p-4 sm:p-6 rounded-[24px] space-y-5">
          <div className="pb-3 border-b border-black/5">
            <h3 className="font-bold text-[#111111] flex items-center gap-2 text-base">
              <Navigation className="w-4 h-4 text-[#0f094f]" />
              Parámetros de la Jornada
            </h3>
            <p className="text-xs text-[#555555] mt-0.5">Configura punto base y sedes a visitar</p>
          </div>

          {/* Selector de Origen (CDMX) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#111111] uppercase tracking-wider block">
              Punto de Partida y Retorno (CDMX)
            </label>
            <select
              value={selectedOriginIndex}
              onChange={(e) => setSelectedOriginIndex(Number(e.target.value))}
              className="input-develop w-full text-xs font-medium text-[#111111]"
            >
              {CDMX_ORIGIN_OPTIONS.map((opt, idx) => (
                <option key={idx} value={idx}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Estado */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#111111] uppercase tracking-wider block">
              Región Objetivo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Estado de México', 'CDMX', 'Todas'].map((stateName) => (
                <button
                  key={stateName}
                  onClick={() => setFilterState(stateName)}
                  className={`text-xs py-2 px-2 rounded-xl font-medium transition-all ${
                    filterState === stateName
                      ? 'btn-primary-develop'
                      : 'btn-secondary-light'
                  }`}
                >
                  {stateName === 'Estado de México' ? 'Edo. Méx.' : stateName}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Universidades */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#111111] uppercase tracking-wider">
                Sedes Seleccionadas ({selectedSchoolIds.length})
              </label>
              <div className="flex gap-2">
                <button
                  onClick={selectAllFiltered}
                  className="text-xs text-[#29008e] hover:underline font-bold"
                >
                  Todas
                </button>
                <span className="text-black/20">|</span>
                <button
                  onClick={unselectAllFiltered}
                  className="text-xs text-[#888888] hover:underline font-medium"
                >
                  Ninguna
                </button>
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 border border-black/5 rounded-2xl p-2 bg-[#F8F8FC]">
              {filteredSchools.map((school) => {
                const isSelected = selectedSchoolIds.includes(school.id);
                return (
                  <div
                    key={school.id}
                    onClick={() => toggleSelectSchool(school.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-white border-[#29008e]/30 shadow-xs'
                        : 'bg-white/60 border-black/5 hover:border-black/10'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#29008e]" />
                      ) : (
                        <Square className="w-4 h-4 text-[#888888]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-[#111111] truncate">
                        {school.name}
                      </div>
                      <div className="text-[11px] text-[#555555] truncate">
                        {school.municipality}, {school.state}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-2 py-0.5 bg-black/5 text-[#555555] rounded-md font-medium">
                          {school.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-[#640354]/10 text-[#640354] rounded-md font-bold flex items-center gap-0.5">
                          <Award className="w-3 h-3" /> Score {school.leadScore}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botón de Resolver */}
          <button
            onClick={handleComputeRoute}
            disabled={selectedSchoolIds.length === 0 || isCalculating}
            className="btn-primary-develop w-full py-3.5 px-4 disabled:opacity-50 text-white font-bold rounded-2xl shadow-develop-box transition-all flex items-center justify-center gap-2 text-xs"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#a78bfa]" />
                Optimizando Circuito Logístico...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#a78bfa]" />
                Calcular Ruta Óptima & Viáticos
              </>
            )}
          </button>
        </div>

        {/* Columna Derecha / Centro: Métricas, Viáticos y Mapa (8 Columnas) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Métricas Resumen Operativas */}
          {optimizedTrip && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="card-light p-4 rounded-2xl">
                <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">Distancia Total</div>
                <div className="text-xl font-black text-[#111111] mt-1">
                  {optimizedTrip.totalDistanceKm} km
                </div>
                <div className="text-[11px] text-[#555555]">Circuito completo</div>
              </div>

              <div className="card-light p-4 rounded-2xl">
                <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">Tiempo Manejo</div>
                <div className="text-xl font-black text-[#29008e] mt-1">
                  {Math.floor(optimizedTrip.totalDrivingMinutes / 60)}h {optimizedTrip.totalDrivingMinutes % 60}m
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">Tráfico ponderado</div>
              </div>

              <div className="card-light p-4 rounded-2xl">
                <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">Jornada Estimada</div>
                <div className="text-xl font-black text-[#111111] mt-1">
                  {Math.floor(optimizedTrip.totalEstimatedTripMinutes / 60)}h {optimizedTrip.totalEstimatedTripMinutes % 60}m
                </div>
                <div className="text-[11px] text-[#555555]">50m/reunión + traslado</div>
              </div>

              <div className="card-light p-4 rounded-2xl">
                <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">Sedes Programadas</div>
                <div className="text-xl font-black text-[#640354] mt-1">
                  {optimizedTrip.stops.length} campus
                </div>
                <div className="text-[11px] text-[#555555]">Sin duplicar trayectos</div>
              </div>
            </div>
          )}

          {/* PRESUPUESTO DE VIÁTICOS DEVELOP */}
          {optimizedTrip && (
            <div className="card-light p-5 rounded-[24px] border border-[#0f094f]/10 shadow-develop-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0f094f] text-white flex items-center justify-center font-bold shadow-develop-box">
                    <Receipt className="w-5 h-5 text-[#a78bfa]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111111] text-sm sm:text-base">
                      Presupuesto de Viáticos para Autorización Institucional
                    </h4>
                    <p className="text-xs text-[#555555]">
                      Cálculo automatizado de insumos para la comitiva de campo Develop
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#888888] uppercase font-bold tracking-wider block">Total Autorizado:</span>
                  <span className="text-xl font-black text-[#0f094f]">
                    ${optimizedTrip.viaticos.totalViaticosMxn.toLocaleString('es-MX')} <span className="text-xs font-semibold text-[#555555]">MXN</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 text-xs">
                <div className="bg-[#F8F8FC] p-3.5 rounded-2xl border border-black/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0f094f]/10 flex items-center justify-center text-[#0f094f] shrink-0">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#888888] uppercase font-bold">Gasolina</div>
                    <div className="font-extrabold text-[#111111] text-sm">
                      ${optimizedTrip.viaticos.gasolinaMxn.toLocaleString('es-MX')} MXN
                    </div>
                    <div className="text-[10px] text-[#555555]">
                      ~{optimizedTrip.viaticos.fuelLitersEstimate} L (10.5 km/L)
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8F8FC] p-3.5 rounded-2xl border border-black/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#29008e]/10 flex items-center justify-center text-[#29008e] shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#888888] uppercase font-bold">Casetas / Peajes</div>
                    <div className="font-extrabold text-[#111111] text-sm">
                      ${optimizedTrip.viaticos.casetasMxn.toLocaleString('es-MX')} MXN
                    </div>
                    <div className="text-[10px] text-[#555555]">
                      Autopistas estatales
                    </div>
                  </div>
                </div>

                <div className="bg-[#F8F8FC] p-3.5 rounded-2xl border border-black/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#640354]/10 flex items-center justify-center text-[#640354] shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#888888] uppercase font-bold">Alimentos / Dieta</div>
                    <div className="font-extrabold text-[#111111] text-sm">
                      ${optimizedTrip.viaticos.alimentosMxn.toLocaleString('es-MX')} MXN
                    </div>
                    <div className="text-[10px] text-[#555555]">
                      {optimizedTrip.viaticos.daysEstimate} día(s) en campo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mapa Interactivo de la Ruta */}
          <div className="card-light p-5 rounded-[24px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#29008e]" />
                <h3 className="font-bold text-[#111111] text-sm">
                  Trazado Geoespacial de Visitas (Algoritmo 2-Opt)
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <button
                  onClick={handleSaveToCRM}
                  className="btn-primary-develop px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#a78bfa]" />
                  Guardar en Agenda CRM
                </button>

                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary-light px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#29008e]" />
                    Abrir GPS
                  </a>
                )}
              </div>
            </div>

            {optimizedTrip && (
              <RouteMap
                origin={optimizedTrip.origin}
                stops={optimizedTrip.stops}
              />
            )}
          </div>
        </div>
      </div>

      {/* ITINERARIO CRONOLÓGICO PASO A PASO */}
      {optimizedTrip && optimizedTrip.stops.length > 0 && (
        <div className="card-light p-4 sm:p-6 lg:p-7 rounded-[20px] sm:rounded-[28px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-black/5">
            <div>
              <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0f094f]" />
                Itinerario Oficial & Cronograma de Visitas
              </h3>
              <p className="text-xs text-[#555555] mt-1">
                Secuencia coordinada de juntas con directores de vinculación y comités de carrera.
              </p>
            </div>

            <div className="text-xs px-3 py-1 bg-[#0f094f]/10 text-[#0f094f] font-bold rounded-full border border-[#0f094f]/15 self-start sm:self-auto">
              Circuito Cerrado Verificado
            </div>
          </div>

          <div className="relative border-l-2 border-dashed border-[#29008e]/30 ml-3 pl-4 sm:ml-4 sm:pl-6 space-y-4 sm:space-y-6">
            {/* Punto de Inicio */}
            <div className="relative">
              <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full bg-[#0f094f] text-white flex items-center justify-center text-xs font-bold shadow-md">
                🏁
              </div>
              <div className="bg-[#F8F8FC] p-4 rounded-2xl border border-black/5 text-xs">
                <div className="font-bold text-[#111111]">Salida: {optimizedTrip.origin.name}</div>
                <div className="text-[#555555] text-[11px] mt-0.5">{optimizedTrip.origin.address}</div>
                <div className="mt-1.5 font-bold text-[#0f094f]">Hora de salida recomendada: 08:30 hrs</div>
              </div>
            </div>

            {/* Paradas de Universidades */}
            {optimizedTrip.stops.map((stop) => (
              <div key={stop.order} className="relative group">
                <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#29008e] to-[#640354] text-white flex items-center justify-center text-xs font-black shadow-md">
                  {stop.order}
                </div>
                
                <div className="card-light card-light-hover p-3.5 sm:p-5 rounded-[18px] sm:rounded-[22px]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#29008e] px-2.5 py-0.5 bg-[#29008e]/10 rounded-full">
                          Parada #{stop.order}
                        </span>
                        <h4 className="font-bold text-[#111111] text-sm">{stop.name}</h4>
                      </div>
                      <p className="text-xs text-[#555555] mt-1">{stop.address}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 md:mt-0">
                      <div className="text-left md:text-right">
                        <div className="text-xs font-bold text-[#111111] flex items-center gap-1 justify-start md:justify-end">
                          <Clock className="w-3.5 h-3.5 text-[#29008e]" />
                          {stop.recommendedMeetingHour}
                        </div>
                        <div className="text-[11px] text-[#888888]">
                          {stop.drivingTimeFromPrevMin} min de traslado ({stop.distanceFromPrevKm} km)
                        </div>
                      </div>

                      {onSelectSchoolForCRM && (
                        <button
                          onClick={() => onSelectSchoolForCRM(stop.schoolId)}
                          className="btn-primary-develop px-3.5 py-1.5 text-xs font-bold flex items-center gap-1 shrink-0"
                        >
                          <Building2 className="w-3.5 h-3.5 text-[#a78bfa]" />
                          Ficha CRM
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-black/5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#555555]">
                      <span className="font-medium text-[#888888]">Titular:</span>
                      <span className="font-bold text-[#111111]">{stop.directorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#555555]">
                      <Phone className="w-3.5 h-3.5 text-[#888888]" />
                      <a href={`tel:${stop.phone}`} className="hover:text-[#29008e] font-medium text-[#0f094f]">
                        {stop.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#555555]">
                      <Award className="w-3.5 h-3.5 text-[#640354]" />
                      <span className="font-medium text-[#888888]">Lead Score:</span>
                      <span className="font-bold text-[#640354]">{stop.leadScore}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Punto de Retorno */}
            <div className="relative">
              <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full bg-[#0f094f] text-white flex items-center justify-center text-xs font-bold shadow-md">
                🏁
              </div>
              <div className="bg-[#0f094f]/5 p-4 rounded-2xl border border-[#0f094f]/15 text-xs">
                <div className="font-bold text-[#0f094f]">Retorno a Sede Base: {optimizedTrip.origin.name}</div>
                <div className="text-[#555555] text-[11px] mt-0.5">
                  Conclusión del circuito en CDMX. Los acuerdos y minutas quedan registrados en el CRM de Develop.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
