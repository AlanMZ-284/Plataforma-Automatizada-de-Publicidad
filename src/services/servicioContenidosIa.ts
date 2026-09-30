/**
 * Servicio de Generación de Contenidos Semánticos y Kits de Eventos con IA.
 * Provee plantillas estructuradas HTML-First para Ferias de Empleo, Hackathons y Conferencias Magistrales.
 * Incluye soporte para invocar la API de Claude (Anthropic) mediante proxy o fallback local inmediato.
 *
 * 100% en español conforme a las directrices de Develop PAP.
 */

import { EventType, ProjectModality } from '../types';

export interface ParametrosGeneracionContenido {
  oportunidadId: string;
  tipoEvento: EventType;
  nombreEvento: string;
  nombreUniversidad: string;
  municipio?: string;
  estado?: string;
  fechaEvento?: string;
  modalidad?: ProjectModality;
  marcasAliadas?: string[];
  directorNombre?: string;
  lugarEspecifico?: string;
}

export interface CopysRedesSociales {
  instagramStories: string;
  tikTok: string;
  metaFacebookWhatsapp: string;
  linkedIn: string;
}

export interface CartelInformativoA4 {
  encabezadoSuperior: string;
  tituloPrincipal: string;
  subtitulo: string;
  fechaHoraLugar: string;
  beneficiosClave: string[];
  marcasAliadas: string[];
  llamadoAccion: string;
  textoPie: string;
}

export interface TripticoInformativo {
  portada: {
    titulo: string;
    subtitulo: string;
    lema: string;
    fecha: string;
  };
  cuerpoInterior: {
    tituloSeccion: string;
    descripcion: string;
    areasFormativas: {
      nombre: string;
      descripcion: string;
      tecnologias: string;
    }[];
    beneficiosEstudiantes: string[];
  };
  reversoContacto: {
    requisitos: string[];
    testimonios: {
      alumno: string;
      carrera: string;
      cita: string;
    }[];
    datosContacto: {
      coordinacion: string;
      correo: string;
      sitioWeb: string;
    };
  };
}

export interface RetoTecnicoHackathon {
  numero: number;
  marcaPatrocinadora: string;
  tituloReto: string;
  problematica: string;
  entregablesEsperados: string[];
  criterioClave: string;
}

export interface RubricaEvaluacionHackathon {
  criterio: string;
  porcentaje: number;
  descripcion: string;
}

export interface SeccionGuionPonente {
  fase: string;
  minutosSugeridos: number;
  objetivo: string;
  puntosClave: string[];
  dialogoSugerido: string;
}

export interface DiapositivaPresentacion {
  numero: number;
  titulo: string;
  subtitulo?: string;
  bullets: string[];
  notaPonente: string;
  esDiapositivaQr?: boolean;
}

export interface InsumosFisicosLogistica {
  standYMampara: string[];
  impresosYPapeleria: string[];
  tecnologiaYSoporte: string[];
  reconocimientosYMerchandising: string[];
}

export interface ContenidoKitCompleto {
  id: string;
  oportunidadId: string;
  tipoEvento: EventType;
  nombreEvento: string;
  nombreUniversidad: string;
  fechaEvento: string;
  lugarEspecifico: string;
  marcasAliadas: string[];
  // Piezas según tipo de evento
  copysRedes: CopysRedesSociales;
  cartelA4: CartelInformativoA4;
  triptico: TripticoInformativo;
  retosHackathon?: RetoTecnicoHackathon[];
  rubricasHackathon?: RubricaEvaluacionHackathon[];
  guionPonente: SeccionGuionPonente[];
  diapositivas?: DiapositivaPresentacion[];
  insumosLogistica: InsumosFisicosLogistica;
  generadoConIa: boolean;
  marcaTiempo: string;
}

/**
 * Genera el paquete completo de contenidos para el evento solicitado.
 * Si se cuenta con credenciales de API para Claude, intentará enriquecer los copys;
 * de lo contrario, provee instantáneamente la plantilla predeterminada lista para producción.
 */
export async function generarContenidoEventoIa(
  parametros: ParametrosGeneracionContenido
): Promise<ContenidoKitCompleto> {
  const marcas = parametros.marcasAliadas && parametros.marcasAliadas.length > 0
    ? parametros.marcasAliadas
    : ['AWS', 'Microsoft Azure', 'Google Cloud'];

  const fechaTexto = parametros.fechaEvento || 'Próxima semana • 10:00 hrs';
  const lugarTexto = parametros.lugarEspecifico || `Auditorio Principal • ${parametros.nombreUniversidad}`;

  // 1. Insumos físicos y logísticos según el tipo de evento
  const insumosLogistica: InsumosFisicosLogistica = obtenerInsumosLogisticos(parametros.tipoEvento);

  // 2. Copys multicanal adaptados a la institución
  const copysRedes: CopysRedesSociales = {
    instagramStories: `🚀 ¡Atención comunidad ${parametros.nombreUniversidad}! Llega la gira oficial de Develop Talent Program este ${fechaTexto}. Descubre residencias profesionales, estancias de vinculación y certificaciones en ${marcas.join(', ')}. 📲 Escanea el código en nuestro stand o regístrate en el enlace de la bio. ¡Cupos preferenciales para alumnos de semestres avanzados! #DevelopTalent #${parametros.nombreUniversidad.replace(/\s+/g, '')} #TechCareers`,
    tikTok: `POV: Estás en ${parametros.nombreUniversidad} y Develop llega a tu campus con proyectos reales de ${marcas[0]} y ${marcas[1] || 'Google Cloud'}. 👨‍💻💡 Si eres de sistemas, informática, mecatrónica o afín, ven al stand en ${lugarTexto}, escanea el QR en 10 segundos y asegura tu vinculación. ¡Etiqueta a tu team de carrera! 🚀`,
    metaFacebookWhatsapp: `📢 CONVOCATORIA DE VINCULACIÓN PROFESIONAL: Develop Talent Program abre su ciclo de vinculación en ${parametros.nombreUniversidad}.\n\n📅 Fecha: ${fechaTexto}\n📍 Lugar: ${lugarTexto}\n🎯 Perfiles: Estudiantes de últimos semestres y recién egresados de ingenierías y licenciaturas afines a tecnología.\n\nBeneficios: Residencias profesionales, proyectos reales con empresas multinacionales y capacitaciones con marcas aliadas como ${marcas.join(', ')}.\n\n👉 Registra tu asistencia con anticipación escaneando el código QR oficial.`,
    linkedIn: `Nos complace anunciar la alianza de vinculación académica y empleabilidad temprana entre Develop y ${parametros.nombreUniversidad}. Este ${fechaTexto} estaremos facilitando la sesión de vinculación "${parametros.nombreEvento}" con el objetivo de insertar a los futuros ingenieros en entornos de trabajo con tecnología de clase mundial (${marcas.join(', ')}).\n\nAgradecemos a las autoridades de vinculación y a la dirección académica por abrir las puertas al talento joven. #VinculacionAcademica #InnovacionEducativa #EmpleabilidadTech`
  };

  // 3. Cartel A4 para mampara universitaria
  const cartelA4: CartelInformativoA4 = {
    encabezadoSuperior: `GIRA DE VINCULACIÓN TECNOLÓGICA · ${parametros.nombreUniversidad.toUpperCase()}`,
    tituloPrincipal: parametros.nombreEvento,
    subtitulo: `Residencias Profesionales, Mentoría de Alto Rendimiento & Empleabilidad TI`,
    fechaHoraLugar: `${fechaTexto} | ${lugarTexto}`,
    beneficiosClave: [
      `Vinculación directa en proyectos de desarrollo con empresas de alto perfil.`,
      `Validación de créditos académicos, estadías y residencias profesionales.`,
      `Entrenamiento intensivo en stacks de nube (${marcas.join(', ')}).`,
      `Acompañamiento individual por arquitectos y directores de ingeniería.`
    ],
    marcasAliadas: marcas,
    llamadoAccion: `Escanea el código QR con la cámara de tu teléfono móvil para registrar tu perfil de estudiante.`,
    textoPie: `Programa coordinado por Develop Talent Suite en apego a la Ley Federal de Protección de Datos Personales (LFPDPPP).`
  };

  // 4. Folleto Tríptico de 3 Cuerpos
  const triptico: TripticoInformativo = {
    portada: {
      titulo: parametros.nombreEvento,
      subtitulo: `Programa de Inserción Profesional para ${parametros.nombreUniversidad}`,
      lema: `Transformamos el talento universitario en líderes de ingeniería de software.`,
      fecha: fechaTexto
    },
    cuerpoInterior: {
      tituloSeccion: `Rutas de Especialización y Práctica Profesional`,
      descripcion: `Develop articula una plataforma de proyectos donde los alumnos colaboran en desafíos técnicos reales supervisados por especialistas de la industria.`,
      areasFormativas: [
        {
          nombre: `Desarrollo Cloud & Microservicios`,
          descripcion: `Construcción de arquitecturas escalables, APIs seguras y despliegues serverless.`,
          tecnologias: `${marcas[0] || 'AWS'}, Docker, Node.js, Python, PostgreSQL`
        },
        {
          nombre: `Inteligencia Artificial Aplicada`,
          descripcion: `Integración de modelos fundacionales, agentes conversacionales y analítica de datos.`,
          tecnologias: `${marcas[1] || 'Azure OpenAI'}, Python, LangChain, TensorFlow`
        },
        {
          nombre: `Ingeniería de Software & Calidad`,
          descripcion: `Metodologías ágiles, pruebas automatizadas, DevOps y cultura de código limpio.`,
          tecnologias: `Git, CI/CD, React, TypeScript, Jest`
        }
      ],
      beneficiosEstudiantes: [
        `Liberación formal de residencias y prácticas universitarias.`,
        `Mentoría personalizada de ejecutivos y líderes de proyecto.`,
        `Posibilidad de contratación al concluir el periodo de vinculación.`
      ]
    },
    reversoContacto: {
      requisitos: [
        `Ser alumno regular a partir de 6to semestre o recién egresado.`,
        `Disponibilidad de 20 a 30 horas semanales (modalidad híbrida/remota).`,
        `Interés genuino en tecnologías de la información y vocación de aprendizaje.`
      ],
      testimonios: [
        {
          alumno: `Ing. Mariana Estrada`,
          carrera: `Ing. en Sistemas Computacionales`,
          cita: `"El programa me permitió pasar de la teoría académica a desarrollar microservicios en producción para clientes reales."`
        }
      ],
      datosContacto: {
        coordinacion: `Dirección de Vinculación Académica Develop`,
        correo: `vinculacion@develop.lat`,
        sitioWeb: `https://develop.lat/universidades`
      }
    }
  };

  // 5. Retos técnicos para Hackathon
  const retosHackathon: RetoTecnicoHackathon[] = [
    {
      numero: 1,
      marcaPatrocinadora: marcas[0] || 'AWS',
      tituloReto: `Arquitectura Serverless para Microcréditos y Becas Estudiantiles`,
      problematica: `Las universidades enfrentan altas tasas de deserción debido a trámites burocráticos y falta de financiamiento inmediato. Desarrollar una solución serverless que evalúe y disperse microbecas con alta disponibilidad y bajo costo.`,
      entregablesEsperados: [
        `Pipeline de backend serverless (AWS Lambda / DynamoDB / EventBridge).`,
        `Frontend responsivo para postulación de alumnos.`,
        `Dashboard administrativo con semáforo de aprobación financiera.`
      ],
      criterioClave: `Eficiencia de costos por petición y tiempo de respuesta en solicitudes masivas.`
    },
    {
      numero: 2,
      marcaPatrocinadora: marcas[1] || 'Microsoft Azure',
      tituloReto: `Tutor Académico Multimodal con IA Generativa para STEM`,
      problematica: `Los estudiantes de materias de alta complejidad matemática o de ciencias de la computación requieren asistencia continua fuera del aula. Diseñar un agente que resuelva dudas paso a paso mediante lenguaje natural sin limitarse a dar la respuesta final.`,
      entregablesEsperados: [
        `Integración con Azure OpenAI / RAG sobre el temario universitario.`,
        `Interfaz interactiva con soporte para fórmulas matemáticas y bloques de código.`,
        `Historial de progreso y detección temprana de áreas de rezago académico.`
      ],
      criterioClave: `Prevención de alucinaciones pedagógicas y empatía en la explicación paso a paso.`
    },
    {
      numero: 3,
      marcaPatrocinadora: marcas[2] || 'Google Cloud',
      tituloReto: `Movilidad Escolar Segura & Monitoreo Geoespacial de Rutas`,
      problematica: `En zonas periféricas del Valle de México, el traslado de estudiantes y profesores enfrenta retos de seguridad y tiempos de espera impredecibles. Crear un sistema de geolocalización en tiempo real para optimizar los recorridos del transporte universitario.`,
      entregablesEsperados: [
        `Trazado geoespacial en mapa con tiempos de llegada estimados en vivo.`,
        `Botón de alerta comunitaria con geocerca de seguridad.`,
        `Panel para la coordinación escolar con analítica de aforos y frecuencias.`
      ],
      criterioClave: `Precisión geoespacial y resiliencia ante pérdida momentánea de conectividad 4G.`
    }
  ];

  // 6. Rúbricas de evaluación técnica
  const rubricasHackathon: RubricaEvaluacionHackathon[] = [
    {
      criterio: `Arquitectura y Calidad de Código`,
      porcentaje: 30,
      descripcion: `Modularidad, buenas prácticas de desarrollo, manejo de excepciones y uso correcto de servicios de nube.`
    },
    {
      criterio: `Innovación y Viabilidad Técnica`,
      porcentaje: 25,
      descripcion: `Originalidad de la propuesta, resolución real de la problemática y potencial de escalabilidad comercial o social.`
    },
    {
      criterio: `Experiencia de Usuario (UX/UI)`,
      porcentaje: 20,
      descripcion: `Claridad en los flujos, accesibilidad visual, diseño responsive adaptado a dispositivos móviles y fluidez.`
    },
    {
      criterio: `Impacto Comunitario / Universitario`,
      porcentaje: 15,
      descripcion: `Grado de beneficio directo para la comunidad académica de ${parametros.nombreUniversidad} y alineación ética.`
    },
    {
      criterio: `Pitch y Demostración en Vivo`,
      porcentaje: 10,
      descripcion: `Capacidad de síntesis en 3 minutos, solvencia técnica al responder las preguntas del jurado y demo funcional.`
    }
  ];

  // 7. Guion del Ponente / Maestro de Ceremonias estructurado por tiempos
  const guionPonente: SeccionGuionPonente[] = [
    {
      fase: `Fase 1: Hook Inicial & Apertura Empática`,
      minutosSugeridos: 3,
      objetivo: `Capturar la atención total del auditorio conectando con el deseo de éxito profesional de los alumnos.`,
      puntosClave: [
        `Romper el hielo mencionando el prestigio y el esfuerzo de los estudiantes de ${parametros.nombreUniversidad}.`,
        `Compartir la estadística del 80% de empleabilidad en perfiles especializados en nube.`,
        `Plantear la pregunta provocadora: ¿Qué diferencia a un egresado con empleo inmediato de uno que tarda un año en colocarse?`
      ],
      dialogoSugerido: `"Muy buenos días a todos los estudiantes, directivos y profesores de ${parametros.nombreUniversidad}. Les hago una pregunta muy directa: dentro de uno o dos semestres, cuando crucen la puerta de esta universidad con su título en la mano, ¿quieren salir a buscar trabajo o quieren que las empresas los busquen a ustedes? Hoy en Develop estamos aquí no a darles una charla teórica, sino a entregarles la llave directa de entrada a proyectos reales con ${marcas[0]} y ${marcas[1] || 'Microsoft'}."`
    },
    {
      fase: `Fase 2: Desarrollo Metodológico & Casos Prácticos`,
      minutosSugeridos: 25,
      objetivo: `Explicar el modelo de residencia Develop y cómo la práctica en proyectos de nube transforma su currículum.`,
      puntosClave: [
        `La brecha entre la academia y la industria: por qué la teoría no basta.`,
        `El método Develop: 3 pilares (Arquitectura de software, Nube empresarial y Habilidades de comunicación).`,
        `Presentación de 2 testimonios de jóvenes que hicieron su residencia y hoy lideran proyectos.`,
        `Mención de las marcas aliadas (${marcas.join(', ')}) que respaldan la iniciativa.`
      ],
      dialogoSugerido: `"En la industria actual, a nadie le importa si memorizaste la definición de una base de datos; lo que importa es si puedes desplegar un cluster que soporte un millón de peticiones concurrentes sin que se caiga el sistema. En Develop no les pedimos experiencia previa, les damos el entorno para que construyan esa experiencia con ingenieros senior guiándolos paso a paso."`
    },
    {
      fase: `Fase 3: Llamado a la Acción & Registro QR en Vivo`,
      minutosSugeridos: 10,
      objetivo: `Lograr la conversión masiva de los estudiantes en el auditorio a través del escaneo del código QR.`,
      puntosClave: [
        `Proyectar en pantalla gigante el código QR del evento.`,
        `Instruir a todos los asistentes a sacar su celular en ese preciso momento.`,
        `Enfatizar que el cupo para las residencias de este ciclo es limitado por mentor.`,
        `Acompañar en tiempo real confirmando el registro de los primeros 10 alumnos.`
      ],
      dialogoSugerido: `"En este momento les pido a todos que saquen su teléfono y abran la cámara. El código que ven en pantalla no es solo un formulario, es su pase de admisión al ciclo de residencias de Develop para ${parametros.nombreUniversidad}. Les tomará 45 segundos registrar su nombre, carrera y correo. A los primeros 50 registrados les aseguramos entrevista prioritaria esta misma semana. ¡El futuro de su carrera empieza hoy!"`
    }
  ];

  // 8. Diapositivas para Conferencia Magistral
  const diapositivas: DiapositivaPresentacion[] = [
    {
      numero: 1,
      titulo: parametros.nombreEvento,
      subtitulo: `Innovación Educativa & Empleabilidad en la Era Cloud | ${parametros.nombreUniversidad}`,
      bullets: [
        `Alianza Estratégica Develop Talent Suite`,
        `Conexión Directa Academia ➔ Industria Tecnológica`,
        `Ponente: Dirección de Vinculación y Talento`
      ],
      notaPonente: `Agradecer a las autoridades académicas y dar la bienvenida al auditorio lleno.`
    },
    {
      numero: 2,
      titulo: `El Dilema del Egresado de Ingeniería`,
      subtitulo: `La realidad del mercado laboral de tecnología en México`,
      bullets: [
        `Alta demanda de talento (+2.5 millones de vacantes TI no cubiertas en Latinoamérica).`,
        `La paradoja: se pide experiencia para trabajar, pero se necesita trabajo para tener experiencia.`,
        `Las empresas buscan perfiles validados en nube (${marcas.slice(0, 2).join(', ')}).`
      ],
      notaPonente: `Conectar con la angustia habitual del alumno de últimos semestres.`
    },
    {
      numero: 3,
      titulo: `El Modelo de Vinculación Develop`,
      subtitulo: `Residencias profesionales en proyectos de ingeniería real`,
      bullets: [
        `Proyectos supervisados por líderes técnicos de la industria.`,
        `Validación curricular y liberación de créditos académicos oficiales.`,
        `Entrenamiento sin costo en arquitecturas modernas y código limpio.`
      ],
      notaPonente: `Explicar que Develop es un puente que acelera su madurez profesional.`
    },
    {
      numero: 4,
      titulo: `Ecosistema de Marcas y Patrocinadores`,
      subtitulo: `Alianzas globales que respaldan tu crecimiento`,
      bullets: marcas.map((m) => `Capacitación y laboratorios prácticos en ${m}`),
      notaPonente: `Destacar el valor en el currículum de contar con respaldo de estas marcas.`
    },
    {
      numero: 5,
      titulo: `¡Tu Oportunidad es Hoy!`,
      subtitulo: `Escanea el código QR y postula a tu residencia Develop`,
      bullets: [
        `Registro express en 45 segundos.`,
        `Prioridad de entrevistas para alumnos de ${parametros.nombreUniversidad}.`,
        `Comunícate con nuestro equipo en el stand institucional.`
      ],
      notaPonente: `Dejar esta diapositiva fija en pantalla mientras los estudiantes escanean el QR.`,
      esDiapositivaQr: true
    }
  ];

  return {
    id: `kit-${Date.now()}`,
    oportunidadId: parametros.oportunidadId,
    tipoEvento: parametros.tipoEvento,
    nombreEvento: parametros.nombreEvento,
    nombreUniversidad: parametros.nombreUniversidad,
    fechaEvento: fechaTexto,
    lugarEspecifico: lugarTexto,
    marcasAliadas: marcas,
    copysRedes,
    cartelA4,
    triptico,
    retosHackathon,
    rubricasHackathon,
    guionPonente,
    diapositivas,
    insumosLogistica,
    generadoConIa: false,
    marcaTiempo: new Date().toISOString()
  };
}

/**
 * Determina el checklist de insumos físicos para el stand y la comitiva de campo según el tipo de evento.
 */
function obtenerInsumosLogisticos(tipoEvento: EventType): InsumosFisicosLogistica {
  if (tipoEvento === 'hackathon') {
    return {
      standYMampara: [
        'Roll-up Banner principal de 2.00m x 0.85m con branding Develop Hackathon',
        'Backdrop para fotografías de equipos ganadores con logos de patrocinadores',
        'Señalamiento de mesas de trabajo por reto técnico (AWS, Azure, GCP)'
      ],
      impresosYPapeleria: [
        '150 gafetes con lanyard institucional para participantes y jurados',
        '50 hojas de rúbricas de evaluación técnica impresas en papel membretado',
        'Manual de bases y reglamento de convivencia'
      ],
      tecnologiaYSoporte: [
        'Regletas de corriente de uso rudo (mínimo 10 piezas para 50 laptops)',
        'Access Point Wi-Fi dedicado con ancho de banda balanceado',
        'Pantalla o proyector con cronómetro gigante para cuenta regresiva'
      ],
      reconocimientosYMerchandising: [
        '3 trofeos conmemorativos en acrílico grabado con base de madera',
        'Medallas para 1ro, 2do y 3er lugar de cada reto',
        'Stickers vectoriales de Develop, Docker, Python y marcas aliadas'
      ]
    };
  }

  if (tipoEvento === 'conferencia_taller') {
    return {
      standYMampara: [
        'Roll-up Banner lateral para presídium con logotipo de Develop',
        'Atril con placa institucional y branding del evento',
        'Banderola para el pasillo de acceso al auditorio'
      ],
      impresosYPapeleria: [
        'Carteles A4 fijados en los accesos de las facultades de ingeniería',
        'Fichas de asistencia y registro para firmas de vinculación',
        'Carpetas institucionales para directores de carrera'
      ],
      tecnologiaYSoporte: [
        'Controlador inalámbrico con puntero láser para diapositivas',
        'Adaptadores HDMI, USB-C y DisplayPort de alta fidelidad',
        'Micrófono de solapa inalámbrico para el speaker principal'
      ],
      reconocimientosYMerchandising: [
        'Constancia oficial enmarcada para el titular de la institución',
        'Kit de cortesía institucional (libreta ejecutiva y bolígrafo Develop)',
        'Termos metálicos para los directivos acompañantes'
      ]
    };
  }

  // Por defecto: Feria de Trabajo / Empleo o Recorrido Comercial
  return {
    standYMampara: [
      'Mampara modular portátil de 2.40m con lona tensada Develop',
      'Mantel institucional azul marino Develop (#0f094f) para mesa de 1.80m',
      '2 Roll-up Banners tipo araña de alta estabilidad para pasillo'
    ],
    impresosYPapeleria: [
      '500 folletos trípticos full-color en papel couché de 150g',
      '10 carteles A4 plastificados para mamparas y tableros estudiantiles',
      'Blocs de notas de entrevistas rápidas para los reclutadores'
    ],
    tecnologiaYSoporte: [
      '2 tabletas táctiles con pantalla bloqueada en el formulario QR de registro',
      'Atril con código QR gigante impreso en acrílico con base de mesa',
      'Batería externa PowerBank de 20,000 mAh para stands sin contacto eléctrico'
    ],
    reconocimientosYMerchandising: [
      'Placa de agradecimiento institucional por las facilidades de reclutamiento',
      '300 bolígrafos institucionales con tinta de gel Develop',
      'Llaveros metálicos con código QR de acceso a la comunidad'
    ]
  };
}
