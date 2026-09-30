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
  Oportunidad,
  OportunidadInsercion,
  EtapaOportunidad,
  ProspectoAlumnoInsercion,
  ActividadCrmInsercion
} from '../types/base_datos';
import { SEED_DEALS, SEED_COMPANIES } from '../data/seedData';

const CLAVE_ALMACENAMIENTO_OPORTUNIDADES = 'pap_crm_oportunidades_local';
const CLAVE_ALMACENAMIENTO_ALUMNOS = 'pap_crm_alumnos_local';
const CLAVE_ALMACENAMIENTO_ACTIVIDADES = 'pap_crm_actividades_local';

/**
 * Convierte un Deal del prototipo frontend inicial al formato canónico oficial de Oportunidad.
 */
function transformarDealInicialAOportunidad(deal: typeof SEED_DEALS[0]): Oportunidad {
  return {
    id: deal.id,
    titulo: deal.title,
    universidad_id: deal.companyId,
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
    if (serializado) {
      return JSON.parse(serializado);
    }
  } catch (error) {
    console.warn('Error leyendo oportunidades de almacenamiento local:', error);
  }

  // Si no hay datos en memoria local, inicializar con los tratos semilla
  const iniciales = SEED_DEALS.map(transformarDealInicialAOportunidad);
  guardarOportunidadesRespaldo(iniciales);
  return iniciales;
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

      if (!error && data && data.length > 0) {
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
  const encontrada = SEED_COMPANIES.find((c) => c.id === universidadId);
  return encontrada ? encontrada.name : 'Universidad Aliada';
}
