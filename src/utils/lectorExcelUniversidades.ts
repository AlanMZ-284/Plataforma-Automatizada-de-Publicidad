/**
 * Módulo de Ingesta Inteligente y Resiliente de Universidades para PAP (Develop).
 * Permite leer y normalizar archivos Excel (.xlsx, .xls) y CSV con sinónimos automáticos,
 * empaquetado de datos adicionales no contemplados y asignación de valores por defecto seguros.
 * 
 * Regla: 100% en español, máxima resiliencia ante columnas faltantes o heterogéneas.
 */

import * as XLSX from 'xlsx';
import {
  TipoInstitucion,
  EstatusUniversidad,
  ModalidadProyecto,
  Universidad
} from '../types/base_datos';
import { Company } from '../types';

// ============================================================================
// TIPOS E INTERFACES DEL INGESTOR
// ============================================================================

export type CampoCanonico =
  | 'clave_cct'
  | 'nombre'
  | 'tipo'
  | 'estado'
  | 'municipio'
  | 'direccion'
  | 'codigo_postal'
  | 'latitud'
  | 'longitud'
  | 'telefono'
  | 'correo_electronico'
  | 'sitio_web'
  | 'director_nombre'
  | 'matricula_estudiantes'
  | 'colegiatura_mensual'
  | 'puntuacion_prioridad'
  | 'estatus'
  | 'modalidad_preferida'
  | 'etiquetas'
  | 'marcas_aliadas';

export type EstadoValidacionFila = 'valido' | 'con_advertencias' | 'invalido';

export interface AdvertenciaFila {
  campo: string;
  mensaje: string;
}

export interface UniversidadNormalizada {
  indiceFila: number;
  estadoValidacion: EstadoValidacionFila;
  advertencias: AdvertenciaFila[];
  datos: Universidad;
  datosOriginales: Record<string, unknown>;
}

export interface MapeoColumnas {
  [columnaArchivo: string]: CampoCanonico | 'ignorar' | 'datos_adicionales';
}

export interface ResultadoLecturaExcel {
  nombreArchivo: string;
  tamanoBytes: number;
  totalFilas: number;
  columnasDetectadas: string[];
  mapeoSugerido: MapeoColumnas;
  filasCrudas: Record<string, unknown>[];
  universidades: UniversidadNormalizada[];
  resumen: {
    validas: number;
    conAdvertencias: number;
    invalidas: number;
  };
}

// ============================================================================
// DICCIONARIO DE SINÓNIMOS DE COLUMNAS
// ============================================================================

const DICCIONARIO_SINONIMOS: Record<CampoCanonico, string[]> = {
  nombre: [
    'nombre', 'universidad', 'escuela', 'institucion', 'plantel', 'campus',
    'institucion educativa', 'nombre institucion', 'nombre escuela',
    'nombre de la escuela', 'nombre de la institucion', 'colegio', 'sede',
    'facultad', 'centro educativo', 'name', 'school', 'university'
  ],
  clave_cct: [
    'clave_cct', 'clave cct', 'cct', 'clave', 'clave escolar',
    'clave de centro de trabajo', 'clave sep', 'codigo cct', 'cct sep'
  ],
  tipo: [
    'tipo', 'tipo institucion', 'tipo universidad', 'tipo escuela',
    'categoria', 'nivel', 'nivel educativo', 'subsistema', 'sector'
  ],
  estado: [
    'estado', 'entidad', 'entidad federativa', 'region', 'provincia',
    'estado / provincia', 'state'
  ],
  municipio: [
    'municipio', 'alcaldia', 'municipio o alcaldia', 'municipio / alcaldia',
    'ciudad', 'localidad', 'demarcacion', 'city', 'municipality'
  ],
  direccion: [
    'direccion', 'domicilio', 'ubicacion', 'calle', 'calle y numero',
    'direccion completa', 'domicilio oficial', 'address'
  ],
  codigo_postal: [
    'codigo_postal', 'codigo postal', 'cp', 'c.p.', 'c p', 'codigo_post',
    'zip', 'postal code'
  ],
  latitud: [
    'latitud', 'lat', 'coord latitud', 'coordenada latitud', 'latitude', 'y'
  ],
  longitud: [
    'longitud', 'lng', 'lon', 'coord longitud', 'coordenada longitud', 'longitude', 'x'
  ],
  telefono: [
    'telefono', 'tel', 'telefono contacto', 'telefono institucional',
    'tel.', 'celular', 'movil', 'conmutador', 'phone'
  ],
  correo_electronico: [
    'correo_electronico', 'correo', 'correo electronico', 'email', 'e-mail',
    'mail', 'correo vinculacion', 'correo institucional', 'contacto correo'
  ],
  sitio_web: [
    'sitio_web', 'sitio web', 'pagina web', 'web', 'url', 'portal',
    'portal web', 'link', 'website'
  ],
  director_nombre: [
    'director_nombre', 'director', 'nombre director', 'nombre del director',
    'rector', 'nombre rector', 'rectora', 'directora', 'titular',
    'responsable', 'autoridad', 'directorName'
  ],
  matricula_estudiantes: [
    'matricula_estudiantes', 'matricula', 'matricula estudiantes', 'estudiantes',
    'alumnos', 'total alumnos', 'total estudiantes', 'poblacion estudiantil',
    'alumnado', 'studentCount'
  ],
  colegiatura_mensual: [
    'colegiatura_mensual', 'colegiatura', 'colegiatura mensual', 'costo mensual',
    'cuota', 'precio', 'arancel', 'monthlyTuition', 'pago mensual'
  ],
  puntuacion_prioridad: [
    'puntuacion_prioridad', 'puntuacion', 'puntuacion prioridad', 'prioridad',
    'lead score', 'score', 'calificacion', 'puntaje', 'ranking'
  ],
  estatus: [
    'estatus', 'estado comercial', 'situacion', 'etapa', 'fase', 'status'
  ],
  modalidad_preferida: [
    'modalidad_preferida', 'modalidad', 'modalidad preferida', 'modalidad proyecto',
    'modalidad predilecta', 'tipo proyecto', 'modalidad comercial'
  ],
  etiquetas: [
    'etiquetas', 'tags', 'palabras clave', 'intereses', 'carreras clave', 'especialidades'
  ],
  marcas_aliadas: [
    'marcas_aliadas', 'marcas aliadas', 'alianzas', 'marcas', 'patrocinadores',
    'empresas aliadas', 'convenios', 'alliedBrands'
  ]
};

// Coordenadas de contingencia central en CDMX (Zócalo / Valle de México)
const LATITUD_PREDETERMINADA = 19.4326;
const LONGITUD_PREDETERMINADA = -99.1332;

// ============================================================================
// FUNCIONES DE NORMALIZACIÓN Y AYUDA
// ============================================================================

/**
 * Limpia un texto eliminando tildes, signos y normalizando espacios a minúsculas.
 */
export function normalizarTexto(texto: string): string {
  if (!texto) return '';
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]/g, ' ')       // Solo caracteres alfanuméricos
    .trim()
    .replace(/\s+/g, ' ');           // Espacios simples
}

/**
 * Determina cuál campo canónico coincide mejor con el encabezado detectado.
 */
export function detectarCampoCanonico(encabezado: string): CampoCanonico | null {
  const encabezadoLimpio = normalizarTexto(encabezado);
  if (!encabezadoLimpio) return null;

  for (const [campo, sinonimos] of Object.entries(DICCIONARIO_SINONIMOS)) {
    for (const sinonimo of sinonimos) {
      const sinonimoLimpio = normalizarTexto(sinonimo);
      if (
        encabezadoLimpio === sinonimoLimpio ||
        encabezadoLimpio.startsWith(sinonimoLimpio + ' ') ||
        encabezadoLimpio.endsWith(' ' + sinonimoLimpio)
      ) {
        return campo as CampoCanonico;
      }
    }
  }

  return null;
}

/**
 * Limpia y convierte un valor a número seguro. Si no es número, retorna el valor por defecto.
 */
function limpiarNumero(valor: unknown, valorPorDefecto: number): number {
  if (valor === null || valor === undefined || valor === '') return valorPorDefecto;
  if (typeof valor === 'number') return isNaN(valor) ? valorPorDefecto : valor;
  const texto = String(valor).replace(/[^0-9.-]/g, '');
  const parseado = parseFloat(texto);
  return isNaN(parseado) ? valorPorDefecto : parseado;
}

/**
 * Normaliza el tipo de institución según el enum oficial.
 */
function normalizarTipoInstitucion(valor: unknown): TipoInstitucion {
  const texto = normalizarTexto(String(valor || ''));
  if (texto.includes('tecnologico') && texto.includes('universidad')) return 'universidad_tecnologica';
  if (texto.includes('tecnologico') || texto.includes('itt') || texto.includes('tese')) return 'instituto_tecnologico';
  if (texto.includes('colegio')) return 'colegio';
  if (texto.includes('empresa')) return 'empresa_asociada';
  return 'universidad';
}

/**
 * Normaliza el estatus comercial según el enum oficial.
 */
function normalizarEstatus(valor: unknown): EstatusUniversidad {
  const texto = normalizarTexto(String(valor || ''));
  if (texto.includes('activo') || texto.includes('firmado') || texto.includes('cliente')) return 'cliente_activo';
  if (texto.includes('seguimiento') || texto.includes('proceso') || texto.includes('contacto')) return 'en_seguimiento';
  if (texto.includes('inactivo') || texto.includes('baja') || texto.includes('descartado')) return 'inactivo';
  return 'prospecto';
}

/**
 * Normaliza la modalidad del proyecto (Modalidad A o Modalidad B).
 */
function normalizarModalidad(valor: unknown): ModalidadProyecto {
  const texto = normalizarTexto(String(valor || ''));
  if (texto.includes('escuela') || texto.includes('modalidad b') || texto.includes('presencia')) {
    return 'modalidad_b_escuela';
  }
  return 'modalidad_a_programa';
}

/**
 * Convierte un campo de texto con comas o saltos de línea a lista de etiquetas.
 */
function normalizarLista(valor: unknown): string[] {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor.map((item) => String(item).trim()).filter(Boolean);
  return String(valor)
    .split(/[,;\n|]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

// ============================================================================
// FUNCIÓN PRINCIPAL DE LECTURA DE ARCHIVOS EXCEL Y CSV
// ============================================================================

/**
 * Lee un archivo binario (.xlsx, .xls, .csv) y produce el resultado listo para visualización y mapeo.
 */
export async function leerArchivoExcelOCsv(archivo: File): Promise<ResultadoLecturaExcel> {
  const buferArray = await archivo.arrayBuffer();
  const libro = XLSX.read(buferArray, {
    type: 'array',
    cellDates: true,
    cellNF: false,
    cellText: false
  });

  if (!libro.SheetNames || libro.SheetNames.length === 0) {
    throw new Error('El archivo seleccionado no contiene hojas de cálculo con datos.');
  }

  const primeraHojaNombre = libro.SheetNames[0];
  const hoja = libro.Sheets[primeraHojaNombre];

  // Convertir hoja a matriz de objetos con encabezados de la primera fila
  const filasCrudas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, {
    defval: '',
    blankrows: false
  });

  if (filasCrudas.length === 0) {
    throw new Error('La hoja de cálculo está vacía o no contiene filas con datos válidos.');
  }

  // Detectar todas las columnas únicas del archivo
  const conjuntoColumnas = new Set<string>();
  filasCrudas.forEach((fila) => {
    Object.keys(fila).forEach((columna) => {
      const colLimpia = columna.trim();
      if (colLimpia) conjuntoColumnas.add(colLimpia);
    });
  });

  const columnasDetectadas = Array.from(conjuntoColumnas);

  // Generar mapeo sugerido automático
  const mapeoSugerido: MapeoColumnas = {};
  const camposAsignados = new Set<CampoCanonico>();

  columnasDetectadas.forEach((columna) => {
    const campoDetectado = detectarCampoCanonico(columna);
    if (campoDetectado && !camposAsignados.has(campoDetectado)) {
      mapeoSugerido[columna] = campoDetectado;
      camposAsignados.add(campoDetectado);
    } else {
      mapeoSugerido[columna] = 'datos_adicionales';
    }
  });

  // Procesar las filas con el mapeo sugerido
  const universidades = procesarFilasConMapeo(filasCrudas, mapeoSugerido);

  const validas = universidades.filter((u) => u.estadoValidacion === 'valido').length;
  const conAdvertencias = universidades.filter((u) => u.estadoValidacion === 'con_advertencias').length;
  const invalidas = universidades.filter((u) => u.estadoValidacion === 'invalido').length;

  return {
    nombreArchivo: archivo.name,
    tamanoBytes: archivo.size,
    totalFilas: filasCrudas.length,
    columnasDetectadas,
    mapeoSugerido,
    filasCrudas,
    universidades,
    resumen: {
      validas,
      conAdvertencias,
      invalidas
    }
  };
}

// ============================================================================
// PROCESAMIENTO Y NORMALIZACIÓN DE FILAS CON RESILIENCIA TOTAL
// ============================================================================

/**
 * Transforma filas crudas en entidades Universidad según el mapa de columnas vigente.
 * Empaqueta cualquier columna no canónica en 'datos_adicionales'.
 */
export function procesarFilasConMapeo(
  filasCrudas: Record<string, unknown>[],
  mapeoColumnas: MapeoColumnas
): UniversidadNormalizada[] {
  const ahoraIso = new Date().toISOString();

  return filasCrudas.map((filaCruda, indice) => {
    const datosAdicionales: Record<string, unknown> = {};
    const valoresMapeados: Partial<Record<CampoCanonico, unknown>> = {};
    const advertencias: AdvertenciaFila[] = [];

    // 1. Extraer datos según el mapeo
    for (const [columnaOriginal, destino] of Object.entries(mapeoColumnas)) {
      const valor = filaCruda[columnaOriginal];
      if (valor === undefined || valor === null || valor === '') continue;

      if (destino === 'ignorar') {
        continue;
      } else if (destino === 'datos_adicionales') {
        datosAdicionales[columnaOriginal] = valor;
      } else if (destino) {
        valoresMapeados[destino] = valor;
      } else {
        datosAdicionales[columnaOriginal] = valor;
      }
    }

    // 2. Extracción de Nombre (Campo Obligatorio)
    const nombreCrudo = String(valoresMapeados.nombre || '').trim();
    let estadoValidacion: EstadoValidacionFila = 'valido';

    if (!nombreCrudo) {
      estadoValidacion = 'invalido';
      advertencias.push({
        campo: 'nombre',
        mensaje: 'La fila no cuenta con nombre de institución educativa.'
      });
    }

    // 3. Resolución resiliente de campos con valores por defecto
    const matricula = limpiarNumero(valoresMapeados.matricula_estudiantes, 0);
    if (!valoresMapeados.matricula_estudiantes && estadoValidacion !== 'invalido') {
      advertencias.push({
        campo: 'matricula_estudiantes',
        mensaje: 'Sin matrícula especificada; se asignó 0 alumnos.'
      });
    }

    const puntuacion = Math.min(100, Math.max(0, Math.round(limpiarNumero(valoresMapeados.puntuacion_prioridad, 50))));
    if (!valoresMapeados.puntuacion_prioridad && estadoValidacion !== 'invalido') {
      advertencias.push({
        campo: 'puntuacion_prioridad',
        mensaje: 'Sin puntuación de prioridad; se asignó valor medio (50).'
      });
    }

    const modalidad = valoresMapeados.modalidad_preferida
      ? normalizarModalidad(valoresMapeados.modalidad_preferida)
      : 'modalidad_a_programa';
    if (!valoresMapeados.modalidad_preferida && estadoValidacion !== 'invalido') {
      advertencias.push({
        campo: 'modalidad_preferida',
        mensaje: 'Modalidad por defecto asignada: Modalidad A (Programa).'
      });
    }

    // Coordenadas
    let latitud = limpiarNumero(valoresMapeados.latitud, NaN);
    let longitud = limpiarNumero(valoresMapeados.longitud, NaN);

    if (isNaN(latitud) || isNaN(longitud)) {
      latitud = LATITUD_PREDETERMINADA;
      longitud = LONGITUD_PREDETERMINADA;
      if (estadoValidacion !== 'invalido') {
        advertencias.push({
          campo: 'coordenadas',
          mensaje: 'Sin coordenadas válidas; asignadas coordenadas centrales del Valle de México.'
        });
      }
    }

    // Ubicación geográfica
    const estado = String(valoresMapeados.estado || '').trim() || 'Estado de México';
    const municipio = String(valoresMapeados.municipio || '').trim() || 'Valle de México';
    const direccion = String(valoresMapeados.direccion || '').trim() || `Dirección de ${nombreCrudo || 'plantel'}`;

    if (!valoresMapeados.direccion && estadoValidacion !== 'invalido') {
      advertencias.push({
        campo: 'direccion',
        mensaje: 'Sin dirección completa; se generó una referencia genérica.'
      });
    }

    // Otros campos
    const claveCct = valoresMapeados.clave_cct ? String(valoresMapeados.clave_cct).trim().toUpperCase() : null;
    const tipo = normalizarTipoInstitucion(valoresMapeados.tipo);
    const estatus = normalizarEstatus(valoresMapeados.estatus);
    const colegiatura = Math.max(0, limpiarNumero(valoresMapeados.colegiatura_mensual, 0));
    const telefono = valoresMapeados.telefono ? String(valoresMapeados.telefono).trim() : null;
    const correoElectronico = valoresMapeados.correo_electronico ? String(valoresMapeados.correo_electronico).trim() : null;
    const sitioWeb = valoresMapeados.sitio_web ? String(valoresMapeados.sitio_web).trim() : null;
    const directorNombre = valoresMapeados.director_nombre ? String(valoresMapeados.director_nombre).trim() : 'Por asignar';
    const codigoPostal = valoresMapeados.codigo_postal ? String(valoresMapeados.codigo_postal).trim() : null;

    const etiquetas = normalizarLista(valoresMapeados.etiquetas);
    const marcasAliadas = normalizarLista(valoresMapeados.marcas_aliadas);

    // Si tiene advertencias pero no es inválido, es 'con_advertencias' (Semáforo amarillo)
    if (estadoValidacion === 'valido' && advertencias.length > 0) {
      estadoValidacion = 'con_advertencias';
    }

    // Construcción de la entidad canónica Universidad (con UUID válido)
    const idUniversidadValido = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : '00000000-0000-4000-8000-' + String(Date.now()).padStart(12, '0');

    const entidadUniversidad: Universidad = {
      id: idUniversidadValido,
      clave_cct: claveCct,
      nombre: nombreCrudo || `Institución Fila ${indice + 1} (Sin Nombre)`,
      tipo,
      estado,
      municipio,
      direccion,
      codigo_postal: codigoPostal,
      latitud,
      longitud,
      telefono,
      correo_electronico: correoElectronico,
      sitio_web: sitioWeb,
      director_nombre: directorNombre,
      matricula_estudiantes: matricula,
      colegiatura_mensual: colegiatura,
      puntuacion_prioridad: puntuacion,
      estatus,
      modalidad_preferida: modalidad,
      etiquetas,
      marcas_aliadas: marcasAliadas,
      datos_adicionales: datosAdicionales as any,
      creado_en: ahoraIso,
      actualizado_en: ahoraIso
    };

    return {
      indiceFila: indice + 1,
      estadoValidacion,
      advertencias,
      datos: entidadUniversidad,
      datosOriginales: filaCruda
    };
  });
}

// ============================================================================
// TRANSFORMACIÓN A COMPATIBILIDAD CON VISTAS FRONTEND (Company)
// ============================================================================

/**
 * Transforma una Universidad procesada a la estructura de Company para sincronizarla
 * de inmediato con el estado reactivo en memoria de CompaniesList y SchoolRoutePlanner.
 */
export function transformarUniversidadACompania(universidad: Universidad): Company {
  const estadoNormalizado: 'CDMX' | 'Estado de México' =
    normalizarTexto(universidad.estado).includes('cdmx') || normalizarTexto(universidad.estado).includes('ciudad de mexico')
      ? 'CDMX'
      : 'Estado de México';

  return {
    id: universidad.id,
    name: universidad.nombre,
    type: universidad.tipo,
    state: estadoNormalizado,
    municipality: universidad.municipio,
    address: universidad.direccion,
    lat: Number(universidad.latitud),
    lng: Number(universidad.longitud),
    phone: universidad.telefono && universidad.telefono.trim() !== '' ? universidad.telefono.trim() : 'Sin teléfono registrado',
    email: universidad.correo_electronico && universidad.correo_electronico.trim() !== '' ? universidad.correo_electronico.trim() : 'Sin correo registrado',
    directorName: universidad.director_nombre && universidad.director_nombre.trim() !== '' ? universidad.director_nombre.trim() : 'Sin titular registrado',
    studentCount: universidad.matricula_estudiantes ?? 0,
    monthlyTuition: Number(universidad.colegiatura_mensual ?? 0),
    leadScore: universidad.puntuacion_prioridad ?? 50,
    status: universidad.estatus ?? 'prospecto',
    tags: universidad.etiquetas && universidad.etiquetas.length > 0 ? universidad.etiquetas : ['Nuevo Ingreso Excel'],
    preferredModality: (universidad.modalidad_preferida ?? 'modalidad_a_programa') as 'modalidad_a_programa' | 'modalidad_b_escuela',
    alliedBrands: universidad.marcas_aliadas && universidad.marcas_aliadas.length > 0 ? universidad.marcas_aliadas : ['Develop Academy'],
    datos_adicionales: (universidad.datos_adicionales as Record<string, any>) || undefined
  };
}
