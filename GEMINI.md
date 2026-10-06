# REGLAS MAESTRAS DEL PROYECTO: PLATAFORMA AUTOMATIZADA DE PUBLICIDAD (PAP)

Este archivo es la **fuente única de verdad inmutable y regla obligatoria de sistema** para todo agente, subagente o modelo que opere en la Plataforma Automatizada de Publicidad (PAP) de Develop (tanto en el chat IDE como en Antigravity CLI).

---

## 1. FUENTES DE VERDAD OBLIGATORIAS (CONSULTA PREVIA OBLIGATORIA)

Antes de proponer, diseñar, codificar o refactorizar cualquier archivo, el agente **DEBE consultar e interpretar activamente** los siguientes documentos de referencia del proyecto:

1. **Propuesta Canónica de Negocio y Fases:**
   - **Ruta:** [`documentos/PROPUESTA_DEFINITIVA_PAP.md`](file:///c:/Users/alanm/pruebas/CRM/documentos/PROPUESTA_DEFINITIVA_PAP.md)
   - **Mandato:** El agente debe contrastar cualquier requerimiento con las Secciones 3 ("Arquitectura Funcional") y 7 ("Segmentación del Desarrollo por Fases") para saber **exactamente qué se espera y qué NO forma parte de la fase actual**.

2. **Guía Oficial de Identidad Visual Develop:**
   - **Ruta:** [`documentos/guia-identidad-visual-develop.md`](file:///c:/Users/alanm/pruebas/CRM/documentos/guia-identidad-visual-develop.md)
   - **Mandato:** Antes de tocar o crear estilos visuales, el agente debe validar: paleta oficial (`#07052e`, `#0f094f`, `#29008e`, `#640354`, `#a78bfa`, `#f472b6`, `#F8F8FC`), bordes redondeados (`rounded-2xl` a `rounded-3xl` / 20-28px), fondos operativos claros y superficies dark premium para impacto.

3. **Esquema Canónico de Base de Datos:**
   - **Rutas:** [`src/types/base_datos_supabase.ts`](file:///c:/Users/alanm/pruebas/CRM/src/types/base_datos_supabase.ts) y [`src/types/base_datos.ts`](file:///c:/Users/alanm/pruebas/CRM/src/types/base_datos.ts)
   - **Mandato:** Respetar los tipos generados de PostgreSQL local en Supabase, tablas en español y nombres en snake_case.

4. **Memoria Técnica y Bitácora del Proyecto:**
   - **Ruta:** [`documentos/MEMORIA_DEL_PROYECTO.md`](file:///c:/Users/alanm/pruebas/CRM/documentos/MEMORIA_DEL_PROYECTO.md)
   - **Mandato:** Consultar el inventario de lo construido, antecedentes de gobernanza y tareas pendientes de la Fase 1 antes de planificar cualquier cambio.

---

## 2. ALCANCE CONGELADO: FASE 1 (MVP PUNTO A PUNTO B2B2C)

> [!IMPORTANT]
> **PROHIBICIÓN EXPRESA DE SALTO DE FASES:**
> Queda terminantemente prohibido avanzar, codificar, modificar o sugerir características pertenecientes a Fases posteriores a menos que el usuario lo solicite explícitamente por escrito.

### Lista Negra de Archivos Protegidos (NO TOCAR):
Los siguientes archivos pertenecen a fases posteriores y está estrictamente prohibido modificarlos, refactorizarlos o borrarlos durante la Fase 1:
- `src/components/marketing/MarketingAutomationModule.tsx` *(Fase 3: Automatización)*
- `src/components/analytics/ExecutiveRoiDashboard.tsx` *(Fase 4: Analítica de Dirección)*
- `src/services/servicioMarketing.ts` *(Fase 3: Redes Sociales y Meta)*
- `src/services/servicioContenidosIa.ts` *(Fase 2: Motor Claude de Contenidos)*

### Alcance Permitido de la Fase 1 (Circuito Completo B2B2C):
El MVP debe cerrar exclusivamente el flujo de ventas entre la institución y el alumno:
1. **Directorio Institucional 360° (B2B):** Ingesta masiva Excel/CSV tolerante a esquema (`datos_adicionales JSONB`), alta manual y edición de datos en modo Superusuario.
2. **Pipeline Comercial (Acuerdos):** Tablero Kanban en 6 etapas (`prospecto` ➔ `contacto` ➔ `propuesta` ➔ `agendado` ➔ `realizado` ➔ `resultado`) con tarjetas de altura idéntica uniforme (`h-[395px]`).
3. **Planificador Logístico de Rutas:** Cálculo de circuitos de visita y horarios estimados a campus agendados.
4. **Captura QR de Alumnos (B2C):** Formulario para registrar prospectos estudiantiles en el stand del campus en tiempo real (`prospectos_alumnos`).
5. **Gestión y Consulta de Alumnos en CRM:** Visualización, filtrado y seguimiento del talento captado dentro del Expediente 360° de la escuela y en las tarjetas del Pipeline.

---

## 3. DIRECTIVAS ESTRICTAS DE DESARROLLO

1. **Partición Atómica de Tareas (Una cosa a la vez):**
   - El agente ejecutor (CLI) debe modificar como máximo **1 o 2 archivos por instrucción**.
   - Prohibido hacer refactors masivos o tocar archivos que no fueron expresamente solicitados en el prompt.
   - Cada paso debe compilar limpiamente con `npm run build` antes de pasar al siguiente.

2. **Idioma y Nomenclatura 100% en Español:**
   - Todas las tablas, campos de base de datos, tipos de TypeScript de negocio, comentarios y textos visibles en la interfaz deben redactarse en español neutro profesional.
   - Cero términos en spanglish o inglés en la lógica de negocio (usar `universidades`, `contactos_universidad`, `prospectos_alumnos`, etc.).

3. **Fidelidad Absoluta de Datos (Cero Información Falsa):**
   - Prohibido rellenar campos con números inventados o correos simulados (nunca usar matrículas artificiales de 1,200 ni colegiaturas de $2,800).
   - Escuelas públicas con colegiatura 0 deben mostrarse con la etiqueta `"Pública / Sin colegiatura"`.
   - Campos vacíos deben indicar con honestidad `"Sin registrar"`, `"Sin correo registrado"` o `"Sin titular registrado"`.

4. **Identidad Visual y Cero Emojis:**
   - **PROHIBIDO EL USO DE EMOJIS en la interfaz formal:** No usar 📅, 🚀, 🏆, ★, 📦, ⛔, 📍, 🕒, 👤, 🏁 en botones, encabezados, cards o tags.
   - Usar exclusivamente iconos vectoriales de **Lucide React** (`stroke-width: 1.5 - 2px`).
   - Barra lateral fija izquierda (`w-64`, `#07052e`) con 4 pilares: Pipeline, Directorio 360°, Rutas y Kits IA.

5. **Persistencia Híbrida y Resiliencia:**
   - La base de datos primaria es **PostgreSQL local en Supabase** (puertos 44321 API / 44322 DB).
   - Mantener sincronizado el respaldo seguro en `localStorage` para garantizar tolerancia ante contingencias de red.

6. **Verificación Manual Obligatoria Orientada al Usuario Final:**
   - En cada tarea completada, el agente orquestador/auditor DEBE proporcionar una guía de prueba manual clara, intuitiva y paso a paso.
   - No basta con reportar que el código compila técnicamente; el usuario debe poder probar, entender y experimentar el avance en su navegador como lo haría un usuario final real, garantizando usabilidad e intuición total.

---

## 4. CHECKLIST OBLIGATORIO ANTES DE ENTREGAR CADA TAREA

Antes de que cualquier agente reporte una tarea como finalizada, DEBE cumplir este checklist:
- `[ ]` **Compilación Exitosa:** Ejecutar `npm run build` y obtener 0 errores.
- `[ ]` **Alcance Respetado:** Ejecutar `git status` y comprobar que solo se modificaron los 1 o 2 archivos asignados.
- `[ ]` **Cero Emojis:** Verificar que el archivo modificado no introdujo ningún emoji en elementos visuales.
- `[ ]` **Alineación con la Propuesta:** Verificar que el cambio implementado se apegue a `documentos/PROPUESTA_DEFINITIVA_PAP.md`.
- `[ ]` **Diseño Develop:** Verificar que la interfaz cumpla con `documentos/guia-identidad-visual-develop.md`.
- `[ ]` **Guía de Prueba Manual Entregada:** Proveer instrucciones paso a paso para que el usuario compruebe el cambio con sus propios ojos de forma intuitiva.

---

## 5. GOBERNANZA Y DESBLOQUEO DE FASES FUTURAS

Este archivo **NO se actualiza de forma automática**. Funciona como un candado deliberado:
- La **Fase 1 (MVP Punto a Punto B2B2C)** se mantendrá activa hasta que el usuario y su asesor validen formalmente el cierre de este ciclo.
- Únicamente tras la aprobación explícita del usuario, se modificará este archivo para abrir el alcance de la **Fase 2** y congelar los componentes previos.
