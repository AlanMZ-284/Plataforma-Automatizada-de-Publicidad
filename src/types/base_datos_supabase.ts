export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      actividades_crm: {
        Row: {
          actualizado_en: string
          autor: string
          completada: boolean | null
          contacto_id: string | null
          creado_en: string
          datos_adicionales: Json | null
          descripcion: string | null
          fecha_programada: string
          id: string
          oportunidad_id: string | null
          resultado_minuta: string | null
          tipo: Database["public"]["Enums"]["tipo_actividad_crm"]
          titulo: string
          universidad_id: string
        }
        Insert: {
          actualizado_en?: string
          autor: string
          completada?: boolean | null
          contacto_id?: string | null
          creado_en?: string
          datos_adicionales?: Json | null
          descripcion?: string | null
          fecha_programada: string
          id?: string
          oportunidad_id?: string | null
          resultado_minuta?: string | null
          tipo?: Database["public"]["Enums"]["tipo_actividad_crm"]
          titulo: string
          universidad_id: string
        }
        Update: {
          actualizado_en?: string
          autor?: string
          completada?: boolean | null
          contacto_id?: string | null
          creado_en?: string
          datos_adicionales?: Json | null
          descripcion?: string | null
          fecha_programada?: string
          id?: string
          oportunidad_id?: string | null
          resultado_minuta?: string | null
          tipo?: Database["public"]["Enums"]["tipo_actividad_crm"]
          titulo?: string
          universidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "actividades_crm_contacto_id_fkey"
            columns: ["contacto_id"]
            isOneToOne: false
            referencedRelation: "contactos_universidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_crm_oportunidad_id_fkey"
            columns: ["oportunidad_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actividades_crm_universidad_id_fkey"
            columns: ["universidad_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      carreras_universidad: {
        Row: {
          actualizado_en: string
          area_estudio: string | null
          creado_en: string
          datos_adicionales: Json | null
          enfoque_tecnologico: boolean | null
          grado_academico: string | null
          id: string
          matricula_estimada: number | null
          modalidad: string | null
          nombre_carrera: string
          semestres_duracion: number | null
          universidad_id: string
        }
        Insert: {
          actualizado_en?: string
          area_estudio?: string | null
          creado_en?: string
          datos_adicionales?: Json | null
          enfoque_tecnologico?: boolean | null
          grado_academico?: string | null
          id?: string
          matricula_estimada?: number | null
          modalidad?: string | null
          nombre_carrera: string
          semestres_duracion?: number | null
          universidad_id: string
        }
        Update: {
          actualizado_en?: string
          area_estudio?: string | null
          creado_en?: string
          datos_adicionales?: Json | null
          enfoque_tecnologico?: boolean | null
          grado_academico?: string | null
          id?: string
          matricula_estimada?: number | null
          modalidad?: string | null
          nombre_carrera?: string
          semestres_duracion?: number | null
          universidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "carreras_universidad_universidad_id_fkey"
            columns: ["universidad_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      contactos_universidad: {
        Row: {
          actualizado_en: string
          cargo_puesto: string
          correo_electronico: string
          creado_en: string
          datos_adicionales: Json | null
          es_contacto_principal: boolean | null
          extension_telefonica: string | null
          id: string
          nivel_influencia: string | null
          nombre_completo: string
          notas: string | null
          telefono: string | null
          ultimo_contacto_en: string | null
          universidad_id: string
        }
        Insert: {
          actualizado_en?: string
          cargo_puesto: string
          correo_electronico: string
          creado_en?: string
          datos_adicionales?: Json | null
          es_contacto_principal?: boolean | null
          extension_telefonica?: string | null
          id?: string
          nivel_influencia?: string | null
          nombre_completo: string
          notas?: string | null
          telefono?: string | null
          ultimo_contacto_en?: string | null
          universidad_id: string
        }
        Update: {
          actualizado_en?: string
          cargo_puesto?: string
          correo_electronico?: string
          creado_en?: string
          datos_adicionales?: Json | null
          es_contacto_principal?: boolean | null
          extension_telefonica?: string | null
          id?: string
          nivel_influencia?: string | null
          nombre_completo?: string
          notas?: string | null
          telefono?: string | null
          ultimo_contacto_en?: string | null
          universidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contactos_universidad_universidad_id_fkey"
            columns: ["universidad_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      oportunidades: {
        Row: {
          actualizado_en: string
          asesor_asignado: string | null
          contacto_principal_id: string | null
          contador_alumnos_registrados: number
          creado_en: string
          datos_adicionales: Json | null
          etapa: Database["public"]["Enums"]["etapa_oportunidad"]
          fecha_cierre_esperada: string | null
          id: string
          marcas_aliadas: string[] | null
          modalidad_proyecto: Database["public"]["Enums"]["modalidad_proyecto"]
          monto_estimado: number | null
          notas: string | null
          paquete_servicio: string | null
          probabilidad_cierre: number | null
          tipo_evento: Database["public"]["Enums"]["tipo_evento"]
          titulo: string
          ultimo_cambio_etapa: string | null
          universidad_id: string
        }
        Insert: {
          actualizado_en?: string
          asesor_asignado?: string | null
          contacto_principal_id?: string | null
          contador_alumnos_registrados?: number
          creado_en?: string
          datos_adicionales?: Json | null
          etapa?: Database["public"]["Enums"]["etapa_oportunidad"]
          fecha_cierre_esperada?: string | null
          id?: string
          marcas_aliadas?: string[] | null
          modalidad_proyecto?: Database["public"]["Enums"]["modalidad_proyecto"]
          monto_estimado?: number | null
          notas?: string | null
          paquete_servicio?: string | null
          probabilidad_cierre?: number | null
          tipo_evento?: Database["public"]["Enums"]["tipo_evento"]
          titulo: string
          ultimo_cambio_etapa?: string | null
          universidad_id: string
        }
        Update: {
          actualizado_en?: string
          asesor_asignado?: string | null
          contacto_principal_id?: string | null
          contador_alumnos_registrados?: number
          creado_en?: string
          datos_adicionales?: Json | null
          etapa?: Database["public"]["Enums"]["etapa_oportunidad"]
          fecha_cierre_esperada?: string | null
          id?: string
          marcas_aliadas?: string[] | null
          modalidad_proyecto?: Database["public"]["Enums"]["modalidad_proyecto"]
          monto_estimado?: number | null
          notas?: string | null
          paquete_servicio?: string | null
          probabilidad_cierre?: number | null
          tipo_evento?: Database["public"]["Enums"]["tipo_evento"]
          titulo?: string
          ultimo_cambio_etapa?: string | null
          universidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oportunidades_contacto_principal_id_fkey"
            columns: ["contacto_principal_id"]
            isOneToOne: false
            referencedRelation: "contactos_universidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oportunidades_universidad_id_fkey"
            columns: ["universidad_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      paradas_ruta: {
        Row: {
          actualizado_en: string
          costo_peaje_estimado_mxn: number | null
          creado_en: string
          datos_adicionales: Json | null
          distancia_desde_anterior_km: number | null
          hora_reunion_recomendada: string | null
          id: string
          notas: string | null
          orden_visita: number
          recorrido_id: string
          tiempo_conduccion_minutos: number | null
          tiempo_estancia_sugerido_minutos: number | null
          universidad_id: string
          visitada: boolean | null
        }
        Insert: {
          actualizado_en?: string
          costo_peaje_estimado_mxn?: number | null
          creado_en?: string
          datos_adicionales?: Json | null
          distancia_desde_anterior_km?: number | null
          hora_reunion_recomendada?: string | null
          id?: string
          notas?: string | null
          orden_visita: number
          recorrido_id: string
          tiempo_conduccion_minutos?: number | null
          tiempo_estancia_sugerido_minutos?: number | null
          universidad_id: string
          visitada?: boolean | null
        }
        Update: {
          actualizado_en?: string
          costo_peaje_estimado_mxn?: number | null
          creado_en?: string
          datos_adicionales?: Json | null
          distancia_desde_anterior_km?: number | null
          hora_reunion_recomendada?: string | null
          id?: string
          notas?: string | null
          orden_visita?: number
          recorrido_id?: string
          tiempo_conduccion_minutos?: number | null
          tiempo_estancia_sugerido_minutos?: number | null
          universidad_id?: string
          visitada?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "paradas_ruta_recorrido_id_fkey"
            columns: ["recorrido_id"]
            isOneToOne: false
            referencedRelation: "recorridos_rutas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paradas_ruta_universidad_id_fkey"
            columns: ["universidad_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      prospectos_alumnos: {
        Row: {
          actualizado_en: string
          carrera_id: string | null
          carrera_texto: string | null
          consentimiento_datos: boolean
          correo_electronico: string
          creado_en: string
          datos_adicionales: Json | null
          estatus: Database["public"]["Enums"]["estatus_prospecto_alumno"]
          id: string
          nombre_completo: string
          oportunidad_id: string | null
          origen_registro: string | null
          semestre_actual: number | null
          telefono: string | null
          universidad_id: string
        }
        Insert: {
          actualizado_en?: string
          carrera_id?: string | null
          carrera_texto?: string | null
          consentimiento_datos?: boolean
          correo_electronico: string
          creado_en?: string
          datos_adicionales?: Json | null
          estatus?: Database["public"]["Enums"]["estatus_prospecto_alumno"]
          id?: string
          nombre_completo: string
          oportunidad_id?: string | null
          origen_registro?: string | null
          semestre_actual?: number | null
          telefono?: string | null
          universidad_id: string
        }
        Update: {
          actualizado_en?: string
          carrera_id?: string | null
          carrera_texto?: string | null
          consentimiento_datos?: boolean
          correo_electronico?: string
          creado_en?: string
          datos_adicionales?: Json | null
          estatus?: Database["public"]["Enums"]["estatus_prospecto_alumno"]
          id?: string
          nombre_completo?: string
          oportunidad_id?: string | null
          origen_registro?: string | null
          semestre_actual?: number | null
          telefono?: string | null
          universidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospectos_alumnos_carrera_id_fkey"
            columns: ["carrera_id"]
            isOneToOne: false
            referencedRelation: "carreras_universidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospectos_alumnos_oportunidad_id_fkey"
            columns: ["oportunidad_id"]
            isOneToOne: false
            referencedRelation: "oportunidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prospectos_alumnos_universidad_id_fkey"
            columns: ["universidad_id"]
            isOneToOne: false
            referencedRelation: "universidades"
            referencedColumns: ["id"]
          },
        ]
      }
      recorridos_rutas: {
        Row: {
          actualizado_en: string
          asesor_responsable: string
          creado_en: string
          datos_adicionales: Json | null
          distancia_total_km: number | null
          enlace_google_maps: string | null
          estatus: Database["public"]["Enums"]["estatus_ruta"]
          estimacion_dias: number | null
          estimacion_litros_combustible: number | null
          fecha_fin: string | null
          fecha_inicio: string
          filtro_estado: string | null
          id: string
          minutos_conduccion_total: number | null
          minutos_estimados_totales: number | null
          origen_direccion: string
          origen_latitud: number
          origen_longitud: number
          origen_nombre: string
          porcentaje_ganancia_eficiencia: number | null
          presupuesto_alimentos_mxn: number | null
          presupuesto_casetas_mxn: number | null
          presupuesto_gasolina_mxn: number | null
          titulo: string
          total_viaticos_mxn: number | null
        }
        Insert: {
          actualizado_en?: string
          asesor_responsable: string
          creado_en?: string
          datos_adicionales?: Json | null
          distancia_total_km?: number | null
          enlace_google_maps?: string | null
          estatus?: Database["public"]["Enums"]["estatus_ruta"]
          estimacion_dias?: number | null
          estimacion_litros_combustible?: number | null
          fecha_fin?: string | null
          fecha_inicio: string
          filtro_estado?: string | null
          id?: string
          minutos_conduccion_total?: number | null
          minutos_estimados_totales?: number | null
          origen_direccion: string
          origen_latitud: number
          origen_longitud: number
          origen_nombre: string
          porcentaje_ganancia_eficiencia?: number | null
          presupuesto_alimentos_mxn?: number | null
          presupuesto_casetas_mxn?: number | null
          presupuesto_gasolina_mxn?: number | null
          titulo: string
          total_viaticos_mxn?: number | null
        }
        Update: {
          actualizado_en?: string
          asesor_responsable?: string
          creado_en?: string
          datos_adicionales?: Json | null
          distancia_total_km?: number | null
          enlace_google_maps?: string | null
          estatus?: Database["public"]["Enums"]["estatus_ruta"]
          estimacion_dias?: number | null
          estimacion_litros_combustible?: number | null
          fecha_fin?: string | null
          fecha_inicio?: string
          filtro_estado?: string | null
          id?: string
          minutos_conduccion_total?: number | null
          minutos_estimados_totales?: number | null
          origen_direccion?: string
          origen_latitud?: number
          origen_longitud?: number
          origen_nombre?: string
          porcentaje_ganancia_eficiencia?: number | null
          presupuesto_alimentos_mxn?: number | null
          presupuesto_casetas_mxn?: number | null
          presupuesto_gasolina_mxn?: number | null
          titulo?: string
          total_viaticos_mxn?: number | null
        }
        Relationships: []
      }
      universidades: {
        Row: {
          actualizado_en: string
          clave_cct: string | null
          codigo_postal: string | null
          colegiatura_mensual: number | null
          correo_electronico: string | null
          creado_en: string
          datos_adicionales: Json | null
          direccion: string
          director_nombre: string | null
          estado: string
          estatus: Database["public"]["Enums"]["estatus_universidad"]
          etiquetas: string[] | null
          id: string
          latitud: number
          longitud: number
          marcas_aliadas: string[] | null
          matricula_estudiantes: number | null
          modalidad_preferida:
            | Database["public"]["Enums"]["modalidad_proyecto"]
            | null
          municipio: string
          nombre: string
          puntuacion_prioridad: number | null
          sitio_web: string | null
          telefono: string | null
          tipo: Database["public"]["Enums"]["tipo_institucion"]
        }
        Insert: {
          actualizado_en?: string
          clave_cct?: string | null
          codigo_postal?: string | null
          colegiatura_mensual?: number | null
          correo_electronico?: string | null
          creado_en?: string
          datos_adicionales?: Json | null
          direccion: string
          director_nombre?: string | null
          estado: string
          estatus?: Database["public"]["Enums"]["estatus_universidad"]
          etiquetas?: string[] | null
          id?: string
          latitud: number
          longitud: number
          marcas_aliadas?: string[] | null
          matricula_estudiantes?: number | null
          modalidad_preferida?:
            | Database["public"]["Enums"]["modalidad_proyecto"]
            | null
          municipio: string
          nombre: string
          puntuacion_prioridad?: number | null
          sitio_web?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_institucion"]
        }
        Update: {
          actualizado_en?: string
          clave_cct?: string | null
          codigo_postal?: string | null
          colegiatura_mensual?: number | null
          correo_electronico?: string | null
          creado_en?: string
          datos_adicionales?: Json | null
          direccion?: string
          director_nombre?: string | null
          estado?: string
          estatus?: Database["public"]["Enums"]["estatus_universidad"]
          etiquetas?: string[] | null
          id?: string
          latitud?: number
          longitud?: number
          marcas_aliadas?: string[] | null
          matricula_estudiantes?: number | null
          modalidad_preferida?:
            | Database["public"]["Enums"]["modalidad_proyecto"]
            | null
          municipio?: string
          nombre?: string
          puntuacion_prioridad?: number | null
          sitio_web?: string | null
          telefono?: string | null
          tipo?: Database["public"]["Enums"]["tipo_institucion"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      estatus_prospecto_alumno:
        | "registrado"
        | "contactado"
        | "interesado"
        | "inscrito"
        | "descartado"
      estatus_ruta:
        | "borrador"
        | "planificada"
        | "en_progreso"
        | "completada"
        | "cancelada"
      estatus_universidad:
        | "prospecto"
        | "cliente_activo"
        | "en_seguimiento"
        | "inactivo"
      etapa_oportunidad:
        | "prospecto"
        | "contacto"
        | "propuesta"
        | "agendado"
        | "realizado"
        | "resultado"
      modalidad_proyecto: "modalidad_a_programa" | "modalidad_b_escuela"
      tipo_actividad_crm:
        | "llamada"
        | "reunion"
        | "correo_electronico"
        | "nota"
        | "tarea"
        | "alumno_qr_registrado"
      tipo_evento:
        | "recorrido_comercial"
        | "conferencia_taller"
        | "feria_trabajo"
        | "hackathon"
        | "proyecto"
      tipo_institucion:
        | "universidad"
        | "instituto_tecnologico"
        | "universidad_tecnologica"
        | "colegio"
        | "empresa_asociada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      estatus_prospecto_alumno: [
        "registrado",
        "contactado",
        "interesado",
        "inscrito",
        "descartado",
      ],
      estatus_ruta: [
        "borrador",
        "planificada",
        "en_progreso",
        "completada",
        "cancelada",
      ],
      estatus_universidad: [
        "prospecto",
        "cliente_activo",
        "en_seguimiento",
        "inactivo",
      ],
      etapa_oportunidad: [
        "prospecto",
        "contacto",
        "propuesta",
        "agendado",
        "realizado",
        "resultado",
      ],
      modalidad_proyecto: ["modalidad_a_programa", "modalidad_b_escuela"],
      tipo_actividad_crm: [
        "llamada",
        "reunion",
        "correo_electronico",
        "nota",
        "tarea",
        "alumno_qr_registrado",
      ],
      tipo_evento: [
        "recorrido_comercial",
        "conferencia_taller",
        "feria_trabajo",
        "hackathon",
        "proyecto",
      ],
      tipo_institucion: [
        "universidad",
        "instituto_tecnologico",
        "universidad_tecnologica",
        "colegio",
        "empresa_asociada",
      ],
    },
  },
} as const

