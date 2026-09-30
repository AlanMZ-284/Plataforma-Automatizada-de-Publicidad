/**
 * Componente Modal: Ingesta Inteligente de Universidades desde Excel y CSV
 * Cumple al 100% con la identidad visual oficial de Develop:
 * - Colores: Azul (#0f094f), Púrpura (#640354), Violeta (#29008e), Glow (#a78bfa), Pink (#f472b6)
 * - Zona drag-and-drop interactiva
 * - Selector de mapeo visual de columnas
 * - Vista previa con semáforo de validación (Verde, Amarillo, Rojo)
 * - 100% en español y máxima resiliencia operativa.
 */

import React, { useState, useRef, useId } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  X,
  SlidersHorizontal,
  Eye,
  Info,
  Building2,
  FileCheck
} from 'lucide-react';
import {
  leerArchivoExcelOCsv,
  procesarFilasConMapeo,
  ResultadoLecturaExcel,
  MapeoColumnas,
  CampoCanonico
} from '../../utils/lectorExcelUniversidades';
import { Universidad } from '../../types/base_datos';

interface PropiedadesModalImportarExcel {
  estaAbierto: boolean;
  alCerrar: () => void;
  alConfirmarImportacion: (universidadesImportadas: Universidad[]) => void;
}

// Opciones disponibles para el mapeo de columnas
const OPCIONES_CAMPOS_CANONICOS: { clave: CampoCanonico | 'datos_adicionales' | 'ignorar'; etiqueta: string }[] = [
  { clave: 'nombre', etiqueta: 'Nombre de la Institución (*Obligatorio)' },
  { clave: 'clave_cct', etiqueta: 'Clave CCT (SEP)' },
  { clave: 'tipo', etiqueta: 'Tipo de Institución' },
  { clave: 'estado', etiqueta: 'Estado / Entidad Federativa' },
  { clave: 'municipio', etiqueta: 'Municipio / Alcaldía' },
  { clave: 'direccion', etiqueta: 'Dirección Completa' },
  { clave: 'codigo_postal', etiqueta: 'Código Postal' },
  { clave: 'latitud', etiqueta: 'Latitud GPS' },
  { clave: 'longitud', etiqueta: 'Longitud GPS' },
  { clave: 'telefono', etiqueta: 'Teléfono de Contacto' },
  { clave: 'correo_electronico', etiqueta: 'Correo Electrónico' },
  { clave: 'sitio_web', etiqueta: 'Sitio Web Oficial' },
  { clave: 'director_nombre', etiqueta: 'Nombre del Director / Rector' },
  { clave: 'matricula_estudiantes', etiqueta: 'Matrícula Estudiantil' },
  { clave: 'colegiatura_mensual', etiqueta: 'Colegiatura Mensual (MXN)' },
  { clave: 'puntuacion_prioridad', etiqueta: 'Puntuación de Prioridad (0-100)' },
  { clave: 'estatus', etiqueta: 'Estatus Comercial' },
  { clave: 'modalidad_preferida', etiqueta: 'Modalidad Preferida (A o B)' },
  { clave: 'etiquetas', etiqueta: 'Etiquetas / Especialidades' },
  { clave: 'marcas_aliadas', etiqueta: 'Marcas Aliadas' },
  { clave: 'datos_adicionales', etiqueta: '📦 Datos Adicionales (JSONB)' },
  { clave: 'ignorar', etiqueta: '⛔ Ignorar esta columna' }
];

export const ModalImportarExcel: React.FC<PropiedadesModalImportarExcel> = ({
  estaAbierto,
  alCerrar,
  alConfirmarImportacion
}) => {
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [estaProcesando, setEstaProcesando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [resultadoLectura, setResultadoLectura] = useState<ResultadoLecturaExcel | null>(null);
  const [mapeoActual, setMapeoActual] = useState<MapeoColumnas>({});
  const [pestañaActiva, setPestañaActiva] = useState<'vista_previa' | 'mapeo_columnas'>('vista_previa');
  const [filtroSemaforo, setFiltroSemaforo] = useState<'todos' | 'valido' | 'con_advertencias' | 'invalido'>('todos');

  const entradaArchivoRef = useRef<HTMLInputElement>(null);
  const idEntradaArchivo = useId();

  if (!estaAbierto) return null;

  // Procesar archivo recibido (vía click o drag and drop)
  const procesarArchivo = async (archivo: File) => {
    setEstaProcesando(true);
    setMensajeError(null);

    const extension = archivo.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(extension || '')) {
      setMensajeError('Formato no soportado. Por favor sube un archivo con extensión .xlsx, .xls o .csv');
      setEstaProcesando(false);
      return;
    }

    try {
      const resultado = await leerArchivoExcelOCsv(archivo);
      setResultadoLectura(resultado);
      setMapeoActual(resultado.mapeoSugerido);
      setPestañaActiva('vista_previa');
    } catch (error) {
      const errorTexto = error instanceof Error ? error.message : 'Error desconocido al leer el archivo.';
      setMensajeError(errorTexto);
    } finally {
      setEstaProcesando(false);
    }
  };

  const manejarArrastrarSobre = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEstaArrastrando(true);
  };

  const manejarArrastrarFuera = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEstaArrastrando(false);
  };

  const manejarSoltar = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setEstaArrastrando(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      procesarArchivo(e.dataTransfer.files[0]);
    }
  };

  const manejarSeleccionManual = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      procesarArchivo(e.target.files[0]);
    }
  };

  // Actualizar el mapeo de una columna específica y recalcular vista previa en tiempo real
  const cambiarMapeoColumna = (columnaOriginal: string, nuevoDestino: CampoCanonico | 'datos_adicionales' | 'ignorar') => {
    if (!resultadoLectura) return;

    const nuevoMapeo: MapeoColumnas = {
      ...mapeoActual,
      [columnaOriginal]: nuevoDestino
    };

    setMapeoActual(nuevoMapeo);

    // Recalcular universidades procesadas
    const universidadesRecalculadas = procesarFilasConMapeo(resultadoLectura.filasCrudas, nuevoMapeo);

    const validas = universidadesRecalculadas.filter((u) => u.estadoValidacion === 'valido').length;
    const conAdvertencias = universidadesRecalculadas.filter((u) => u.estadoValidacion === 'con_advertencias').length;
    const invalidas = universidadesRecalculadas.filter((u) => u.estadoValidacion === 'invalido').length;

    setResultadoLectura({
      ...resultadoLectura,
      universidades: universidadesRecalculadas,
      resumen: {
        validas,
        conAdvertencias,
        invalidas
      }
    });
  };

  // Confirmar e importar instituciones válidas y con advertencias (excluyendo inválidas sin nombre)
  const manejarConfirmar = () => {
    if (!resultadoLectura) return;

    const institucionesAceptables = resultadoLectura.universidades
      .filter((u) => u.estadoValidacion !== 'invalido')
      .map((u) => u.datos);

    if (institucionesAceptables.length === 0) {
      setMensajeError('No hay instituciones válidas para importar. Revisa el mapeo de la columna "Nombre".');
      return;
    }

    alConfirmarImportacion(institucionesAceptables);
    alCerrar();
  };

  const universidadesFiltradas = resultadoLectura
    ? resultadoLectura.universidades.filter((u) => {
        if (filtroSemaforo === 'todos') return true;
        return u.estadoValidacion === filtroSemaforo;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#07052e]/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white w-full max-w-5xl rounded-[24px] shadow-develop-modal border border-white/20 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* ENCABEZADO MODAL CON GRADIENTE DEVELOP */}
        <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-gradient-to-r from-[#07052e] via-[#0f094f] to-[#12063b] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#640354] flex items-center justify-center shadow-develop-box border border-white/15">
              <FileSpreadsheet className="w-5 h-5 text-[#a78bfa]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
                  Ingesta Inteligente PAP
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#f472b6]"></span>
                <span className="text-[10px] text-white/60">Resiliencia 100%</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Importador de Universidades desde Excel / CSV
              </h2>
            </div>
          </div>

          <button
            onClick={alCerrar}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CUERPO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-[#F8F8FC]">

          {/* MENSAJE DE ERROR SI LO HUBIERA */}
          {mensajeError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs animate-shake">
              <XCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-medium">{mensajeError}</div>
              <button
                onClick={() => setMensajeError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* PASO 1: ZONA DRAG-AND-DROP (SI NO HAY ARCHIVO CARGADO O PARA REEMPLAZAR) */}
          {!resultadoLectura ? (
            <div
              onDragOver={manejarArrastrarSobre}
              onDragLeave={manejarArrastrarFuera}
              onDrop={manejarSoltar}
              onClick={() => entradaArchivoRef.current?.click()}
              className={`border-2 border-dashed rounded-[20px] p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-4 ${
                estaArrastrando
                  ? 'border-[#29008e] bg-[#29008e]/5 shadow-develop-glow scale-[0.99]'
                  : 'border-[#29008e]/30 bg-white hover:border-[#29008e] hover:bg-[#F8F8FC] shadow-sm'
              }`}
            >
              <input
                id={idEntradaArchivo}
                ref={entradaArchivoRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={manejarSeleccionManual}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0f094f] to-[#29008e] flex items-center justify-center shadow-develop-box text-white">
                {estaProcesando ? (
                  <RefreshCw className="w-8 h-8 animate-spin text-[#a78bfa]" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-[#a78bfa]" />
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  {estaProcesando
                    ? 'Procesando archivo y detectando sinónimos...'
                    : 'Arrastra tu archivo Excel (.xlsx, .xls) o CSV aquí'}
                </h3>
                <p className="text-xs text-[#555555] mt-1.5 max-w-md mx-auto">
                  El sistema analizará automáticamente las columnas, detectará sinónimos de nombres,
                  asignará valores seguros por defecto y empaquetará campos extra en datos adicionales.
                </p>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-semibold text-[#29008e] bg-[#29008e]/10 px-3 py-1 rounded-full border border-[#29008e]/20">
                  Explorar archivo en tu equipo
                </span>
              </div>
            </div>
          ) : (
            /* RESUMEN DEL ARCHIVO DETECTADO */
            <div className="space-y-4">
              <div className="card-light p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-l-4 border-l-[#29008e]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0f094f]/10 text-[#0f094f] flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5 text-[#29008e]" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#111111] flex items-center gap-2">
                      {resultadoLectura.nombreArchivo}
                      <span className="text-[10px] font-normal text-[#888888]">
                        ({(resultadoLectura.tamanoBytes / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <div className="text-xs text-[#555555]">
                      {resultadoLectura.totalFilas} filas detectadas • {resultadoLectura.columnasDetectadas.length} columnas en la hoja
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setResultadoLectura(null);
                      setMapeoActual({});
                    }}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-black/10 text-[#555555] hover:bg-black/5 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-[#29008e]" />
                    Cargar otro archivo
                  </button>
                </div>
              </div>

              {/* SEMÁFORO RESUMEN */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setFiltroSemaforo(filtroSemaforo === 'valido' ? 'todos' : 'valido')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    filtroSemaforo === 'valido'
                      ? 'ring-2 ring-emerald-500 bg-emerald-50/80 border-emerald-300'
                      : 'bg-white border-black/5 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completas y Válidas
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {resultadoLectura.resumen.validas}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#555555] mt-1">
                    Instituciones con nombre y datos completos verificados.
                  </p>
                </button>

                <button
                  onClick={() => setFiltroSemaforo(filtroSemaforo === 'con_advertencias' ? 'todos' : 'con_advertencias')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    filtroSemaforo === 'con_advertencias'
                      ? 'ring-2 ring-amber-500 bg-amber-50/80 border-amber-300'
                      : 'bg-white border-black/5 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Valores por Defecto
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      {resultadoLectura.resumen.conAdvertencias}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#555555] mt-1">
                    Campos opcionales faltantes resueltos automáticamente.
                  </p>
                </button>

                <button
                  onClick={() => setFiltroSemaforo(filtroSemaforo === 'invalido' ? 'todos' : 'invalido')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    filtroSemaforo === 'invalido'
                      ? 'ring-2 ring-rose-500 bg-rose-50/80 border-rose-300'
                      : 'bg-white border-black/5 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Filas Inválidas
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {resultadoLectura.resumen.invalidas}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#555555] mt-1">
                    Filas sin nombre de institución (se omitirán al importar).
                  </p>
                </button>
              </div>

              {/* PESTAÑAS: VISTA PREVIA VS CONFIGURACIÓN DE MAPEO */}
              <div className="flex items-center gap-2 border-b border-black/10 pt-2">
                <button
                  onClick={() => setPestañaActiva('vista_previa')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 ${
                    pestañaActiva === 'vista_previa'
                      ? 'bg-white text-[#0f094f] border-t-2 border-t-[#29008e] shadow-sm'
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vista Previa Interactiva ({universidadesFiltradas.length})
                </button>

                <button
                  onClick={() => setPestañaActiva('mapeo_columnas')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 ${
                    pestañaActiva === 'mapeo_columnas'
                      ? 'bg-white text-[#0f094f] border-t-2 border-t-[#29008e] shadow-sm'
                      : 'text-[#555555] hover:text-[#111111]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#640354]" />
                  Ajustar Mapeo de Columnas ({resultadoLectura.columnasDetectadas.length})
                </button>
              </div>

              {/* CONTENIDO DE PESTAÑA: VISTA PREVIA */}
              {pestañaActiva === 'vista_previa' && (
                <div className="card-light overflow-hidden">
                  <div className="overflow-x-auto max-h-[380px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#0f094f] text-white text-[11px] uppercase tracking-wider sticky top-0 z-10">
                        <tr>
                          <th className="py-2.5 px-3">Estado</th>
                          <th className="py-2.5 px-3">Institución Educativa</th>
                          <th className="py-2.5 px-3">Entidad / Municipio</th>
                          <th className="py-2.5 px-3">Matrícula</th>
                          <th className="py-2.5 px-3">Score</th>
                          <th className="py-2.5 px-3">Modalidad</th>
                          <th className="py-2.5 px-3">Director / Rector</th>
                          <th className="py-2.5 px-3">Datos Extra</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {universidadesFiltradas.map((item) => {
                          const datosExtra = (item.datos.datos_adicionales as Record<string, unknown>) || {};
                          const totalExtra = Object.keys(datosExtra).length;

                          return (
                            <tr
                              key={item.indiceFila}
                              className={`hover:bg-[#29008e]/5 transition-colors ${
                                item.estadoValidacion === 'invalido'
                                  ? 'bg-red-50/50'
                                  : item.estadoValidacion === 'con_advertencias'
                                  ? 'bg-amber-50/30'
                                  : 'bg-white'
                              }`}
                            >
                              {/* Semáforo */}
                              <td className="py-2 px-3 whitespace-nowrap">
                                {item.estadoValidacion === 'valido' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Válido
                                  </span>
                                )}
                                {item.estadoValidacion === 'con_advertencias' && (
                                  <span
                                    title={item.advertencias.map((a) => a.mensaje).join('\n')}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 cursor-help"
                                  >
                                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Default
                                  </span>
                                )}
                                {item.estadoValidacion === 'invalido' && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                    <XCircle className="w-3 h-3 text-rose-600" /> Inválido
                                  </span>
                                )}
                              </td>

                              {/* Nombre */}
                              <td className="py-2 px-3 font-semibold text-[#111111] max-w-xs truncate">
                                <div>{item.datos.nombre}</div>
                                {item.datos.clave_cct && (
                                  <div className="text-[10px] text-[#888888] font-mono">
                                    CCT: {item.datos.clave_cct}
                                  </div>
                                )}
                              </td>

                              {/* Estado / Municipio */}
                              <td className="py-2 px-3 text-[#555555] whitespace-nowrap">
                                {item.datos.municipio}, {item.datos.estado}
                              </td>

                              {/* Matrícula */}
                              <td className="py-2 px-3 font-medium text-[#111111] whitespace-nowrap">
                                {(item.datos.matricula_estudiantes ?? 0).toLocaleString('es-MX')}
                              </td>

                              {/* Score */}
                              <td className="py-2 px-3 whitespace-nowrap">
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#640354]/10 text-[#640354]">
                                  {item.datos.puntuacion_prioridad} pts
                                </span>
                              </td>

                              {/* Modalidad */}
                              <td className="py-2 px-3 whitespace-nowrap text-[11px] text-[#29008e] font-medium">
                                {item.datos.modalidad_preferida === 'modalidad_b_escuela'
                                  ? 'Modalidad B (Escuela)'
                                  : 'Modalidad A (Programa)'}
                              </td>

                              {/* Director */}
                              <td className="py-2 px-3 text-[#555555] max-w-[140px] truncate">
                                {item.datos.director_nombre}
                              </td>

                              {/* Datos Adicionales */}
                              <td className="py-2 px-3 whitespace-nowrap">
                                {totalExtra > 0 ? (
                                  <span
                                    title={Object.entries(datosExtra)
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join('\n')}
                                    className="text-[10px] font-semibold bg-[#0f094f]/10 text-[#0f094f] px-2 py-0.5 rounded cursor-help"
                                  >
                                    +{totalExtra} campos
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-[#888888]">Ninguno</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CONTENIDO DE PESTAÑA: CONFIGURACIÓN DE MAPEO VISUAL */}
              {pestañaActiva === 'mapeo_columnas' && (
                <div className="card-light p-4 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-[#555555] bg-[#29008e]/5 p-3 rounded-xl border border-[#29008e]/15">
                    <Info className="w-4 h-4 text-[#29008e] shrink-0" />
                    <span>
                      Verifica cómo se asocia cada columna de tu archivo con los campos del CRM. Las columnas
                      sin asignar se guardarán automáticamente dentro de <strong>datos_adicionales (JSONB)</strong>.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                    {resultadoLectura.columnasDetectadas.map((columna) => {
                      const asignacionActual = mapeoActual[columna] || 'datos_adicionales';

                      return (
                        <div
                          key={columna}
                          className="p-3 rounded-xl bg-white border border-black/10 flex flex-col justify-between gap-2 shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-[#0f094f] truncate" title={columna}>
                              Columna: &quot;{columna}&quot;
                            </span>
                            <span className="text-[10px] text-[#888888]">
                              Ejemplo: {String(resultadoLectura.filasCrudas[0]?.[columna] || 'Vacío')}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-[#29008e] shrink-0" />
                            <select
                              value={asignacionActual}
                              onChange={(e) =>
                                cambiarMapeoColumna(
                                  columna,
                                  e.target.value as CampoCanonico | 'datos_adicionales' | 'ignorar'
                                )
                              }
                              className="input-develop text-xs py-1.5 px-2.5 w-full bg-white font-medium"
                            >
                              {OPCIONES_CAMPOS_CANONICOS.map((opcion) => (
                                <option key={opcion.clave} value={opcion.clave}>
                                  {opcion.etiqueta}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PIE DEL MODAL CON ACCIONES */}
        <div className="px-6 py-4 border-t border-black/10 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#555555]">
            {resultadoLectura && (
              <span>
                Se importarán <strong>{resultadoLectura.resumen.validas + resultadoLectura.resumen.conAdvertencias}</strong> de{' '}
                <strong>{resultadoLectura.totalFilas}</strong> instituciones detectadas.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={alCerrar}
              className="btn-secondary-light text-xs px-4 py-2.5 rounded-xl w-full sm:w-auto font-semibold"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!resultadoLectura || (resultadoLectura.resumen.validas + resultadoLectura.resumen.conAdvertencias) === 0}
              onClick={manejarConfirmar}
              className={`text-xs px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all w-full sm:w-auto ${
                !resultadoLectura || (resultadoLectura.resumen.validas + resultadoLectura.resumen.conAdvertencias) === 0
                  ? 'bg-black/10 text-black/30 cursor-not-allowed'
                  : 'btn-primary-develop shadow-develop-glow'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#a78bfa]" />
              Importar a Cartera de Universidades
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
