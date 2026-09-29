/**
 * Tipos oficiales de la Base de Datos de Supabase para la Plataforma Automatizada de Publicidad (PAP).
 * Todos los tipos, tablas, campos y enumeraciones están estrictamente definidos en español.
 */

// ============================================================================
// ENUMERACIONES (VALORES CONSTANTES DEL NEGOCIO)
// ============================================================================

export type TipoInstitucion =
  | 'universidad'
  | 'instituto_tecnologico'
  | 'universidad_tecnologica'
  | 'colegio'
  | 'empresa_asociada';

export type EstatusUniversidad =
  | 'prospecto'
  | 'cliente_activo'
  | 'en_seguimiento'
  | 'inactivo';

export type ModalidadProyecto =
  | 'modalidad_a_programa'
  | 'modalidad_b_escuela';

export type EtapaOportunidad =
  | 'prospecto'
  | 'contacto'
  | 'propuesta'
  | 'agendado'
  | 'realizado'
  | 'resultado';

export type TipoEvento =
  | 'recorrido_comercial'
  | 'conferencia_taller'
  | 'feria_trabajo'
  | 'hackathon'
  | 'proyecto';

export type TipoActividadCrm =
  | 'llamada'
  | 'reunion'
  | 'correo_electronico'
  | 'nota'
  | 'tarea';

export type EstatusRuta =
  | 'borrador'
  | 'planificada'
  | 'en_progreso'
  | 'completada'
  | 'cancelada';

export type EstatusProspectoAlumno =
  | 'registrado'
  | 'contactado'
  | 'interesado'
  | 'inscrito'
  | 'descartado';

// ============================================================================
// TABLA 1: UNIVERSIDADES
// ============================================================================

export interface Universidad {
  id: string;
  clave_cct: string | null;
  nombre: string;
  tipo: TipoInstitucion;
  estado: string;
  municipio: string;
  direccion: string;
  codigo_postal: string | null;
  latitud: number;
  longitud: number;
  telefono: string | null;
  correo_electronico: string | null;
  sitio_web: string | null;
  director_nombre: string | null;
  matricula_estudiantes: number;
  colegiatura_mensual: number;
  puntuacion_prioridad: number;
  estatus: EstatusUniversidad;
  modalidad_preferida: ModalidadProyecto;
  etiquetas: string[];
  marcas_aliadas: string[];
  datos_adicionales: Record<string, unknown>;
  creado_en: string;
  actualizado_en: string;
}

export type UniversidadInsercion = Omit<Partial<Universidad>, 'nombre' | 'estado' | 'municipio' | 'direccion' | 'latitud' | 'longitud'> & {
  nombre: string;
  estado: string;
  municipio: string;
  direccion: string;
  latitud: number;
  longitud: number;
};

export type UniversidadActualizacion = Partial<Universidad>;

// ============================================================================
// TABLA 2: CONTACTOS_UNIVERSIDAD
// ============================================================================

export interface ContactoUniversidad {
  id: string;
  universidad_id: string;
  nombre_completo: string;
  cargo_puesto: string;
  correo_electronico: string;
  telefono: string | null;
  extension_telefonica: string | null;
  nivel_influencia: string | null;
  es_contacto_principal: boolean;
  ultimo_contacto_en: string | null;
  notas: string | null;
  datos_adicionales: Record<string, unknown>;
  creado_en: string;
  actualizado_en: string;
}

export type ContactoUniversidadInsercion = Omit<Partial<ContactoUniversidad>, 'universidad_id' | 'nombre_completo' | 'cargo_puesto' | 'correo_electronico'> & {
  universidad_id: string;
  nombre_completo: string;
  cargo_puesto: string;
  correo_electronico: string;
};

export type ContactoUniversidadActualizacion = Partial<ContactoUniversidad>;

// ============================================================================
// TABLA 3: CARRERAS_UNIVERSIDAD
// ============================================================================

export interface CarreraUniversidad {
  id: string;
  universidad_id: string;
  nombre_carrera: string;
  area_estudio: string | null;
  grado_academico: string;
  matricula_estimada: number;
  modalidad: string;
  semestres_duracion: number;
  enfoque_tecnologico: boolean;
  datos_adicionales: Record<string, unknown>;
  creado_en: string;
  actualizado_en: string;
}

export type CarreraUniversidadInsercion = Omit<Partial<CarreraUniversidad>, 'universidad_id' | 'nombre_carrera'> & {
  universidad_id: string;
  nombre_carrera: string;
};

export type CarreraUniversidadActualizacion = Partial<CarreraUniversidad>;

// ============================================================================
// TABLA 4: OPORTUNIDADES
// ============================================================================

export interface Oportunidad {
  id: string;
  titulo: string;
  universidad_id: string;
  contacto_principal_id: string | null;
  monto_estimado: number;
  etapa: EtapaOportunidad;
  probabilidad_cierre: number;
  fecha_cierre_esperada: string | null;
  asesor_asignado: string | null;
  paquete_servicio: string | null;
  modalidad_proyecto: ModalidadProyecto;
  tipo_evento: TipoEvento;
  marcas_aliadas: string[];
  contador_alumnos_registrados: number;
  notas: string | null;
  ultimo_cambio_etapa: string | null;
  datos_adicionales: Record<string, unknown>;
  creado_en: string;
  actualizado_en: string;
}

export type OportunidadInsercion = Omit<Partial<Oportunidad>, 'titulo' | 'universidad_id'> & {
  titulo: string;
  universidad_id: string;
};

export type OportunidadActualizacion = Partial<Oportunidad>;

// ============================================================================
// TABLA 5: ACTIVIDADES_CRM
// ============================================================================

export interface ActividadCrm {
  id: string;
  oportunidad_id: string | null;
  universidad_id: string;
  contacto_id: string | null;
  tipo: TipoActividadCrm;
  titulo: string;
  descripcion: string | null;
  fecha_programada: string;
  completada: boolean;
  autor: string;
  resultado_minuta: string | null;
  datos_adicionales: Record<string, unknown>;
  creado_en: string;
  actualizado_en: string;
}

export type ActividadCrmInsercion = Omit<Partial<ActividadCrm>, 'universidad_id' | 'titulo' | 'fecha_programada' | 'autor'> & {
  universidad_id: string;
  titulo: string;
  fecha_programada: string;
  autor: string;
};

export type ActividadCrmActualizacion = Partial<ActividadCrm>;

// ============================================================================
// TABLA 6: PROSPECTOS_ALUMNOS
// ============================================================================

export interface ProspectoAlumno {
  id: string;
  oportunidad_id: string | null;
  universidad_id: string;
  carrera_id: string | null;
  nombre_completo: string;
  correo_electronico: string;
  telefono: string | null;
  carrera_texto: string | null;
  semestre_actual: number | null;
  consentimiento_datos: boolean;
  origen_registro: string;
  estatus: EstatusProspectoAlumno;
  datos_adicionales: Record<string, unknown>;
  creado_en: string;
  actualizado_en: string;
}

export type ProspectoAlumnoInsercion = Omit<Partial<ProspectoAlumno>, 'universidad_id' | 'nombre_completo' | 'correo_electronico'> & {
  universidad_id: string;
  nombre_completo: string;
  correo_electronico: string;
};

export type ProspectoAlumnoActualizacion = Partial<ProspectoAlumno>;

// ============================================================================
// TABLA 7: RECORRIDOS_RUTAS
// ============================================================================

export interface RecorridoRuta {
  id: string;
  titulo: string;
  asesor_responsable: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  origen_nombre: string;
  origen_direccion: string;
  origen_latitud: number;
  origen_longitud: number;
  filtro_estado: string;
  distancia_total_km: number;
  minutos_conduccion_total: number;
  minutos_estimados_totales: number;
  porcentaje_ganancia_eficiencia: number;
  presupuesto_gasolina_mxn: number;
  presupuesto_casetas_mxn: number;
  presupuesto_alimentos_mxn: number;
  total_viaticos_mxn: number;
  estimacion_litros_combustible: number;
  estimacion_dias: number;
  enlace_google_maps: string | null;
  estatus: EstatusRuta;
  datos_adicionales: Record<string, unknown>;
  creado_en: string;
  actualizado_en: string;
}

export type RecorridoRutaInsercion = Omit<Partial<RecorridoRuta>, 'titulo' | 'asesor_responsable' | 'fecha_inicio' | 'origen_nombre' | 'origen_direccion' | 'origen_latitud' | 'origen_longitud'> & {
  titulo: string;
  asesor_responsable: string;
  fecha_inicio: string;
  origen_nombre: string;
  origen_direccion: string;
  origen_latitud: number;
  origen_longitud: number;
};

export type RecorridoRutaActualizacion = Partial<RecorridoRuta>;

// ============================================================================
// TABLA 8: PARADAS_RUTA
// ============================================================================

export interface ParadaRuta {
  id: string;
  recorrido_id: string;
  universidad_id: string;
  orden_visita: number;
  distancia_desde_anterior_km: number;
  tiempo_conduccion_minutos: number;
  tiempo_estancia_sugerido_minutos: number;
  hora_reunion_recomendada: string | null;
  costo_peaje_estimado_mxn: number;
  visitada: boolean;
  notas: string | null;
  datos_adicionales: Record<string, unknown>;
  creado_en: string;
  actualizado_en: string;
}

export type ParadaRutaInsercion = Omit<Partial<ParadaRuta>, 'recorrido_id' | 'universidad_id' | 'orden_visita'> & {
  recorrido_id: string;
  universidad_id: string;
  orden_visita: number;
};

export type ParadaRutaActualizacion = Partial<ParadaRuta>;

// ============================================================================
// DEFINICIÓN DEL ESQUEMA COMPLETO DE BASE DE DATOS PARA SUPABASE
// ============================================================================

export interface BaseDatos {
  public: {
    Tables: {
      universidades: {
        Row: Universidad;
        Insert: UniversidadInsercion;
        Update: UniversidadActualizacion;
      };
      contactos_universidad: {
        Row: ContactoUniversidad;
        Insert: ContactoUniversidadInsercion;
        Update: ContactoUniversidadActualizacion;
      };
      carreras_universidad: {
        Row: CarreraUniversidad;
        Insert: CarreraUniversidadInsercion;
        Update: CarreraUniversidadActualizacion;
      };
      oportunidades: {
        Row: Oportunidad;
        Insert: OportunidadInsercion;
        Update: OportunidadActualizacion;
      };
      actividades_crm: {
        Row: ActividadCrm;
        Insert: ActividadCrmInsercion;
        Update: ActividadCrmActualizacion;
      };
      prospectos_alumnos: {
        Row: ProspectoAlumno;
        Insert: ProspectoAlumnoInsercion;
        Update: ProspectoAlumnoActualizacion;
      };
      recorridos_rutas: {
        Row: RecorridoRuta;
        Insert: RecorridoRutaInsercion;
        Update: RecorridoRutaActualizacion;
      };
      paradas_ruta: {
        Row: ParadaRuta;
        Insert: ParadaRutaInsercion;
        Update: ParadaRutaActualizacion;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      funcion_actualizar_contador_alumnos_oportunidad: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      tipo_institucion: TipoInstitucion;
      estatus_universidad: EstatusUniversidad;
      modalidad_proyecto: ModalidadProyecto;
      etapa_oportunidad: EtapaOportunidad;
      tipo_evento: TipoEvento;
      tipo_actividad_crm: TipoActividadCrm;
      estatus_ruta: EstatusRuta;
      estatus_prospecto_alumno: EstatusProspectoAlumno;
    };
  };
}
