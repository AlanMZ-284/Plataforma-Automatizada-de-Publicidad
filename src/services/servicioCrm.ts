/**
 * Servicio Central de Persistencia del CRM para la Plataforma Automatizada de Publicidad (PAP).
 * Gestiona oportunidades comerciales, actividades y registro en tiempo real de alumnos vía QR.
 * Cuenta con resiliencia dual: opera directamente contra Supabase PostgreSQL y utiliza
 * almacenamiento local (localStorage) como respaldo seguro ante contingencias de red.
 * 
 * Regla: 100% en español, cero términos en inglés para lógica y entidades de negocio.
 */

import { clienteSupabase, verificarConexionSupabase } from './clienteSupabase';
import {
  Universidad,
  UniversidadInsercion,
  ContactoUniversidadInsercion,
  Oportunidad,
  OportunidadInsercion,
  EtapaOportunidad,
  ProspectoAlumnoInsercion,
  ActividadCrmInsercion,
  RecorridoRuta,
  RecorridoRutaInsercion
} from '../types/base_datos';
import { SEED_DEALS, SEED_COMPANIES, SEED_CONTACTS } from '../data/seedData';
import { Company, Deal, Contact } from '../types';
import { RecorridoOptimizado } from '../utils/optimizadorRutas';

const CLAVE_ALMACENAMIENTO_OPORTUNIDADES = 'pap_crm_oportunidades_local';
const CLAVE_ALMACENAMIENTO_ALUMNOS = 'pap_crm_alumnos_local';
const CLAVE_ALMACENAMIENTO_ACTIVIDADES = 'pap_crm_actividades_local';
const CLAVE_ALMACENAMIENTO_RECORRIDOS = 'pap_crm_recorridos_local';
const CLAVE_ALMACENAMIENTO_UNIVERSIDADES = 'pap_crm_universidades_local';

/**
 * Mapa determinista de UUIDs para las 12 instituciones iniciales de prueba (SEED_COMPANIES).
 * Garantiza tipos UUID estrictos y compatibles en PostgreSQL.
 */
export const MAPA_UUID_ESCUELAS: Record<string, string> = {
  'school-mex-1': '11111111-1111-4111-8111-111111111101',
  'school-mex-2': '11111111-1111-4111-8111-111111111102',
  'school-mex-3': '11111111-1111-4111-8111-111111111103',
  'school-mex-4': '11111111-1111-4111-8111-111111111104',
  'school-mex-5': '11111111-1111-4111-8111-111111111105',
  'school-mex-6': '11111111-1111-4111-8111-111111111106',
  'school-cdmx-1': '11111111-1111-4111-8111-111111111107',
  'school-cdmx-2': '11111111-1111-4111-8111-111111111108',
  'school-cdmx-3': '11111111-1111-4111-8111-111111111109',
  'school-cdmx-4': '11111111-1111-4111-8111-111111111110',
  'school-cdmx-5': '11111111-1111-4111-8111-111111111111',
  'school-cdmx-6': '11111111-1111-4111-8111-111111111112'
};

/**
 * Mapa determinista de UUIDs para contactos semilla de prueba.
 */
export const MAPA_UUID_CONTACTOS: Record<string, string> = {
  'contact-1': '22222222-2222-4222-8222-222222222201',
  'contact-2': '22222222-2222-4222-8222-222222222202',
  'contact-3': '22222222-2222-4222-8222-222222222203',
  'contact-4': '22222222-2222-4222-8222-222222222204'
};

/**
 * Mapa determinista de UUIDs para oportunidades comerciales semilla.
 */
export const MAPA_UUID_DEALS: Record<string, string> = {
  'deal-1': '33333333-3333-4333-8333-333333333301',
  'deal-2': '33333333-3333-4333-8333-333333333302',
  'deal-3': '33333333-3333-4333-8333-333333333303',
  'deal-4': '33333333-3333-4333-8333-333333333304',
  'deal-5': '33333333-3333-4333-8333-333333333305',
  'deal-6': '33333333-3333-4333-8333-333333333306',
  'deal-7': '33333333-3333-4333-8333-333333333307',
  'deal-8': '33333333-3333-4333-8333-333333333308',
  'deal-9': '33333333-3333-4333-8333-333333333309',
  'deal-10': '33333333-3333-4333-8333-333333333310'
};

/**
 * Comprueba si una cadena cumple con la estructura estándar de UUID.
 */
export function esUuidValido(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Mapea una entidad canónica de base de datos 'Universidad' al tipo 'Company' del frontend.
 */
export function mapearUniversidadACompany(u: Universidad): Company {
  const estadoNormalizado: 'CDMX' | 'Estado de México' =
    u.estado?.toLowerCase().includes('cdmx') || u.estado?.toLowerCase().includes('ciudad de')
      ? 'CDMX'
      : 'Estado de México';

  return {
    id: u.id,
    name: u.nombre,
    type: (u.tipo as any) || 'universidad',
    state: estadoNormalizado,
    municipality: u.municipio || '',
    address: u.direccion || '',
    lat: Number(u.latitud || 19.4326),
    lng: Number(u.longitud || -99.1332),
    phone: u.telefono || 'Sin teléfono',
    email: u.correo_electronico || 'vinculacion@universidad.edu.mx',
    directorName: u.director_nombre || 'Por confirmar',
    studentCount: u.matricula_estudiantes ?? 0,
    monthlyTuition: Number(u.colegiatura_mensual ?? 0),
    leadScore: u.puntuacion_prioridad ?? 50,
    status: (u.estatus as any) || 'prospecto',
    tags: u.etiquetas && u.etiquetas.length > 0 ? u.etiquetas : ['Institución Educativa'],
    preferredModality: (u.modalidad_preferida as any) || 'modalidad_a_programa',
    alliedBrands: u.marcas_aliadas && u.marcas_aliadas.length > 0 ? u.marcas_aliadas : ['Develop Academy']
  };
}

/**
 * Mapea una entidad 'Oportunidad' de Supabase al tipo 'Deal' del frontend.
 */
export function mapearOportunidadADeal(op: Oportunidad): Deal {
  return {
    id: op.id,
    title: op.titulo,
    companyId: op.universidad_id,
    amount: Number(op.monto_estimado || 0),
    stage: op.etapa,
    probability: Number(op.probabilidad_cierre || 0),
    expectedCloseDate: op.fecha_cierre_esperada || '',
    assignedRep: op.asesor_asignado || 'Carlos Mendoza',
    servicePackage: op.paquete_servicio || '',
    notes: op.notas || '',
    createdAt: (op.creado_en || '').split('T')[0] || new Date().toISOString().split('T')[0],
    lastStageChange: op.ultimo_cambio_etapa || undefined,
    projectModality: op.modalidad_proyecto,
    eventType: op.tipo_evento,
    alliedBrands: op.marcas_aliadas || [],
    registeredLeadsCount: op.contador_alumnos_registrados || 0
  };
}

/**
 * Verifica si la instancia local de Supabase responde y retorna el conteo de universidades.
 */
export async function verificarConexionBaseDatos(): Promise<{ conectada: boolean; totalUniversidades: number }> {
  try {
    const disponible = await verificarConexionSupabase();
    if (!disponible) {
      return { conectada: false, totalUniversidades: 0 };
    }

    const { count, error } = await clienteSupabase
      .from('universidades')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { conectada: false, totalUniversidades: 0 };
    }

    return { conectada: true, totalUniversidades: count ?? 0 };
  } catch (error) {
    return { conectada: false, totalUniversidades: 0 };
  }
}

/**
 * Consulta la lista completa de universidades directamente en PostgreSQL vía Supabase.
 * - Si hay registros en Supabase, los mapea al formato de la aplicación (Company[]),
 *   actualiza el respaldo local (pap_crm_universidades_local) y los retorna.
 * - Si Supabase está vacío (0 registros), retorna [] (respetando base limpia sin forzar semillas)
 *   y sincroniza el respaldo local a [].
 * - Si no hay conexión o falla la consulta, recurre a localStorage sin forzar semillas.
 */
export async function obtenerUniversidadesDesdeBD(): Promise<Company[]> {
  try {
    const conexionDisponible = await verificarConexionSupabase();

    if (conexionDisponible) {
      const { data, error } = await clienteSupabase
        .from('universidades')
        .select('*')
        .order('nombre', { ascending: true });

      if (!error && data) {
        const companias = (data as Universidad[]).map(mapearUniversidadACompany);
        try {
          localStorage.setItem(CLAVE_ALMACENAMIENTO_UNIVERSIDADES, JSON.stringify(companias));
        } catch (e) {
          console.warn('Error sincronizando respaldo local de universidades:', e);
        }
        return companias;
      }
    }
  } catch (error) {
    console.warn('No fue posible consultar universidades desde Supabase:', error);
  }

  // Fallback a almacenamiento local sin reinyectar semillas si estaba intencionalmente vacío
  try {
    const guardadas = localStorage.getItem(CLAVE_ALMACENAMIENTO_UNIVERSIDADES);
    if (guardadas !== null) {
      const parsed = JSON.parse(guardadas);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error leyendo respaldo local de universidades:', e);
  }

  return [];
}

/**
 * Inserta un lote inicial de universidades, contactos y tratos directamente en PostgreSQL
 * mediante Supabase, generando UUIDs válidos para respetar la integridad referencial.
 */
export async function poblarDatosSemillaEnSupabase(): Promise<{
  exito: boolean;
  totalUniversidades: number;
  totalContactos: number;
  totalOportunidades: number;
  error?: string;
}> {
  try {
    const conexionDisponible = await verificarConexionSupabase();
    if (!conexionDisponible) {
      // Guardar en respaldo local ante indisponibilidad de BD
      localStorage.setItem(CLAVE_ALMACENAMIENTO_UNIVERSIDADES, JSON.stringify(SEED_COMPANIES));
      localStorage.setItem(CLAVE_ALMACENAMIENTO_OPORTUNIDADES, JSON.stringify(SEED_DEALS.map(transformarDealInicialAOportunidad)));
      return {
        exito: true,
        totalUniversidades: SEED_COMPANIES.length,
        totalContactos: SEED_CONTACTS.length,
        totalOportunidades: SEED_DEALS.length
      };
    }

    // 1. Preparar e insertar universidades
    const universidadesAInsertar: UniversidadInsercion[] = SEED_COMPANIES.map((c) => ({
      id: MAPA_UUID_ESCUELAS[c.id] || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '11111111-1111-4111-8111-111111111199'),
      nombre: c.name,
      tipo: c.type,
      estado: c.state,
      municipio: c.municipality,
      direccion: c.address,
      latitud: c.lat,
      longitud: c.lng,
      telefono: c.phone,
      correo_electronico: c.email,
      director_nombre: c.directorName,
      matricula_estudiantes: c.studentCount,
      colegiatura_mensual: c.monthlyTuition,
      puntuacion_prioridad: c.leadScore,
      estatus: c.status,
      etiquetas: c.tags,
      modalidad_preferida: c.preferredModality || 'modalidad_a_programa',
      marcas_aliadas: c.alliedBrands || [],
      datos_adicionales: {}
    }));

    const { error: errUniv } = await clienteSupabase
      .from('universidades')
      .upsert(universidadesAInsertar);

    if (errUniv) {
      console.error('Error insertando universidades semilla en Supabase:', errUniv);
      return { exito: false, totalUniversidades: 0, totalContactos: 0, totalOportunidades: 0, error: errUniv.message };
    }

    // 2. Preparar e insertar contactos de universidad
    const contactosAInsertar: ContactoUniversidadInsercion[] = SEED_CONTACTS.map((ct) => ({
      id: MAPA_UUID_CONTACTOS[ct.id] || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '22222222-2222-4222-8222-222222222299'),
      universidad_id: MAPA_UUID_ESCUELAS[ct.companyId] || ct.companyId,
      nombre_completo: ct.name,
      cargo_puesto: ct.role,
      correo_electronico: ct.email,
      telefono: ct.phone,
      es_contacto_principal: true,
      datos_adicionales: { avatar: ct.avatar }
    }));

    const { error: errCont } = await clienteSupabase
      .from('contactos_universidad')
      .upsert(contactosAInsertar);

    if (errCont) {
      console.warn('Aviso insertando contactos semilla:', errCont);
    }

    // 3. Preparar e insertar oportunidades comerciales
    const oportunidadesAInsertar: OportunidadInsercion[] = SEED_DEALS.map((d) => ({
      id: MAPA_UUID_DEALS[d.id] || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '33333333-3333-4333-8333-333333333399'),
      universidad_id: MAPA_UUID_ESCUELAS[d.companyId] || d.companyId,
      titulo: d.title,
      monto_estimado: d.amount,
      etapa: d.stage,
      probabilidad_cierre: d.probability,
      fecha_cierre_esperada: d.expectedCloseDate,
      asesor_asignado: d.assignedRep,
      paquete_servicio: d.servicePackage,
      modalidad_proyecto: d.projectModality,
      tipo_evento: d.eventType,
      marcas_aliadas: d.alliedBrands,
      contador_alumnos_registrados: d.registeredLeadsCount || 0,
      notas: d.notes,
      datos_adicionales: {}
    }));

    const { error: errDeals } = await clienteSupabase
      .from('oportunidades')
      .upsert(oportunidadesAInsertar);

    if (errDeals) {
      console.warn('Aviso insertando oportunidades semilla:', errDeals);
    }

    // 4. Sincronizar respaldos locales
    const companiasSincronizadas = universidadesAInsertar.map((u) => ({
      id: u.id || '',
      name: u.nombre,
      type: u.tipo,
      state: (u.estado.includes('CDMX') ? 'CDMX' : 'Estado de México') as any,
      municipality: u.municipio,
      address: u.direccion,
      lat: u.latitud,
      lng: u.longitud,
      phone: u.telefono || '',
      email: u.correo_electronico || '',
      directorName: u.director_nombre || '',
      studentCount: u.matricula_estudiantes || 0,
      monthlyTuition: u.colegiatura_mensual || 0,
      leadScore: u.puntuacion_prioridad || 50,
      status: u.estatus || 'prospecto',
      tags: u.etiquetas || [],
      preferredModality: u.modalidad_preferida || 'modalidad_a_programa',
      alliedBrands: u.marcas_aliadas || []
    }));

    localStorage.setItem(CLAVE_ALMACENAMIENTO_UNIVERSIDADES, JSON.stringify(companiasSincronizadas));
    localStorage.setItem(CLAVE_ALMACENAMIENTO_OPORTUNIDADES, JSON.stringify(oportunidadesAInsertar));

    return {
      exito: true,
      totalUniversidades: universidadesAInsertar.length,
      totalContactos: contactosAInsertar.length,
      totalOportunidades: oportunidadesAInsertar.length
    };
  } catch (error: any) {
    console.error('Excepción al poblar datos semilla en Supabase:', error);
    return {
      exito: false,
      totalUniversidades: 0,
      totalContactos: 0,
      totalOportunidades: 0,
      error: error?.message || 'Error desconocido'
    };
  }
}

/**
 * Ejecuta el borrado masivo controlado de las tablas en Supabase respetando el orden
 * inverso de dependencias de claves foráneas y vacía el almacenamiento local de respaldo.
 */
export async function limpiarBaseDatosSupabase(): Promise<{ exito: boolean; error?: string }> {
  try {
    const conexionDisponible = await verificarConexionSupabase();

    if (conexionDisponible) {
      // 1. actividades_crm
      await clienteSupabase.from('actividades_crm').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // 2. prospectos_alumnos
      await clienteSupabase.from('prospectos_alumnos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // 3. paradas_ruta
      await clienteSupabase.from('paradas_ruta').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // 4. recorridos_rutas
      await clienteSupabase.from('recorridos_rutas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // 5. oportunidades
      await clienteSupabase.from('oportunidades').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // 6. contactos_universidad
      await clienteSupabase.from('contactos_universidad').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // 7. carreras_universidad
      await clienteSupabase.from('carreras_universidad').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // 8. universidades
      await clienteSupabase.from('universidades').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
  } catch (error: any) {
    console.warn('Advertencia al limpiar base de datos en Supabase:', error);
  }

  // Limpiar respaldos en localStorage para reflejar estado vacío inmediatamente
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO_UNIVERSIDADES, '[]');
    localStorage.setItem(CLAVE_ALMACENAMIENTO_OPORTUNIDADES, '[]');
    localStorage.setItem(CLAVE_ALMACENAMIENTO_ACTIVIDADES, '[]');
    localStorage.setItem(CLAVE_ALMACENAMIENTO_ALUMNOS, '[]');
    localStorage.setItem(CLAVE_ALMACENAMIENTO_RECORRIDOS, '[]');
  } catch (e) {
    console.warn('Error limpiando respaldos en localStorage:', e);
  }

  return { exito: true };
}

/**
 * Convierte un Deal del prototipo frontend inicial al formato canónico oficial de Oportunidad.
 */
function transformarDealInicialAOportunidad(deal: typeof SEED_DEALS[0]): Oportunidad {
  return {
    id: MAPA_UUID_DEALS[deal.id] || deal.id,
    titulo: deal.title,
    universidad_id: MAPA_UUID_ESCUELAS[deal.companyId] || deal.companyId,
    contacto_principal_id: null,
    monto_estimado: deal.amount,
    etapa: deal.stage,
    probabilidad_cierre: deal.probability,
    fecha_cierre_esperada: deal.expectedCloseDate,
    asesor_asignado: deal.assignedRep,
    paquete_servicio: deal.servicePackage,
    modalidad_proyecto: deal.projectModality,
    tipo_evento: deal.eventType,
    marcas_aliadas: deal.alliedBrands,
    contador_alumnos_registrados: deal.registeredLeadsCount || 0,
    notas: deal.notes,
    ultimo_cambio_etapa: deal.lastStageChange || deal.createdAt,
    datos_adicionales: {},
    creado_en: `${deal.createdAt}T10:00:00.000Z`,
    actualizado_en: new Date().toISOString()
  };
}

/**
 * Obtiene las oportunidades desde el almacenamiento local de respaldo.
 */
function obtenerOportunidadesRespaldo(): Oportunidad[] {
  try {
    const serializado = localStorage.getItem(CLAVE_ALMACENAMIENTO_OPORTUNIDADES);
    if (serializado !== null) {
      return JSON.parse(serializado);
    }
  } catch (error) {
    console.warn('Error leyendo oportunidades de almacenamiento local:', error);
  }

  return [];
}

/**
 * Guarda las oportunidades en el almacenamiento local de respaldo.
 */
function guardarOportunidadesRespaldo(oportunidades: Oportunidad[]): void {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO_OPORTUNIDADES, JSON.stringify(oportunidades));
  } catch (error) {
    console.warn('Error guardando oportunidades en almacenamiento local:', error);
  }
}

/**
 * Consulta la lista completa de oportunidades comerciales en el pipeline.
 */
export async function obtenerOportunidades(): Promise<Oportunidad[]> {
  try {
    const conexionDisponible = await verificarConexionSupabase();

    if (conexionDisponible) {
      const { data, error } = await clienteSupabase
        .from('oportunidades')
        .select('*')
        .order('creado_en', { ascending: false });

      if (!error && data) {
        // Sincronizar respaldo local
        guardarOportunidadesRespaldo(data as Oportunidad[]);
        return data as Oportunidad[];
      }
    }
  } catch (error) {
    console.warn('No fue posible consultar Supabase; recurriendo al respaldo local.', error);
  }

  return obtenerOportunidadesRespaldo();
}

/**
 * Registra y persiste una nueva oportunidad comercial en el embudo.
 */
export async function guardarOportunidad(
  oportunidad: Omit<Oportunidad, 'id' | 'creado_en' | 'actualizado_en'>
): Promise<Oportunidad> {
  const ahoraIso = new Date().toISOString();
  const nuevaOportunidad: Oportunidad = {
    ...oportunidad,
    id: `opo-${Date.now()}`,
    creado_en: ahoraIso,
    actualizado_en: ahoraIso
  };

  try {
    const conexionDisponible = await verificarConexionSupabase();

    if (conexionDisponible) {
      const datosInsercion: OportunidadInsercion = {
        titulo: oportunidad.titulo,
        universidad_id: oportunidad.universidad_id,
        monto_estimado: oportunidad.monto_estimado,
        etapa: oportunidad.etapa,
        probabilidad_cierre: oportunidad.probabilidad_cierre,
        fecha_cierre_esperada: oportunidad.fecha_cierre_esperada,
        asesor_asignado: oportunidad.asesor_asignado,
        paquete_servicio: oportunidad.paquete_servicio,
        modalidad_proyecto: oportunidad.modalidad_proyecto,
        tipo_evento: oportunidad.tipo_evento,
        marcas_aliadas: oportunidad.marcas_aliadas,
        contador_alumnos_registrados: oportunidad.contador_alumnos_registrados || 0,
        notas: oportunidad.notas,
        datos_adicionales: oportunidad.datos_adicionales || {}
      };

      const { data, error } = await clienteSupabase
        .from('oportunidades')
        .insert(datosInsercion)
        .select()
        .single();

      if (!error && data) {
        const resultado = data as Oportunidad;
        const listaActual = obtenerOportunidadesRespaldo();
        guardarOportunidadesRespaldo([resultado, ...listaActual.filter((o) => o.id !== resultado.id)]);
        return resultado;
      }
    }
  } catch (error) {
    console.warn('Fallo guardando en Supabase; persistiendo en respaldo local.', error);
  }

  // Guardado en respaldo local
  const listaLocal = obtenerOportunidadesRespaldo();
  const actualizada = [nuevaOportunidad, ...listaLocal];
  guardarOportunidadesRespaldo(actualizada);

  return nuevaOportunidad;
}

/**
 * Actualiza la etapa oficial del pipeline para una oportunidad determinada.
 */
export async function actualizarEtapaOportunidad(
  oportunidadId: string,
  nuevaEtapa: EtapaOportunidad
): Promise<void> {
  const ahoraIso = new Date().toISOString();

  // 1. Intentar actualizar en Supabase
  try {
    const conexionDisponible = await verificarConexionSupabase();

    if (conexionDisponible) {
      await clienteSupabase
        .from('oportunidades')
        .update({
          etapa: nuevaEtapa,
          ultimo_cambio_etapa: ahoraIso,
          actualizado_en: ahoraIso
        })
        .eq('id', oportunidadId);
    }
  } catch (error) {
    console.warn('No se pudo actualizar etapa en Supabase; guardando en local.', error);
  }

  // 2. Actualizar en almacenamiento local siempre
  const listaLocal = obtenerOportunidadesRespaldo();
  const actualizada = listaLocal.map((opo) => {
    if (opo.id === oportunidadId) {
      return {
        ...opo,
        etapa: nuevaEtapa,
        ultimo_cambio_etapa: ahoraIso,
        actualizado_en: ahoraIso
      };
    }
    return opo;
  });
  guardarOportunidadesRespaldo(actualizada);
}

/**
 * Parámetros requeridos para capturar a un alumno que escaneó el código QR en un evento.
 */
export interface ParametrosRegistroAlumnoQr {
  oportunidad_id: string;
  universidad_id: string;
  nombre_completo: string;
  correo_electronico: string;
  telefono?: string;
  carrera: string;
  semestre?: number;
  aviso_privacidad_aceptado: boolean;
}

/**
 * Registra un estudiante captado vía código QR.
 * Realiza inserción en 'prospectos_alumnos' y genera una bitácora en 'actividades_crm'
 * con tipo 'alumno_qr_registrado'.
 */
export async function registrarAlumnoQr(lead: ParametrosRegistroAlumnoQr): Promise<void> {
  const ahoraIso = new Date().toISOString();
  const idProspecto = `prosp-${Date.now()}`;

  // 1. Inserción en Supabase (si está accesible)
  try {
    const conexionDisponible = await verificarConexionSupabase();

    if (conexionDisponible) {
      // Inserción de alumno
      const insercionAlumno: ProspectoAlumnoInsercion = {
        oportunidad_id: lead.oportunidad_id,
        universidad_id: lead.universidad_id,
        nombre_completo: lead.nombre_completo,
        correo_electronico: lead.correo_electronico,
        telefono: lead.telefono || null,
        carrera_texto: lead.carrera,
        semestre_actual: lead.semestre || null,
        consentimiento_datos: lead.aviso_privacidad_aceptado,
        origen_registro: 'codigo_qr_evento',
        estatus: 'registrado',
        datos_adicionales: {}
      };

      await clienteSupabase.from('prospectos_alumnos').insert(insercionAlumno);

      // Inserción de actividad en la bitácora del CRM
      const insercionActividad: ActividadCrmInsercion = {
        oportunidad_id: lead.oportunidad_id,
        universidad_id: lead.universidad_id,
        tipo: 'alumno_qr_registrado',
        titulo: `Alumno Captado vía QR: ${lead.nombre_completo}`,
        descripcion: `Estudiante registrado desde el stand institucional. Carrera: ${lead.carrera}, Semestre: ${lead.semestre || 'No especificado'}. Correo: ${lead.correo_electronico}. Consentimiento LFPDPPP registrado.`,
        fecha_programada: ahoraIso,
        completada: true,
        autor: 'Sistema QR Develop'
      };

      await clienteSupabase.from('actividades_crm').insert(insercionActividad);
    }
  } catch (error) {
    console.warn('Fallo registrando alumno en Supabase; guardando en local.', error);
  }

  // 2. Persistir en almacenamiento local (alumnos y actividades)
  try {
    const alumnosPrevios = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO_ALUMNOS) || '[]');
    alumnosPrevios.push({
      id: idProspecto,
      ...lead,
      fecha_registro: ahoraIso
    });
    localStorage.setItem(CLAVE_ALMACENAMIENTO_ALUMNOS, JSON.stringify(alumnosPrevios));

    const actividadesPrevias = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO_ACTIVIDADES) || '[]');
    actividadesPrevias.push({
      id: `act-qr-${Date.now()}`,
      oportunidad_id: lead.oportunidad_id,
      universidad_id: lead.universidad_id,
      tipo: 'alumno_qr_registrado',
      titulo: `Alumno Captado vía QR: ${lead.nombre_completo}`,
      descripcion: `Estudiante registrado desde el stand. Carrera: ${lead.carrera}. Correo: ${lead.correo_electronico}.`,
      fecha: ahoraIso.replace('T', ' ').substring(0, 16),
      autor: 'Sistema QR Develop'
    });
    localStorage.setItem(CLAVE_ALMACENAMIENTO_ACTIVIDADES, JSON.stringify(actividadesPrevias));

    // 3. Incrementar el contador de alumnos en la oportunidad correspondiente
    const listaOportunidades = obtenerOportunidadesRespaldo();
    const listaActualizada = listaOportunidades.map((opo) => {
      if (opo.id === lead.oportunidad_id) {
        return {
          ...opo,
          contador_alumnos_registrados: (opo.contador_alumnos_registrados || 0) + 1,
          actualizado_en: ahoraIso
        };
      }
      return opo;
    });
    guardarOportunidadesRespaldo(listaActualizada);
  } catch (error) {
    console.error('Error guardando registro en almacenamiento local:', error);
  }
}

/**
 * Consulta el nombre de una universidad a partir de su ID para el encabezado del formulario QR.
 */
export function obtenerNombreUniversidad(universidadId: string): string {
  try {
    const serializado = localStorage.getItem(CLAVE_ALMACENAMIENTO_UNIVERSIDADES);
    if (serializado) {
      const universidades: Company[] = JSON.parse(serializado);
      const enc = universidades.find((u) => u.id === universidadId);
      if (enc) return enc.name;
    }
  } catch (e) {
    console.warn('Error leyendo universidades para obtener nombre:', e);
  }

  const encontrada = SEED_COMPANIES.find(
    (c) => c.id === universidadId || MAPA_UUID_ESCUELAS[c.id] === universidadId
  );
  return encontrada ? encontrada.name : 'Universidad Aliada';
}

/**
 * Resultado de la operación de guardar un recorrido logístico en la agenda del CRM.
 */
export interface ResultadoGuardadoRecorrido {
  recorridoId: string;
  enlaceGoogleMaps: string;
  totalParadas: number;
  totalViaticosMxn: number;
  actividadesGeneradas: {
    id: string;
    companyId: string;
    universidad_id: string;
    type: 'meeting';
    tipo: 'reunion';
    title: string;
    titulo: string;
    description: string;
    descripcion: string;
    date: string;
    fecha: string;
    completed: boolean;
    completada: boolean;
    author: string;
    autor: string;
  }[];
}

/**
 * Guarda y agenda un recorrido logístico completo en el CRM de Develop:
 * 1. Para cada universidad de la ruta, genera una actividad de tipo 'reunion' en la bitácora del CRM.
 * 2. Persiste el recorrido en la tabla 'recorridos_rutas' de Supabase con el JSON de paradas y viáticos.
 * 3. Almacena en localStorage como respaldo offline asegurando disponibilidad inmediata.
 */
export async function guardarRecorridoRuta(
  recorrido: RecorridoOptimizado,
  fechaGira?: string,
  asesorResponsable: string = 'Carlos Mendoza'
): Promise<ResultadoGuardadoRecorrido> {
  const ahoraIso = new Date().toISOString();
  const fechaGiraDefinida = fechaGira || ahoraIso.split('T')[0];

  // Generar un ID UUID válido para PostgreSQL
  const idRecorrido = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : '00000000-0000-4000-8000-' + String(Date.now()).padStart(12, '0');

  // 1. Generar actividades de tipo 'reunion' para cada universidad en el circuito
  const actividadesGeneradas = recorrido.paradas.map((parada) => {
    const idActividad = `act-gira-${Date.now()}-${parada.orden}`;
    const horaTexto = parada.hora_reunion_recomendada || '09:00 hrs';
    const contactoTexto = parada.director_nombre || 'Director(a) de Vinculación';
    const totalViaticosFormato = recorrido.viaticos.total_viaticos_mxn.toLocaleString('es-MX');

    const tituloActividad = `Visita Presencial Agendada en Gira: ${parada.nombre}`;
    const descripcionActividad = `Llegada recomendada: ${horaTexto}. Reunión con ${contactoTexto}. Viáticos autorizados para la gira: $${totalViaticosFormato} MXN.`;
    const fechaHora = `${fechaGiraDefinida} ${horaTexto.replace(' hrs', '')}`;

    return {
      id: idActividad,
      companyId: parada.universidad_id,
      universidad_id: parada.universidad_id,
      type: 'meeting' as const,
      tipo: 'reunion' as const,
      title: tituloActividad,
      titulo: tituloActividad,
      description: descripcionActividad,
      descripcion: descripcionActividad,
      date: fechaHora,
      fecha: fechaHora,
      completed: false,
      completada: false,
      author: asesorResponsable,
      autor: asesorResponsable
    };
  });

  // 2. Persistir en Supabase (si hay conexión local disponible)
  try {
    const conexionDisponible = await verificarConexionSupabase();

    if (conexionDisponible) {
      const insercionRecorrido: RecorridoRutaInsercion = {
        id: idRecorrido,
        titulo: recorrido.titulo,
        asesor_responsable: asesorResponsable,
        fecha_inicio: fechaGiraDefinida,
        fecha_fin: fechaGiraDefinida,
        origen_nombre: recorrido.origen.nombre,
        origen_direccion: recorrido.origen.direccion,
        origen_latitud: recorrido.origen.lat,
        origen_longitud: recorrido.origen.lng,
        filtro_estado: recorrido.filtro_estado,
        distancia_total_km: recorrido.distancia_total_km,
        minutos_conduccion_total: recorrido.minutos_conduccion_total,
        minutos_estimados_totales: recorrido.minutos_estimados_totales,
        porcentaje_ganancia_eficiencia: recorrido.porcentaje_ganancia_eficiencia,
        presupuesto_gasolina_mxn: recorrido.viaticos.gasolina_mxn,
        presupuesto_casetas_mxn: recorrido.viaticos.casetas_mxn,
        presupuesto_alimentos_mxn: recorrido.viaticos.alimentos_mxn,
        total_viaticos_mxn: recorrido.viaticos.total_viaticos_mxn,
        estimacion_litros_combustible: recorrido.viaticos.estimacion_litros_combustible,
        estimacion_dias: recorrido.viaticos.estimacion_dias,
        enlace_google_maps: recorrido.enlace_google_maps,
        estatus: 'planificada',
        datos_adicionales: {
          paradas: recorrido.paradas,
          viaticos: recorrido.viaticos
        } as unknown as import('../types/base_datos_supabase').Json
      };

      await clienteSupabase.from('recorridos_rutas').insert(insercionRecorrido);
    }
  } catch (error) {
    console.warn('Fallo guardando recorrido en Supabase; persistiendo en almacenamiento local.', error);
  }

  // 3. Persistir en almacenamiento local (recorridos y actividades de agenda)
  try {
    const recorridosPrevios = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO_RECORRIDOS) || '[]');
    const nuevoRegistroRecorrido = {
      ...recorrido,
      id: idRecorrido,
      fecha_gira: fechaGiraDefinida,
      asesor_responsable: asesorResponsable,
      guardado_en: ahoraIso
    };
    localStorage.setItem(
      CLAVE_ALMACENAMIENTO_RECORRIDOS,
      JSON.stringify([nuevoRegistroRecorrido, ...recorridosPrevios])
    );

    const actividadesPrevias = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO_ACTIVIDADES) || '[]');
    localStorage.setItem(
      CLAVE_ALMACENAMIENTO_ACTIVIDADES,
      JSON.stringify([...actividadesGeneradas, ...actividadesPrevias])
    );
  } catch (error) {
    console.warn('Error guardando en almacenamiento local:', error);
  }

  return {
    recorridoId: idRecorrido,
    enlaceGoogleMaps: recorrido.enlace_google_maps,
    totalParadas: recorrido.paradas.length,
    totalViaticosMxn: recorrido.viaticos.total_viaticos_mxn,
    actividadesGeneradas
  };
}

/**
 * Consulta la lista de recorridos guardados previamente en el sistema.
 */
export async function obtenerRecorridosGuardados(): Promise<any[]> {
  try {
    const conexionDisponible = await verificarConexionSupabase();

    if (conexionDisponible) {
      const { data, error } = await clienteSupabase
        .from('recorridos_rutas')
        .select('*')
        .order('creado_en', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    }
  } catch (error) {
    console.warn('No fue posible consultar recorridos de Supabase; recurriendo al local.', error);
  }

  try {
    const locales = localStorage.getItem(CLAVE_ALMACENAMIENTO_RECORRIDOS);
    if (locales) return JSON.parse(locales);
  } catch (e) {
    console.warn('Error leyendo recorridos locales:', e);
  }

  return [];
}
