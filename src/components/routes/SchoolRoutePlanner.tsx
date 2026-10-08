import React, { useState, useMemo, useEffect } from 'react';
import { Company } from '../../types';
import {
  resolverCircuitoOptimoTsp,
  generarEnlaceGoogleMaps,
  PUNTOS_ORIGEN_CDMX,
  RecorridoOptimizado
} from '../../utils/optimizadorRutas';
import { 
  guardarRecorridoRuta, 
  ResultadoGuardadoRecorrido,
  obtenerRecorridosGuardados 
} from '../../services/servicioCrm';
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
  FlagTriangleRight,
  QrCode,
  History,
  RotateCcw,
  X,
  User,
  DollarSign,
  Layers,
  Info
} from 'lucide-react';

interface SchoolRoutePlannerProps {
  schools: Company[];
  onSelectSchoolForCRM?: (schoolId: string) => void;
  onLogRouteToCRM?: (trip: any, fechaGira?: string, asesor?: string) => void;
  escuelaPreseleccionadaId?: string | null;
  fechaPreseleccionada?: string;
  asesorPreseleccionado?: string;
  onLimpiarEscuelaPreseleccionada?: () => void;
  onAbrirStandQr?: (schoolId: string) => void;
  escuelasPreseleccionadasIds?: string[] | null;
  tituloGiraPreseleccionada?: string;
}

export const SchoolRoutePlanner: React.FC<SchoolRoutePlannerProps> = ({
  schools,
  onSelectSchoolForCRM,
  onLogRouteToCRM,
  escuelaPreseleccionadaId,
  fechaPreseleccionada,
  asesorPreseleccionado,
  onLimpiarEscuelaPreseleccionada,
  onAbrirStandQr,
  escuelasPreseleccionadasIds,
  tituloGiraPreseleccionada
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

  // Historial de Giras Comerciales Agendadas en el CRM
  const [girasGuardadas, setGirasGuardadas] = useState<any[]>([]);
  const [cargandoGirasGuardadas, setCargandoGirasGuardadas] = useState<boolean>(false);
  const [giraModalSeleccionada, setGiraModalSeleccionada] = useState<any | null>(null);

  const cargarGirasGuardadas = async () => {
    setCargandoGirasGuardadas(true);
    try {
      const recorridos = await obtenerRecorridosGuardados();
      setGirasGuardadas(recorridos || []);
    } catch (e) {
      console.warn('Error cargando giras agendadas previas:', e);
    } finally {
      setCargandoGirasGuardadas(false);
    }
  };

  useEffect(() => {
    cargarGirasGuardadas();
  }, []);

  const handleRecargarGira = (gira: any) => {
    const paradas: any[] = gira.paradas || gira.datos_adicionales?.paradas || [];
    const idsEscuelas = paradas
      .map((p: any) => p.universidad_id || p.schoolId)
      .filter(Boolean);

    if (idsEscuelas.length > 0) {
      setSelectedSchoolIds(idsEscuelas);
      const escuelasObjetivo = schools.filter((s) => idsEscuelas.includes(s.id));
      if (escuelasObjetivo.length > 0) {
        const origenActual = PUNTOS_ORIGEN_CDMX[selectedOriginIndex] || PUNTOS_ORIGEN_CDMX[0];
        const nuevo = resolverCircuitoOptimoTsp(origenActual, escuelasObjetivo, filterState);
        setRecorridoActual(nuevo);
        if (gira.fecha_gira || gira.fecha_inicio) {
          setFechaGira(gira.fecha_gira || gira.fecha_inicio);
        }
        if (gira.asesor_responsable) {
          setAsesorResponsable(gira.asesor_responsable);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Escuela preseleccionada desde el CRM (para visitas individuales o cuando solo hay 1 escuela)
  const escuelaPreseleccionada = useMemo(() => {
    if (escuelaPreseleccionadaId) {
      return schools.find((s) => s.id === escuelaPreseleccionadaId) || null;
    }
    if (escuelasPreseleccionadasIds && escuelasPreseleccionadasIds.length === 1) {
      return schools.find((s) => s.id === escuelasPreseleccionadasIds[0]) || null;
    }
    return null;
  }, [escuelaPreseleccionadaId, escuelasPreseleccionadasIds, schools]);

  // Efecto reactivo de precarga automática para gira multisede o campus individual
  useEffect(() => {
    // Caso 1: Gira comercial multisede (arreglo de IDs proporcionado y con elementos)
    if (escuelasPreseleccionadasIds && escuelasPreseleccionadasIds.length > 0) {
      const escuelasGira = schools.filter((s) => escuelasPreseleccionadasIds.includes(s.id));
      if (escuelasGira.length > 0) {
        // a) Establece selección de las escuelas de la gira
        setSelectedSchoolIds(escuelasGira.map((s) => s.id));

        // b) Detecta la región geográfica de la gira
        const todasCdmx = escuelasGira.every((s) => s.state === 'CDMX');
        const todasEdomex = escuelasGira.every((s) => s.state === 'Estado de México');
        const regionGira = todasCdmx ? 'CDMX' : todasEdomex ? 'Estado de México' : 'Todas';
        setFilterState(regionGira);

        // c) Si se proporciona fechaPreseleccionada, actualiza setFechaGira
        if (fechaPreseleccionada) {
          setFechaGira(fechaPreseleccionada);
        }

        // d) Si se proporciona asesorPreseleccionado, actualiza setAsesorResponsable
        if (asesorPreseleccionado) {
          setAsesorResponsable(asesorPreseleccionado);
        }

        // e) Ejecuta resolverCircuitoOptimoTsp con el origen base CDMX y todas las escuelas de la gira juntas
        const origenActual = PUNTOS_ORIGEN_CDMX[selectedOriginIndex] || PUNTOS_ORIGEN_CDMX[0];
        const nuevoRecorrido = resolverCircuitoOptimoTsp(
          origenActual,
          escuelasGira,
          regionGira
        );
        setRecorridoActual(nuevoRecorrido);

        // f) Limpia cualquier resultadoGuardado previo
        setResultadoGuardado(null);
        return;
      }
    }

    // Caso 2: Campus individual agendado
    if (escuelaPreseleccionadaId) {
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
    }
  }, [
    escuelasPreseleccionadasIds,
    escuelaPreseleccionadaId,
    schools,
    fechaPreseleccionada,
    asesorPreseleccionado,
    selectedOriginIndex
  ]);

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

      // 2. Refrescar lista de giras agendadas en la interfaz
      await cargarGirasGuardadas();

      // 3. Notificar al manejador de la aplicación principal para reactividad instantánea
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

      {/* BANNER VISUAL DE CAMPUS O GIRA AGENDADA */}
      {((escuelasPreseleccionadasIds && escuelasPreseleccionadasIds.length > 0) || escuelaPreseleccionadaId) && (
        <div className="bg-[#0f094f]/5 border border-[#29008e]/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          {escuelasPreseleccionadasIds && escuelasPreseleccionadasIds.length > 1 ? (
            /* CASO GIRA MULTISEDE */
            <>
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0f094f] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Navigation className="w-5 h-5 text-[#a78bfa]" />
                </div>
                <div>
                  <span className="text-[#29008e] font-bold uppercase tracking-wider text-[10px] block">
                    GIRA COMERCIAL MULTISEDE AGENDADA
                  </span>
                  <h2 className="font-bold text-sm text-[#111111]">
                    {tituloGiraPreseleccionada || `${escuelasPreseleccionadasIds.length} Campus Universitarios Agendados`}
                  </h2>
                  <p className="text-xs text-[#555555] mt-0.5">
                    Circuito cerrado optimizado mediante algoritmo 2-Opt TSP con paradas coordinadas y viáticos unificados para la jornada.
                  </p>
                </div>
              </div>

              {onLimpiarEscuelaPreseleccionada && (
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={onLimpiarEscuelaPreseleccionada}
                    className="px-3.5 py-2 text-xs font-bold text-[#0f094f] bg-white border border-[#29008e]/20 rounded-xl hover:bg-[#0f094f]/5 transition-colors cursor-pointer"
                  >
                    Ver todas las sedes
                  </button>
                </div>
              )}
            </>
          ) : (
            /* CASO CAMPUS INDIVIDUAL */
            <>
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

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                {onAbrirStandQr && escuelaPreseleccionada && (
                  <button
                    type="button"
                    onClick={() => onAbrirStandQr(escuelaPreseleccionada.id)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#640354] to-[#29008e] hover:brightness-110 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Abrir formulario o stand de registro QR para estudiantes"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Abrir Stand QR</span>
                  </button>
                )}
                {onLimpiarEscuelaPreseleccionada && (
                  <button
                    type="button"
                    onClick={onLimpiarEscuelaPreseleccionada}
                    className="px-3.5 py-2 text-xs font-bold text-[#0f094f] bg-white border border-[#29008e]/20 rounded-xl hover:bg-[#0f094f]/5 transition-colors cursor-pointer"
                  >
                    Ver todas las sedes
                  </button>
                )}
              </div>
            </>
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
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar campus o municipio..."
                className="input-develop input-develop-con-icono w-full pr-4 text-xs text-[#111111]"
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

                        {onAbrirStandQr && (
                          <button
                            type="button"
                            onClick={() => onAbrirStandQr(stop.universidad_id)}
                            className="px-3 py-1.5 rounded-xl bg-[#640354]/10 hover:bg-[#640354]/15 text-[#640354] border border-[#640354]/20 text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                            title="Desplegar stand digital QR de esta sede"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#640354]" />
                            Stand QR
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

      {/* SECCIÓN: HISTORIAL DE GIRAS COMERCIALES AGENDADAS EN EL CRM */}
      <div className="card-light p-5 sm:p-7 rounded-[24px] space-y-5 border border-black/5 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f094f]/5 text-[#0f094f] flex items-center justify-center font-bold shrink-0">
              <History className="w-5 h-5 text-[#29008e]" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#a78bfa]">
                Develop Logistics · Control Operativo
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#111111]">
                Giras Comerciales Programadas ({girasGuardadas.length})
              </h3>
              <p className="text-xs text-[#555555]">
                Historial de circuitos de visita agendados en el CRM con itinerario, viáticos autorizados y enlace de navegación.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cargarGirasGuardadas}
            disabled={cargandoGirasGuardadas}
            className="btn-secondary-light text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-xs cursor-pointer"
            title="Refrescar lista de giras agendadas"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#29008e] ${cargandoGirasGuardadas ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {cargandoGirasGuardadas ? (
          <div className="py-8 text-center text-xs text-[#888888]">
            Consultando giras agendadas en la base de datos...
          </div>
        ) : girasGuardadas.length === 0 ? (
          <div className="card-light p-6 text-center rounded-2xl border border-black/5 space-y-2">
            <Calendar className="w-8 h-8 text-[#888888] mx-auto opacity-50" />
            <div className="font-bold text-xs text-[#111111]">Aún no hay giras guardadas en la agenda</div>
            <p className="text-xs text-[#666666] max-w-md mx-auto">
              Selecciona sedes universitarias arriba, pulsa <strong className="text-[#0f094f]">«Calcular Circuito Óptimo TSP»</strong> y posteriormente <strong className="text-[#0f094f]">«Guardar en Agenda CRM»</strong> para registrar tu primer circuito de visitas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {girasGuardadas.map((gira, index) => {
              const fechaTexto = gira.fecha_gira || gira.fecha_inicio || (gira.creado_en ? gira.creado_en.split('T')[0] : 'Fecha no especificada');
              const paradas: any[] = gira.paradas || gira.datos_adicionales?.paradas || [];
              const viaticosTotal = gira.total_viaticos_mxn || gira.viaticos?.total_viaticos_mxn || 0;
              const ganancia = gira.porcentaje_ganancia_eficiencia || 0;
              const km = gira.distancia_total_km || 0;
              const linkMaps = gira.enlace_google_maps || '';
              const asesor = gira.asesor_responsable || 'Carlos Mendoza';
              const tituloGira = gira.titulo || `Gira Multisede (${paradas.length} paradas)`;

              return (
                <div
                  key={gira.id || index}
                  onClick={() => setGiraModalSeleccionada(gira)}
                  className="card-light card-light-hover p-4 sm:p-5 rounded-2xl border border-black/5 flex flex-col justify-between space-y-3.5 cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#0f094f]/10 text-[#0f094f]">
                        {fechaTexto}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Agendada en CRM
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[#111111] leading-snug">
                      {tituloGira}
                    </h4>

                    <div className="text-xs text-[#555555] flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-[#888888]">Asesor:</span>
                      <span>{asesor}</span>
                      <span className="text-[#cccccc]">·</span>
                      <span className="font-semibold text-[#888888]">Paradas:</span>
                      <span>{paradas.length} sedes</span>
                    </div>

                    {/* Chips de sedes incluidas */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {paradas.slice(0, 4).map((p: any, pIdx: number) => (
                        <span
                          key={pIdx}
                          className="text-[10px] px-2 py-0.5 bg-black/5 text-[#444444] rounded-md font-medium truncate max-w-[180px]"
                          title={p.nombre || p.name}
                        >
                          {p.orden ? `${p.orden}. ` : ''}{p.nombre || p.name || 'Campus'}
                        </span>
                      ))}
                      {paradas.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 text-[#888888] font-bold">
                          +{paradas.length - 4} más
                        </span>
                      )}
                    </div>

                    {/* Métricas compactas */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5 text-center">
                      <div className="p-1.5 bg-[#F8F8FC] rounded-xl">
                        <div className="text-[9px] font-bold text-[#888888] uppercase">Distancia</div>
                        <div className="text-xs font-bold text-[#111111]">{km} km</div>
                      </div>
                      <div className="p-1.5 bg-[#F8F8FC] rounded-xl">
                        <div className="text-[9px] font-bold text-[#888888] uppercase">Viáticos</div>
                        <div className="text-xs font-bold text-[#29008e]">${Number(viaticosTotal).toLocaleString('es-MX')}</div>
                      </div>
                      <div className="p-1.5 bg-[#F8F8FC] rounded-xl">
                        <div className="text-[9px] font-bold text-[#888888] uppercase">Eficiencia</div>
                        <div className="text-xs font-bold text-emerald-700">+{ganancia}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de la gira */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGiraModalSeleccionada(gira);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#29008e]/10 hover:bg-[#29008e]/15 text-[#29008e] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Ver itinerario de paradas y desglose de viáticos"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#29008e]" />
                        <span>Ver Desglose</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecargarGira(gira);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#0f094f]/5 hover:bg-[#0f094f]/10 text-[#0f094f] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Cargar esta gira en el mapa interactivo TSP"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#0f094f]" />
                        <span className="hidden sm:inline">Recargar</span>
                      </button>
                    </div>

                    {linkMaps && (
                      <a
                        href={linkMaps}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#29008e] to-[#640354] hover:brightness-110 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                        title="Abrir recorrido completo en Google Maps"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                        <span>Maps</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL DE EXPEDIENTE COMPLETO DE GIRA COMERCIAL                 */}
      {/* ============================================================== */}
      {giraModalSeleccionada && (() => {
        const gira = giraModalSeleccionada;
        const fechaTexto = gira.fecha_gira || gira.fecha_inicio || (gira.creado_en ? gira.creado_en.split('T')[0] : 'Fecha no especificada');
        const paradas: any[] = gira.paradas || gira.datos_adicionales?.paradas || [];
        const viaticosTotal = gira.total_viaticos_mxn || gira.viaticos?.total_viaticos_mxn || 0;
        const gasolina = gira.presupuesto_gasolina_mxn || gira.viaticos?.gasolina_mxn || 0;
        const casetas = gira.presupuesto_casetas_mxn || gira.viaticos?.casetas_mxn || 0;
        const alimentos = gira.presupuesto_alimentos_mxn || gira.viaticos?.alimentos_mxn || 0;
        const ganancia = gira.porcentaje_ganancia_eficiencia || 0;
        const km = gira.distancia_total_km || 0;
        const linkMaps = gira.enlace_google_maps || '';
        const asesor = gira.asesor_responsable || 'Carlos Mendoza';
        const tituloGira = gira.titulo || `Gira Multisede (${paradas.length} paradas)`;
        const origen = gira.origen_nombre || 'Corporativo Develop CDMX';

        return (
          <div className="fixed inset-0 z-50 bg-[#07052e]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
            {/* Backdrop interactivo */}
            <div
              className="fixed inset-0 cursor-pointer"
              onClick={() => setGiraModalSeleccionada(null)}
            />

            {/* Tarjeta Central del Modal */}
            <div className="relative z-10 bg-white rounded-[28px] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-develop-modal border border-black/10 animate-scaleUp">
              {/* Cabecera Dark Premium */}
              <div className="premium-dark-surface p-5 sm:p-6 text-white border-b border-white/10 relative shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa]">
                        LOGÍSTICA · EXPEDIENTE DE GIRA COMERCIAL
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {fechaTexto}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug break-words">
                      {tituloGira}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/70">
                      Asesor: <strong className="text-white">{asesor}</strong> · Origen: {origen}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGiraModalSeleccionada(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                    title="Cerrar expediente"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cuerpo con Scroll */}
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto bg-white flex-1">
                {/* Desglose Financiero de Viáticos Autorizados */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-[#29008e]" />
                      <span>Desglose Financiero de Viáticos Autorizados</span>
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Eficiencia Algorítmica: +{ganancia}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="card-light p-3 rounded-2xl border border-black/5 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                        <Fuel className="w-3 h-3 text-[#29008e]" />
                        <span>Gasolina</span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[#111111]">
                        ${Number(gasolina).toLocaleString('es-MX')}
                      </div>
                      <span className="text-[9px] text-[#888888] block">Estimación de combustible</span>
                    </div>

                    <div className="card-light p-3 rounded-2xl border border-black/5 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                        <Car className="w-3 h-3 text-[#640354]" />
                        <span>Casetas / Peaje</span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[#111111]">
                        ${Number(casetas).toLocaleString('es-MX')}
                      </div>
                      <span className="text-[9px] text-[#888888] block">Autopistas y libramientos</span>
                    </div>

                    <div className="card-light p-3 rounded-2xl border border-black/5 space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                        <Utensils className="w-3 h-3 text-amber-600" />
                        <span>Alimentos</span>
                      </div>
                      <div className="text-sm sm:text-base font-extrabold text-[#111111]">
                        ${Number(alimentos).toLocaleString('es-MX')}
                      </div>
                      <span className="text-[9px] text-[#888888] block">Cuota diaria en campo</span>
                    </div>

                    <div className="card-light p-3 rounded-2xl border border-[#29008e]/20 bg-[#29008e]/[0.03] space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-[#29008e] uppercase tracking-wider">
                        <DollarSign className="w-3 h-3 text-[#29008e]" />
                        <span>Total Viáticos</span>
                      </div>
                      <div className="text-sm sm:text-base font-black text-[#29008e]">
                        ${Number(viaticosTotal).toLocaleString('es-MX')}
                      </div>
                      <span className="text-[9px] text-[#29008e]/80 font-semibold block">Presupuesto autorizado</span>
                    </div>
                  </div>
                </div>

                {/* Resumen de Movilidad */}
                <div className="p-3.5 bg-[#F8F8FC] rounded-2xl border border-black/5 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">Distancia Total</span>
                    <span className="font-bold text-[#111111]">{km} kilómetros</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">Sedes a Visitar</span>
                    <span className="font-bold text-[#111111]">{paradas.length} campus universitarios</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">Horario Estimado</span>
                    <span className="font-bold text-[#0f094f]">Jornada de 09:00 a 16:30 hrs</span>
                  </div>
                </div>

                {/* Itinerario de Paradas Ordenadas */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#29008e]" />
                    <span>Itinerario Cronológico de Visita ({paradas.length} Sedes)</span>
                  </h4>

                  <div className="space-y-2">
                    {paradas.map((parada: any, idx: number) => {
                      const nombre = parada.nombre || parada.name || 'Campus Universitario';
                      const hora = parada.hora_reunion_recomendada || parada.recommendedMeetingHour || '09:00 hrs';
                      const director = parada.director_nombre || parada.directorName || 'Director(a) de Vinculación';
                      const telefono = parada.director_telefono || parada.phone || '';
                      const escuelaId = parada.universidad_id || parada.schoolId;

                      return (
                        <div
                          key={idx}
                          className="p-3.5 bg-[#F8F8FC] hover:bg-white rounded-2xl border border-black/5 hover:border-black/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#0f094f] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-bold text-[#111111] truncate">
                                  {nombre}
                                </h5>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#29008e]/10 text-[#29008e]">
                                  Llegada: {hora}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#555555]">
                                Cita con: <strong>{director}</strong> {telefono ? `· Tel: ${telefono}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {onSelectSchoolForCRM && escuelaId && (
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectSchoolForCRM(escuelaId);
                                  setGiraModalSeleccionada(null);
                                }}
                                className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#0f094f] hover:bg-black/5 transition-colors border border-black/10 cursor-pointer"
                                title="Abrir expediente de la escuela en el CRM"
                              >
                                Expediente 360°
                              </button>
                            )}

                            {onAbrirStandQr && escuelaId && (
                              <button
                                type="button"
                                onClick={() => {
                                  onAbrirStandQr(escuelaId);
                                  setGiraModalSeleccionada(null);
                                }}
                                className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-[#640354] bg-[#640354]/10 hover:bg-[#640354]/15 transition-colors border border-[#640354]/20 flex items-center gap-1 cursor-pointer"
                                title="Abrir módulo de registro QR de alumnos en stand"
                              >
                                <QrCode className="w-3 h-3 text-[#640354]" />
                                <span>Stand QR</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pie de Acciones */}
              <div className="p-4 sm:p-5 bg-[#F8F8FC] border-t border-black/5 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    handleRecargarGira(gira);
                    setGiraModalSeleccionada(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#0f094f]/5 hover:bg-[#0f094f]/10 text-[#0f094f] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#29008e]" />
                  <span>Recargar en Mapa TSP</span>
                </button>

                <div className="flex items-center gap-2">
                  {linkMaps && (
                    <a
                      href={linkMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#29008e] to-[#640354] hover:brightness-110 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                      title="Navegar ruta en Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                      <span>Abrir en Google Maps</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setGiraModalSeleccionada(null)}
                    className="btn-secondary-develop px-4 py-2 text-xs font-bold cursor-pointer"
                  >
                    Cerrar Expediente
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
