/**
 * Tipos oficiales de la Base de Datos de Supabase para la Plataforma Automatizada de Publicidad (PAP).
 * Todos los tipos, tablas, campos y enumeraciones están estrictamente definidos en español
 * y sincronizados con el esquema PostgreSQL local de Supabase.
 */

import { Database } from './base_datos_supabase';

export type BaseDatos = Database;

// ============================================================================
// ENUMERACIONES (VALORES CONSTANTES DEL NEGOCIO)
// ============================================================================

export type TipoInstitucion = Database['public']['Enums']['tipo_institucion'];
export type EstatusUniversidad = Database['public']['Enums']['estatus_universidad'];
export type ModalidadProyecto = Database['public']['Enums']['modalidad_proyecto'];
export type EtapaOportunidad = Database['public']['Enums']['etapa_oportunidad'];
export type TipoEvento = Database['public']['Enums']['tipo_evento'];
export type TipoActividadCrm = Database['public']['Enums']['tipo_actividad_crm'];
export type EstatusRuta = Database['public']['Enums']['estatus_ruta'];
export type EstatusProspectoAlumno = Database['public']['Enums']['estatus_prospecto_alumno'];

// ============================================================================
// TABLA 1: UNIVERSIDADES
// ============================================================================

export type Universidad = Database['public']['Tables']['universidades']['Row'];
export type UniversidadInsercion = Database['public']['Tables']['universidades']['Insert'];
export type UniversidadActualizacion = Database['public']['Tables']['universidades']['Update'];

// ============================================================================
// TABLA 2: CONTACTOS_UNIVERSIDAD
// ============================================================================

export type ContactoUniversidad = Database['public']['Tables']['contactos_universidad']['Row'];
export type ContactoUniversidadInsercion = Database['public']['Tables']['contactos_universidad']['Insert'];
export type ContactoUniversidadActualizacion = Database['public']['Tables']['contactos_universidad']['Update'];

// ============================================================================
// TABLA 3: CARRERAS_UNIVERSIDAD
// ============================================================================

export type CarreraUniversidad = Database['public']['Tables']['carreras_universidad']['Row'];
export type CarreraUniversidadInsercion = Database['public']['Tables']['carreras_universidad']['Insert'];
export type CarreraUniversidadActualizacion = Database['public']['Tables']['carreras_universidad']['Update'];

// ============================================================================
// TABLA 4: OPORTUNIDADES
// ============================================================================

export type Oportunidad = Database['public']['Tables']['oportunidades']['Row'];
export type OportunidadInsercion = Database['public']['Tables']['oportunidades']['Insert'];
export type OportunidadActualizacion = Database['public']['Tables']['oportunidades']['Update'];

// ============================================================================
// TABLA 5: ACTIVIDADES_CRM
// ============================================================================

export type ActividadCrm = Database['public']['Tables']['actividades_crm']['Row'];
export type ActividadCrmInsercion = Database['public']['Tables']['actividades_crm']['Insert'];
export type ActividadCrmActualizacion = Database['public']['Tables']['actividades_crm']['Update'];

// ============================================================================
// TABLA 6: PROSPECTOS_ALUMNOS
// ============================================================================

export type ProspectoAlumno = Database['public']['Tables']['prospectos_alumnos']['Row'];
export type ProspectoAlumnoInsercion = Database['public']['Tables']['prospectos_alumnos']['Insert'];
export type ProspectoAlumnoActualizacion = Database['public']['Tables']['prospectos_alumnos']['Update'];

// ============================================================================
// TABLA 7: RECORRIDOS_RUTAS
// ============================================================================

export type RecorridoRuta = Database['public']['Tables']['recorridos_rutas']['Row'];
export type RecorridoRutaInsercion = Database['public']['Tables']['recorridos_rutas']['Insert'];
export type RecorridoRutaActualizacion = Database['public']['Tables']['recorridos_rutas']['Update'];

// ============================================================================
// TABLA 8: PARADAS_RUTA
// ============================================================================

export type ParadaRuta = Database['public']['Tables']['paradas_ruta']['Row'];
export type ParadaRutaInsercion = Database['public']['Tables']['paradas_ruta']['Insert'];
export type ParadaRutaActualizacion = Database['public']['Tables']['paradas_ruta']['Update'];
