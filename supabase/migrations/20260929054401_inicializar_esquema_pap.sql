-- ============================================================================
-- MIGRACIÓN OFICIAL: Plataforma Automatizada de Publicidad (PAP)
-- Descripción: Esquema relacional central en español para el CRM universitario,
--              planificación de rutas logísticas y captación de alumnos por QR.
-- ============================================================================

-- 1. EXTENSIONES NECESARIAS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS PERSONALIZADOS (ENUMS 100% EN ESPAÑOL)
CREATE TYPE tipo_institucion AS ENUM (
    'universidad',
    'instituto_tecnologico',
    'universidad_tecnologica',
    'colegio',
    'empresa_asociada'
);

CREATE TYPE estatus_universidad AS ENUM (
    'prospecto',
    'cliente_activo',
    'en_seguimiento',
    'inactivo'
);

CREATE TYPE modalidad_proyecto AS ENUM (
    'modalidad_a_programa',
    'modalidad_b_escuela'
);

CREATE TYPE etapa_oportunidad AS ENUM (
    'prospecto',
    'contacto',
    'propuesta',
    'agendado',
    'realizado',
    'resultado'
);

CREATE TYPE tipo_evento AS ENUM (
    'recorrido_comercial',
    'conferencia_taller',
    'feria_trabajo',
    'hackathon',
    'proyecto'
);

CREATE TYPE tipo_actividad_crm AS ENUM (
    'llamada',
    'reunion',
    'correo_electronico',
    'nota',
    'tarea',
    'alumno_qr_registrado'
);

CREATE TYPE estatus_ruta AS ENUM (
    'borrador',
    'planificada',
    'en_progreso',
    'completada',
    'cancelada'
);

CREATE TYPE estatus_prospecto_alumno AS ENUM (
    'registrado',
    'contactado',
    'interesado',
    'inscrito',
    'descartado'
);

-- 3. FUNCIÓN REUTILIZABLE PARA ACTUALIZAR FECHAS DE MODIFICACIÓN
CREATE OR REPLACE FUNCTION funcion_actualizar_marca_tiempo()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLA 1: UNIVERSIDADES
-- ============================================================================
CREATE TABLE universidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave_cct VARCHAR(20) UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    tipo tipo_institucion NOT NULL DEFAULT 'universidad',
    estado VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    codigo_postal VARCHAR(10),
    latitud NUMERIC(10, 7) NOT NULL,
    longitud NUMERIC(10, 7) NOT NULL,
    telefono VARCHAR(50),
    correo_electronico VARCHAR(150),
    sitio_web VARCHAR(255),
    director_nombre VARCHAR(150),
    matricula_estudiantes INTEGER DEFAULT 0 CHECK (matricula_estudiantes >= 0),
    colegiatura_mensual NUMERIC(12, 2) DEFAULT 0 CHECK (colegiatura_mensual >= 0),
    puntuacion_prioridad INTEGER DEFAULT 0 CHECK (puntuacion_prioridad >= 0 AND puntuacion_prioridad <= 100),
    estatus estatus_universidad NOT NULL DEFAULT 'prospecto',
    modalidad_preferida modalidad_proyecto DEFAULT 'modalidad_a_programa',
    etiquetas TEXT[] DEFAULT '{}',
    marcas_aliadas TEXT[] DEFAULT '{}',
    datos_adicionales JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE universidades IS 'Catálogo principal de universidades e institutos de educación superior.';
COMMENT ON COLUMN universidades.clave_cct IS 'Clave de Centro de Trabajo oficial asignada por la SEP.';
COMMENT ON COLUMN universidades.modalidad_preferida IS 'Modalidad comercial predilecta: Modalidad A (Programa) o Modalidad B (Escuela).';

CREATE TRIGGER disparador_actualizar_tiempo_universidades
BEFORE UPDATE ON universidades
FOR EACH ROW
EXECUTE FUNCTION funcion_actualizar_marca_tiempo();

-- ============================================================================
-- TABLA 2: CONTACTOS_UNIVERSIDAD
-- ============================================================================
CREATE TABLE contactos_universidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    universidad_id UUID NOT NULL REFERENCES universidades(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(150) NOT NULL,
    cargo_puesto VARCHAR(120) NOT NULL,
    correo_electronico VARCHAR(150) NOT NULL,
    telefono VARCHAR(50),
    extension_telefonica VARCHAR(20),
    nivel_influencia VARCHAR(50) DEFAULT 'medio',
    es_contacto_principal BOOLEAN DEFAULT false,
    ultimo_contacto_en TIMESTAMPTZ,
    notas TEXT,
    datos_adicionales JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE contactos_universidad IS 'Directorio de directores, rectores y coordinadores de vinculación por universidad.';

CREATE TRIGGER disparador_actualizar_tiempo_contactos_universidad
BEFORE UPDATE ON contactos_universidad
FOR EACH ROW
EXECUTE FUNCTION funcion_actualizar_marca_tiempo();

-- ============================================================================
-- TABLA 3: CARRERAS_UNIVERSIDAD
-- ============================================================================
CREATE TABLE carreras_universidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    universidad_id UUID NOT NULL REFERENCES universidades(id) ON DELETE CASCADE,
    nombre_carrera VARCHAR(200) NOT NULL,
    area_estudio VARCHAR(120),
    grado_academico VARCHAR(50) DEFAULT 'licenciatura',
    matricula_estimada INTEGER DEFAULT 0 CHECK (matricula_estimada >= 0),
    modalidad VARCHAR(50) DEFAULT 'presencial',
    semestres_duracion INTEGER DEFAULT 8 CHECK (semestres_duracion > 0),
    enfoque_tecnologico BOOLEAN DEFAULT true,
    datos_adicionales JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE carreras_universidad IS 'Oferta académica y planes de estudio ofrecidos por cada campus o universidad.';

CREATE TRIGGER disparador_actualizar_tiempo_carreras_universidad
BEFORE UPDATE ON carreras_universidad
FOR EACH ROW
EXECUTE FUNCTION funcion_actualizar_marca_tiempo();

-- ============================================================================
-- TABLA 4: OPORTUNIDADES
-- ============================================================================
CREATE TABLE oportunidades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    universidad_id UUID NOT NULL REFERENCES universidades(id) ON DELETE CASCADE,
    contacto_principal_id UUID REFERENCES contactos_universidad(id) ON DELETE SET NULL,
    monto_estimado NUMERIC(14, 2) DEFAULT 0 CHECK (monto_estimado >= 0),
    etapa etapa_oportunidad NOT NULL DEFAULT 'prospecto',
    probabilidad_cierre INTEGER DEFAULT 20 CHECK (probabilidad_cierre >= 0 AND probabilidad_cierre <= 100),
    fecha_cierre_esperada DATE,
    asesor_asignado VARCHAR(150),
    paquete_servicio VARCHAR(150),
    modalidad_proyecto modalidad_proyecto NOT NULL DEFAULT 'modalidad_a_programa',
    tipo_evento tipo_evento NOT NULL DEFAULT 'recorrido_comercial',
    marcas_aliadas TEXT[] DEFAULT '{}',
    contador_alumnos_registrados INTEGER NOT NULL DEFAULT 0 CHECK (contador_alumnos_registrados >= 0),
    notas TEXT,
    ultimo_cambio_etapa TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    datos_adicionales JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE oportunidades IS 'Embudo de ventas y tratos comerciales en el ciclo de vinculación universitaria.';
COMMENT ON COLUMN oportunidades.contador_alumnos_registrados IS 'Contador actualizado de forma automática por el disparador al captar alumnos.';

CREATE TRIGGER disparador_actualizar_tiempo_oportunidades
BEFORE UPDATE ON oportunidades
FOR EACH ROW
EXECUTE FUNCTION funcion_actualizar_marca_tiempo();

-- ============================================================================
-- TABLA 5: ACTIVIDADES_CRM
-- ============================================================================
CREATE TABLE actividades_crm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oportunidad_id UUID REFERENCES oportunidades(id) ON DELETE CASCADE,
    universidad_id UUID NOT NULL REFERENCES universidades(id) ON DELETE CASCADE,
    contacto_id UUID REFERENCES contactos_universidad(id) ON DELETE SET NULL,
    tipo tipo_actividad_crm NOT NULL DEFAULT 'llamada',
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_programada TIMESTAMPTZ NOT NULL,
    completada BOOLEAN DEFAULT false,
    autor VARCHAR(150) NOT NULL,
    resultado_minuta TEXT,
    datos_adicionales JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE actividades_crm IS 'Historial y agenda de llamadas, reuniones presenciales, correos y tareas.';

CREATE TRIGGER disparador_actualizar_tiempo_actividades_crm
BEFORE UPDATE ON actividades_crm
FOR EACH ROW
EXECUTE FUNCTION funcion_actualizar_marca_tiempo();

-- ============================================================================
-- TABLA 6: PROSPECTOS_ALUMNOS
-- ============================================================================
CREATE TABLE prospectos_alumnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oportunidad_id UUID REFERENCES oportunidades(id) ON DELETE CASCADE,
    universidad_id UUID NOT NULL REFERENCES universidades(id) ON DELETE CASCADE,
    carrera_id UUID REFERENCES carreras_universidad(id) ON DELETE SET NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    correo_electronico VARCHAR(150) NOT NULL,
    telefono VARCHAR(50),
    carrera_texto VARCHAR(200),
    semestre_actual INTEGER CHECK (semestre_actual > 0 AND semestre_actual <= 15),
    consentimiento_datos BOOLEAN NOT NULL DEFAULT true,
    origen_registro VARCHAR(100) DEFAULT 'codigo_qr_evento',
    estatus estatus_prospecto_alumno NOT NULL DEFAULT 'registrado',
    datos_adicionales JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE prospectos_alumnos IS 'Estudiantes captados mediante códigos QR en ferias, hackathons y conferencias.';
COMMENT ON COLUMN prospectos_alumnos.consentimiento_datos IS 'Aceptación explícita del aviso de privacidad según la LFPDPPP de México.';

CREATE TRIGGER disparador_actualizar_tiempo_prospectos_alumnos
BEFORE UPDATE ON prospectos_alumnos
FOR EACH ROW
EXECUTE FUNCTION funcion_actualizar_marca_tiempo();

-- ============================================================================
-- TABLA 7: RECORRIDOS_RUTAS
-- ============================================================================
CREATE TABLE recorridos_rutas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    asesor_responsable VARCHAR(150) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    origen_nombre VARCHAR(200) NOT NULL,
    origen_direccion TEXT NOT NULL,
    origen_latitud NUMERIC(10, 7) NOT NULL,
    origen_longitud NUMERIC(10, 7) NOT NULL,
    filtro_estado VARCHAR(100) DEFAULT 'Todos',
    distancia_total_km NUMERIC(10, 2) DEFAULT 0 CHECK (distancia_total_km >= 0),
    minutos_conduccion_total INTEGER DEFAULT 0 CHECK (minutos_conduccion_total >= 0),
    minutos_estimados_totales INTEGER DEFAULT 0 CHECK (minutos_estimados_totales >= 0),
    porcentaje_ganancia_eficiencia NUMERIC(5, 2) DEFAULT 0,
    presupuesto_gasolina_mxn NUMERIC(10, 2) DEFAULT 0 CHECK (presupuesto_gasolina_mxn >= 0),
    presupuesto_casetas_mxn NUMERIC(10, 2) DEFAULT 0 CHECK (presupuesto_casetas_mxn >= 0),
    presupuesto_alimentos_mxn NUMERIC(10, 2) DEFAULT 0 CHECK (presupuesto_alimentos_mxn >= 0),
    total_viaticos_mxn NUMERIC(10, 2) DEFAULT 0 CHECK (total_viaticos_mxn >= 0),
    estimacion_litros_combustible NUMERIC(10, 2) DEFAULT 0 CHECK (estimacion_litros_combustible >= 0),
    estimacion_dias INTEGER DEFAULT 1 CHECK (estimacion_dias >= 1),
    enlace_google_maps TEXT,
    estatus estatus_ruta NOT NULL DEFAULT 'planificada',
    datos_adicionales JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE recorridos_rutas IS 'Planificación de giras comerciales con optimización TSP de circuito cerrado y viáticos.';

CREATE TRIGGER disparador_actualizar_tiempo_recorridos_rutas
BEFORE UPDATE ON recorridos_rutas
FOR EACH ROW
EXECUTE FUNCTION funcion_actualizar_marca_tiempo();

-- ============================================================================
-- TABLA 8: PARADAS_RUTA
-- ============================================================================
CREATE TABLE paradas_ruta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recorrido_id UUID NOT NULL REFERENCES recorridos_rutas(id) ON DELETE CASCADE,
    universidad_id UUID NOT NULL REFERENCES universidades(id) ON DELETE RESTRICT,
    orden_visita INTEGER NOT NULL CHECK (orden_visita >= 1),
    distancia_desde_anterior_km NUMERIC(10, 2) DEFAULT 0 CHECK (distancia_desde_anterior_km >= 0),
    tiempo_conduccion_minutos INTEGER DEFAULT 0 CHECK (tiempo_conduccion_minutos >= 0),
    tiempo_estancia_sugerido_minutos INTEGER DEFAULT 60 CHECK (tiempo_estancia_sugerido_minutos >= 0),
    hora_reunion_recomendada TIME,
    costo_peaje_estimado_mxn NUMERIC(10, 2) DEFAULT 0 CHECK (costo_peaje_estimado_mxn >= 0),
    visitada BOOLEAN DEFAULT false,
    notas TEXT,
    datos_adicionales JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT restriccion_recorrido_orden_unico UNIQUE (recorrido_id, orden_visita)
);

COMMENT ON TABLE paradas_ruta IS 'Secuencia ordenada de paradas e instituciones universitarias dentro de un itinerario.';

CREATE TRIGGER disparador_actualizar_tiempo_paradas_ruta
BEFORE UPDATE ON paradas_ruta
FOR EACH ROW
EXECUTE FUNCTION funcion_actualizar_marca_tiempo();

-- ============================================================================
-- DISPARADOR: actualizar_contador_alumnos_oportunidad
-- ============================================================================
-- Función disparadora que recalcula el conteo real de alumnos para la oportunidad
CREATE OR REPLACE FUNCTION funcion_actualizar_contador_alumnos_oportunidad()
RETURNS TRIGGER AS $$
BEGIN
    -- Caso 1: Inserción o actualización con una oportunidad asignada
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.oportunidad_id IS NOT NULL THEN
            UPDATE oportunidades
            SET contador_alumnos_registrados = (
                SELECT COUNT(*)::INTEGER
                FROM prospectos_alumnos
                WHERE oportunidad_id = NEW.oportunidad_id
            ),
            actualizado_en = timezone('utc'::text, now())
            WHERE id = NEW.oportunidad_id;
        END IF;
    END IF;

    -- Caso 2: Eliminación o actualización que cambia la oportunidad anterior
    IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') THEN
        IF OLD.oportunidad_id IS NOT NULL AND (TG_OP = 'DELETE' OR OLD.oportunidad_id <> NEW.oportunidad_id) THEN
            UPDATE oportunidades
            SET contador_alumnos_registrados = (
                SELECT COUNT(*)::INTEGER
                FROM prospectos_alumnos
                WHERE oportunidad_id = OLD.oportunidad_id
            ),
            actualizado_en = timezone('utc'::text, now())
            WHERE id = OLD.oportunidad_id;
        END IF;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Vinculación formal del disparador a la tabla prospectos_alumnos
CREATE TRIGGER actualizar_contador_alumnos_oportunidad
AFTER INSERT OR UPDATE OF oportunidad_id OR DELETE ON prospectos_alumnos
FOR EACH ROW
EXECUTE FUNCTION funcion_actualizar_contador_alumnos_oportunidad();

-- ============================================================================
-- ÍNDICES ESTRATÉGICOS PARA CONSULTAS DE ALTO RENDIMIENTO
-- ============================================================================
CREATE INDEX idx_universidades_clave_cct ON universidades(clave_cct);
CREATE INDEX idx_universidades_estado ON universidades(estado);
CREATE INDEX idx_universidades_municipio ON universidades(municipio);
CREATE INDEX idx_universidades_estatus ON universidades(estatus);

CREATE INDEX idx_contactos_universidad_universidad_id ON contactos_universidad(universidad_id);
CREATE INDEX idx_carreras_universidad_universidad_id ON carreras_universidad(universidad_id);

CREATE INDEX idx_oportunidades_universidad_id ON oportunidades(universidad_id);
CREATE INDEX idx_oportunidades_etapa ON oportunidades(etapa);
CREATE INDEX idx_oportunidades_tipo_evento ON oportunidades(tipo_evento);

CREATE INDEX idx_actividades_crm_oportunidad_id ON actividades_crm(oportunidad_id);
CREATE INDEX idx_actividades_crm_universidad_id ON actividades_crm(universidad_id);
CREATE INDEX idx_actividades_crm_fecha ON actividades_crm(fecha_programada);

CREATE INDEX idx_prospectos_alumnos_oportunidad_id ON prospectos_alumnos(oportunidad_id);
CREATE INDEX idx_prospectos_alumnos_universidad_id ON prospectos_alumnos(universidad_id);
CREATE INDEX idx_prospectos_alumnos_correo ON prospectos_alumnos(correo_electronico);

CREATE INDEX idx_paradas_ruta_recorrido_id ON paradas_ruta(recorrido_id);
CREATE INDEX idx_paradas_ruta_universidad_id ON paradas_ruta(universidad_id);

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS)
-- ============================================================================
ALTER TABLE universidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE contactos_universidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE carreras_universidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospectos_alumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recorridos_rutas ENABLE ROW LEVEL SECURITY;
ALTER TABLE paradas_ruta ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura para usuarios del sistema y entorno local
CREATE POLICY "Permitir lectura completa a usuarios autenticados" ON universidades
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Permitir lectura de contactos a usuarios autenticados" ON contactos_universidad
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Permitir lectura de carreras a usuarios autenticados" ON carreras_universidad
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Permitir lectura de oportunidades a usuarios autenticados" ON oportunidades
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Permitir lectura de actividades a usuarios autenticados" ON actividades_crm
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Permitir lectura de prospectos a usuarios autenticados" ON prospectos_alumnos
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Permitir lectura de recorridos a usuarios autenticados" ON recorridos_rutas
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Permitir lectura de paradas a usuarios autenticados" ON paradas_ruta
    FOR SELECT TO authenticated, anon USING (true);

-- Políticas de inserción/edición para usuarios y entorno local
CREATE POLICY "Permitir modificacion total a usuarios autenticados" ON universidades
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "Permitir modificacion total de contactos a usuarios autenticados" ON contactos_universidad
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "Permitir modificacion total de carreras a usuarios autenticados" ON carreras_universidad
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "Permitir modificacion total de oportunidades a usuarios autenticados" ON oportunidades
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "Permitir modificacion total de actividades a usuarios autenticados" ON actividades_crm
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "Permitir modificacion total de recorridos a usuarios autenticados" ON recorridos_rutas
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "Permitir modificacion total de paradas a usuarios autenticados" ON paradas_ruta
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- Política especial para prospectos alumnos: Inserción anónima permitida para el escaneo de QR en eventos
CREATE POLICY "Permitir captura publica de prospectos mediante QR" ON prospectos_alumnos
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir gestion de prospectos a usuarios autenticados" ON prospectos_alumnos
    FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
