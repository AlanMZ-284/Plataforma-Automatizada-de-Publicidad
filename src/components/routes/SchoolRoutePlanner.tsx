import React, { useState, useMemo, useEffect } from 'react';
import { Company } from '../../types';
import {
  resolverCircuitoOptimoTsp,
  generarEnlaceGoogleMaps,
  PUNTOS_ORIGEN_CDMX,
  RecorridoOptimizado
} from '../../utils/optimizadorRutas';
import { guardarRecorridoRuta, ResultadoGuardadoRecorrido } from '../../services/servicioCrm';
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
  Car,
  Search,
  FileSpreadsheet,
  FlagTriangleRight
} from 'lucide-react';

interface SchoolRoutePlannerProps {
  schools: Company[];
  onSelectSchoolForCRM?: (schoolId: string) => void;
  onLogRouteToCRM?: (trip: any, fechaGira?: string, asesor?: string) => void;
  escuelaPreseleccionadaId?: string | null;
  fechaPreseleccionada?: string;
  asesorPreseleccionado?: string;
  onLimpiarEscuelaPreseleccionada?: () => void;
}

export const SchoolRoutePlanner: React.FC<SchoolRoutePlannerProps> = ({
  schools,
  onSelectSchoolForCRM,
  onLogRouteToCRM,
  escuelaPreseleccionadaId,
  fechaPreseleccionada,
  asesorPreseleccionado,
  onLimpiarEscuelaPreseleccionada
}) => {
  const [selectedOriginIndex, setSelectedOriginIndex] = useState<number>(0);
  const [filterState, setFilterState] = useState<string>('Estado de México');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Fecha seleccionada para la gira (por defecto mañana o fecha actual)
  const [fechaGira, setFechaGira] = useState<string>(() => {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().split('T')[0];
  });

  const [asesorResponsable, setAsesorResponsable] = useState<string>('Carlos Mendoza');

  // Identificar si una escuela fue importada desde archivo Excel o CSV
  const esEscuelaImportada = (escuela: Company): boolean => {
    return (
      (escuela.tags && escuela.tags.some((t) => t.toLowerCase().includes('excel') || t.toLowerCase().includes('importad'))) ||
      escuela.id.startsWith('uni-') ||
      (!escuela.id.startsWith('school-mex-') && !escuela.id.startsWith('school-cdmx-'))
    );
  };

  // Por defecto, universidades del Estado de México para la ruta inicial
  const [selectedSchoolIds, setSelectedSchoolIds] = useState<string[]>(() => {
    const iniciales = schools.filter((s) => s.state === 'Estado de México').map((s) => s.id);
    return iniciales.length > 0 ? iniciales : schools.slice(0, 5).map((s) => s.id);
  });

  const [recorridoActual, setRecorridoActual] = useState<RecorridoOptimizado | null>(() => {
    const origen = PUNTOS_ORIGEN_CDMX[0];
    const escuelasIniciales = schools.filter((s) => s.state === 'Estado de México');
    return resolverCircuitoOptimoTsp(origen, escuelasIniciales, 'Estado de México');
  });

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [guardandoEnCrm, setGuardandoEnCrm] = useState<boolean>(false);
  const [resultadoGuardado, setResultadoGuardado] = useState<ResultadoGuardadoRecorrido | null>(null);

  // Escuela preseleccionada desde el CRM
  const escuelaPreseleccionada = useMemo(() => {
    if (!escuelaPreseleccionadaId) return null;
    return schools.find((s) => s.id === escuelaPreseleccionadaId) || null;
  }, [escuelaPreseleccionadaId, schools]);

  // Efecto reactivo de precarga automática para campus agendado desde el CRM
  useEffect(() => {
    if (!escuelaPreseleccionadaId) return;

    const escuela = schools.find((s) => s.id === escuelaPreseleccionadaId);
    if (escuela) {
      // a) Ajusta filterState al estado de la escuela (CDMX, Estado de México o 'Todas')
      const estadoEscuela =
        escuela.state === 'CDMX' || escuela.state === 'Estado de México'
          ? escuela.state
          : 'Todas';
      setFilterState(estadoEscuela);

      // b) Establece setSelectedSchoolIds([escuela.id]) para enfocar la ruta exclusivamente en ese destino
      setSelectedSchoolIds([escuela.id]);

      // c) Si se proporciona fechaPreseleccionada, actualiza setFechaGira(fechaPreseleccionada)
      if (fechaPreseleccionada) {
        setFechaGira(fechaPreseleccionada);
      }

      // d) Si se proporciona asesorPreseleccionado, actualiza setAsesorResponsable(asesorPreseleccionado)
      if (asesorPreseleccionado) {
        setAsesorResponsable(asesorPreseleccionado);
      }

      // e) Ejecuta resolverCircuitoOptimoTsp con el punto base de CDMX actual y la escuela seleccionada
      const origenActual = PUNTOS_ORIGEN_CDMX[selectedOriginIndex] || PUNTOS_ORIGEN_CDMX[0];
      const nuevoRecorrido = resolverCircuitoOptimoTsp(
        origenActual,
        [escuela],
        estadoEscuela
      );
      setRecorridoActual(nuevoRecorrido);

      // f) Limpia cualquier resultadoGuardado previo
      setResultadoGuardado(null);
    }
  }, [escuelaPreseleccionadaId, schools, fechaPreseleccionada, asesorPreseleccionado, selectedOriginIndex]);

  // Filtrado de lista según estado y término de búsqueda
  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      const coincideEstado = filterState === 'Todas' || s.state === filterState;
      const coincideBusqueda = 
        !searchTerm.trim() ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.directorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.tags && s.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));
      return coincideEstado && coincideBusqueda;
    });
  }, [schools, filterState, searchTerm]);

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
    setResultadoGuardado(null);
    setTimeout(() => {
      const origen = PUNTOS_ORIGEN_CDMX[selectedOriginIndex];
      const escuelasSeleccionadas = schools.filter((s) => selectedSchoolIds.includes(s.id));
      const nuevoRecorrido = resolverCircuitoOptimoTsp(origen, escuelasSeleccionadas, filterState);
      setRecorridoActual(nuevoRecorrido);
      setIsCalculating(false);
    }, 400);
  };

  const handleSaveToCRM = async () => {
    if (!recorridoActual) return;
    setGuardandoEnCrm(true);

    try {
      // 1. Guardar en persistencia central (Supabase + localStorage)
      const resultado = await guardarRecorridoRuta(recorridoActual, fechaGira, asesorResponsable);
      setResultadoGuardado(resultado);

      // 2. Notificar al manejador de la aplicación principal para reactividad instantánea
      if (onLogRouteToCRM) {
        onLogRouteToCRM(recorridoActual, fechaGira, asesorResponsable);
      }
    } catch (error) {
      console.error('Error al guardar recorrido en CRM:', error);
    } finally {
      setGuardandoEnCrm(false);
    }
  };

  const googleMapsUrl = recorridoActual ? generarEnlaceGoogleMaps(recorridoActual.origen, recorridoActual.paradas) : '';

  // Cantidad de escuelas importadas disponibles en el catálogo
  const totalImportadas = useMemo(() => schools.filter(esEscuelaImportada).length, [schools]);

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
              Algoritmo 2-Opt TSP con restricción de circuito cerrado (origen CDMX ➔ escuelas seleccionadas ➔ retorno base).
              Integrado con el catálogo escolar oficial (incluyendo planteles importados vía Excel) y sincronización directa con la agenda del CRM.
            </p>
          </div>

          {recorridoActual && (
            <div className="card-glass-dark p-3.5 sm:px-6 sm:py-4 rounded-2xl flex items-center gap-3 sm:gap-4 text-left border border-white/20 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#f472b6] flex items-center justify-center font-bold text-white shadow-develop-box">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] uppercase text-white/60 font-bold tracking-wider">Eficiencia Logística</div>
                <div className="text-2xl font-black gradient-text">+{recorridoActual.porcentaje_ganancia_eficiencia}%</div>
                <div className="text-xs text-[#a78bfa] font-medium">Ahorro vs. ruta desordenada</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BANNER VISUAL DE CAMPUS AGENDADO */}
      {escuelaPreseleccionadaId && (
        <div className="bg-[#0f094f]/5 border border-[#29008e]/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f094f] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Navigation className="w-5 h-5 text-[#a78bfa]" />
            </div>
            <div>
              <span className="text-[#29008e] font-bold uppercase tracking-wider text-[10px] block">
                CAMPUS COMERCIAL AGENDADO PRECARGADO
              </span>
              <h2 className="font-bold text-sm text-[#111111]">
                {escuelaPreseleccionada?.name || 'Campus Universitario Seleccionado'}
              </h2>
              <p className="text-xs text-[#555555] mt-0.5">
                {escuelaPreseleccionada ? `${escuelaPreseleccionada.municipality}, ${escuelaPreseleccionada.state} — ` : ''}
                Circuito cerrado y liquidación de viáticos calculados automáticamente para la visita.
              </p>
            </div>
          </div>

          {onLimpiarEscuelaPreseleccionada && (
            <button
              type="button"
              onClick={onLimpiarEscuelaPreseleccionada}
              className="px-3.5 py-2 text-xs font-bold text-[#0f094f] bg-white border border-[#29008e]/20 rounded-xl hover:bg-[#0f094f]/5 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Ver todas las sedes
            </button>
          )}
        </div>
      )}

      {/* NOTIFICACIÓN DE ÉXITO AL GUARDAR EN AGENDA CRM */}
      {resultadoGuardado && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-start sm:items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="font-bold text-xs sm:text-sm text-emerald-900">
                ¡Gira agendada exitosamente en el CRM de Develop!
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-800 mt-0.5">
                Se registraron <strong>{resultadoGuardado.totalParadas} reuniones presenciales</strong> para el día{' '}
                <strong>{fechaGira}</strong> a cargo de <strong>{asesorResponsable}</strong> con un presupuesto de viáticos autorizado de{' '}
                <strong>${resultadoGuardado.totalViaticosMxn.toLocaleString('es-MX')} MXN</strong>.
              </div>
            </div>
          </div>

          {resultadoGuardado.enlaceGoogleMaps && (
            <a
              href={resultadoGuardado.enlaceGoogleMaps}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-develop px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#a78bfa]" />
              Abrir Itinerario en Google Maps
            </a>
          )}
        </div>
      )}

      {/* PANEL DE CONFIGURACIÓN Y MAPA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Parámetros y Selector de Universidades (4 Columnas) */}
        <div className="lg:col-span-4 card-light p-4 sm:p-6 rounded-[24px] space-y-5">
          <div className="pb-3 border-b border-black/5 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#111111] flex items-center gap-2 text-base">
                <Navigation className="w-4 h-4 text-[#0f094f]" />
                Parámetros de la Jornada
              </h3>
              <p className="text-xs text-[#555555] mt-0.5">Configura punto base, fecha y sedes</p>
            </div>
            {totalImportadas > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                {totalImportadas} de Excel
              </span>
            )}
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
              {PUNTOS_ORIGEN_CDMX.map((opt, idx) => (
                <option key={idx} value={idx}>
                  {opt.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de Gira y Asesor Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#111111] uppercase tracking-wider block">
                Fecha de la Gira
              </label>
              <input
                type="date"
                value={fechaGira}
                onChange={(e) => setFechaGira(e.target.value)}
                className="input-develop w-full text-xs font-medium text-[#111111]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#111111] uppercase tracking-wider block">
                Asesor en Campo
              </label>
              <input
                type="text"
                value={asesorResponsable}
                onChange={(e) => setAsesorResponsable(e.target.value)}
                className="input-develop w-full text-xs font-medium text-[#111111]"
                placeholder="Nombre del asesor"
              />
            </div>
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

          {/* Búsqueda rápida de universidades */}
          <div className="space-y-1.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar campus o municipio..."
                className="input-develop w-full pl-8 text-xs text-[#111111]"
              />
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
                  Todas ({filteredSchools.length})
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

            <div className="max-h-[290px] overflow-y-auto space-y-2 pr-1 border border-black/5 rounded-2xl p-2 bg-[#F8F8FC]">
              {filteredSchools.length === 0 ? (
                <div className="text-center py-6 text-xs text-[#888888]">
                  No se encontraron instituciones con el filtro aplicado.
                </div>
              ) : (
                filteredSchools.map((school) => {
                  const isSelected = selectedSchoolIds.includes(school.id);
                  const importada = esEscuelaImportada(school);

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
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-[#111111] truncate">
                            {school.name}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#555555] truncate">
                          {school.municipality}, {school.state}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] px-2 py-0.5 bg-black/5 text-[#555555] rounded-md font-medium">
                            {school.type.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-[#640354]/10 text-[#640354] rounded-md font-bold flex items-center gap-0.5">
                            <Award className="w-3 h-3" /> Score {school.leadScore}
                          </span>
                          {importada && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold flex items-center gap-0.5">
                              <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-700" /> Excel
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
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
                Optimizando Circuito Logístico 2-Opt...
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
          {recorridoActual && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="card-light p-4 rounded-2xl">
                <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">Distancia Total</div>
                <div className="text-xl font-black text-[#111111] mt-1">
                  {recorridoActual.distancia_total_km} km
                </div>
                <div className="text-[11px] text-[#555555]">Circuito completo</div>
              </div>

              <div className="card-light p-4 rounded-2xl">
                <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">Tiempo Manejo</div>
                <div className="text-xl font-black text-[#29008e] mt-1">
                  {Math.floor(recorridoActual.minutos_conduccion_total / 60)}h {recorridoActual.minutos_conduccion_total % 60}m
                </div>
                <div className="text-[11px] text-emerald-700 font-medium">Tráfico ponderado</div>
              </div>

              <div className="card-light p-4 rounded-2xl">
                <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">Jornada Estimada</div>
                <div className="text-xl font-black text-[#111111] mt-1">
                  {Math.floor(recorridoActual.minutos_estimados_totales / 60)}h {recorridoActual.minutos_estimados_totales % 60}m
                </div>
                <div className="text-[11px] text-[#555555]">50m/reunión + traslado</div>
              </div>

              <div className="card-light p-4 rounded-2xl">
                <div className="text-[11px] text-[#888888] font-semibold uppercase tracking-wider">Sedes Programadas</div>
                <div className="text-xl font-black text-[#640354] mt-1">
                  {recorridoActual.paradas.length} campus
                </div>
                <div className="text-[11px] text-[#555555]">Sin duplicar trayectos</div>
              </div>
            </div>
          )}

          {/* PRESUPUESTO DE VIÁTICOS AUDITABLE DEVELOP */}
          {recorridoActual && (
            <div className="card-light p-5 rounded-[24px] border border-[#0f094f]/10 shadow-develop-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0f094f] text-white flex items-center justify-center font-bold shadow-develop-box">
                    <Receipt className="w-5 h-5 text-[#a78bfa]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#111111] text-sm sm:text-base">
                      Liquidación Preventiva de Viáticos (Propuesta PAP)
                    </h4>
                    <p className="text-xs text-[#555555]">
                      Cálculo estandarizado y auditable para autorización de dirección comercial
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[#888888] uppercase font-bold tracking-wider block">Total Viáticos MXN:</span>
                  <span className="text-2xl font-black text-[#0f094f]">
                    ${recorridoActual.viaticos.total_viaticos_mxn.toLocaleString('es-MX')}{' '}
                    <span className="text-xs font-semibold text-[#555555]">MXN</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 text-xs">
                {/* Gasolina */}
                <div className="bg-[#F8F8FC] p-3.5 rounded-2xl border border-black/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0f094f]/10 flex items-center justify-center text-[#0f094f] shrink-0">
                    <Fuel className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#888888] uppercase font-bold">Gasolina Magna</div>
                    <div className="font-extrabold text-[#111111] text-sm">
                      ${recorridoActual.viaticos.gasolina_mxn.toLocaleString('es-MX')} MXN
                    </div>
                    <div className="text-[10px] text-[#555555]">
                      ~{recorridoActual.viaticos.estimacion_litros_combustible} L ($24.80/L · 10.5 km/L)
                    </div>
                  </div>
                </div>

                {/* Casetas y Peajes */}
                <div className="bg-[#F8F8FC] p-3.5 rounded-2xl border border-black/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#29008e]/10 flex items-center justify-center text-[#29008e] shrink-0">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#888888] uppercase font-bold">Casetas / Peajes</div>
                    <div className="font-extrabold text-[#111111] text-sm">
                      ${recorridoActual.viaticos.casetas_mxn.toLocaleString('es-MX')} MXN
                    </div>
                    <div className="text-[10px] text-[#555555]">
                      Tramos periféricos y autopistas
                    </div>
                  </div>
                </div>

                {/* Alimentos */}
                <div className="bg-[#F8F8FC] p-3.5 rounded-2xl border border-black/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#640354]/10 flex items-center justify-center text-[#640354] shrink-0">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-[#888888] uppercase font-bold">Alimentos / Dieta</div>
                    <div className="font-extrabold text-[#111111] text-sm">
                      ${recorridoActual.viaticos.alimentos_mxn.toLocaleString('es-MX')} MXN
                    </div>
                    <div className="text-[10px] text-[#555555]">
                      {recorridoActual.viaticos.estimacion_dias} día(s) en campo ($450 MXN/día)
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
                  disabled={guardandoEnCrm || !recorridoActual || recorridoActual.paradas.length === 0}
                  className="btn-primary-develop px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {guardandoEnCrm ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#a78bfa]" />
                      Sincronizando con CRM...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5 text-[#a78bfa]" />
                      Guardar en Agenda CRM
                    </>
                  )}
                </button>

                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary-light px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#29008e]" />
                    Abrir GPS Google Maps
                  </a>
                )}
              </div>
            </div>

            {recorridoActual && (
              <RouteMap
                origen={recorridoActual.origen}
                paradas={recorridoActual.paradas}
              />
            )}
          </div>
        </div>
      </div>

      {/* ITINERARIO CRONOLÓGICO PASO A PASO */}
      {recorridoActual && recorridoActual.paradas.length > 0 && (
        <div className="card-light p-4 sm:p-6 lg:p-7 rounded-[20px] sm:rounded-[28px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-black/5">
            <div>
              <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0f094f]" />
                Itinerario Oficial & Cronograma de Visitas
              </h3>
              <p className="text-xs text-[#555555] mt-1">
                Secuencia coordinada de juntas con directores de vinculación y comités de carrera para el día {fechaGira}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-full border border-emerald-200">
                Asesor: {asesorResponsable}
              </span>
              <span className="text-xs px-3 py-1 bg-[#0f094f]/10 text-[#0f094f] font-bold rounded-full border border-[#0f094f]/15">
                Circuito Cerrado Verificado
              </span>
            </div>
          </div>

          <div className="relative border-l-2 border-dashed border-[#29008e]/30 ml-3 pl-4 sm:ml-4 sm:pl-6 space-y-4 sm:space-y-6">
            {/* Punto de Inicio */}
            <div className="relative">
              <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full bg-[#0f094f] text-white flex items-center justify-center text-xs font-bold shadow-md">
                <FlagTriangleRight className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
              </div>
              <div className="bg-[#F8F8FC] p-4 rounded-2xl border border-black/5 text-xs">
                <div className="font-bold text-[#111111]">Salida: {recorridoActual.origen.nombre}</div>
                <div className="text-[#555555] text-[11px] mt-0.5">{recorridoActual.origen.direccion}</div>
                <div className="mt-1.5 font-bold text-[#0f094f]">Hora de salida recomendada: 08:30 hrs</div>
              </div>
            </div>

            {/* Paradas de Universidades */}
            {recorridoActual.paradas.map((stop) => {
              const esImportada = stop.escuela_original ? esEscuelaImportada(stop.escuela_original) : false;

              return (
                <div key={stop.orden} className="relative group">
                  <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full bg-gradient-to-br from-[#29008e] to-[#640354] text-white flex items-center justify-center text-xs font-black shadow-md">
                    {stop.orden}
                  </div>
                  
                  <div className="card-light card-light-hover p-3.5 sm:p-5 rounded-[18px] sm:rounded-[22px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-[#29008e] px-2.5 py-0.5 bg-[#29008e]/10 rounded-full">
                            Parada #{stop.orden}
                          </span>
                          <h4 className="font-bold text-[#111111] text-sm">{stop.nombre}</h4>
                          {esImportada && (
                            <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold flex items-center gap-0.5">
                              <FileSpreadsheet className="w-2.5 h-2.5 text-emerald-700" /> Excel
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#555555] mt-1">{stop.direccion}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 md:mt-0">
                        <div className="text-left md:text-right">
                          <div className="text-xs font-bold text-[#111111] flex items-center gap-1 justify-start md:justify-end">
                            <Clock className="w-3.5 h-3.5 text-[#29008e]" />
                            {stop.hora_reunion_recomendada}
                          </div>
                          <div className="text-[11px] text-[#888888]">
                            {stop.tiempo_conduccion_minutos} min de traslado ({stop.distancia_desde_anterior_km} km)
                          </div>
                        </div>

                        {onSelectSchoolForCRM && (
                          <button
                            onClick={() => onSelectSchoolForCRM(stop.universidad_id)}
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
                        <span className="font-bold text-[#111111]">{stop.director_nombre}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#555555]">
                        <Phone className="w-3.5 h-3.5 text-[#888888]" />
                        <a href={`tel:${stop.telefono}`} className="hover:text-[#29008e] font-medium text-[#0f094f]">
                          {stop.telefono}
                        </a>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#555555]">
                        <Award className="w-3.5 h-3.5 text-[#640354]" />
                        <span className="font-medium text-[#888888]">Lead Score:</span>
                        <span className="font-bold text-[#640354]">{stop.puntuacion_prioridad}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Punto de Retorno */}
            <div className="relative">
              <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full bg-[#0f094f] text-white flex items-center justify-center text-xs font-bold shadow-md">
                <FlagTriangleRight className="w-3.5 h-3.5 text-emerald-600 inline mr-1" />
              </div>
              <div className="bg-[#0f094f]/5 p-4 rounded-2xl border border-[#0f094f]/15 text-xs">
                <div className="font-bold text-[#0f094f]">Retorno a Sede Base: {recorridoActual.origen.nombre}</div>
                <div className="text-[#555555] text-[11px] mt-0.5">
                  Conclusión del circuito cerrado en CDMX. Todos los viáticos y minutas programadas quedan registrados en el CRM.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
