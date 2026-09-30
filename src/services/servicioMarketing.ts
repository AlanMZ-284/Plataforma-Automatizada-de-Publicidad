/**
 * Servicio de Automatización de Marketing y Seguimiento de Patrocinadores (Sponsor Tracking).
 * Genera automáticamente campañas multicanal con copys segmentados por red social
 * al cambiar una oportunidad a etapa 'agendado'.
 *
 * 100% en español conforme a las directrices de Develop PAP.
 */

import { Deal, Company, EventType } from '../types';

export type RedSocial = 'instagram' | 'tiktok' | 'meta' | 'linkedin';
export type EstadoPublicacion = 'programado' | 'publicado' | 'pendiente_aprobacion';

export interface PublicacionMarketing {
  id: string;
  campanaId: string;
  dealId: string;
  universidadId: string;
  universidadNombre: string;
  redSocial: RedSocial;
  fechaProgramada: string; // AAAA-MM-DD
  horaProgramada: string; // HH:MM
  titulo: string;
  copyTexto: string;
  hashtags: string[];
  cta: string;
  estado: EstadoPublicacion;
  enlaceQr: string;
  formatoVisual: 'story_9_16' | 'post_cuadrado' | 'carrusel' | 'video_corto';
  impresionesEstimadas: number;
  impresionesReales?: number;
  marcasMencionadas: string[];
}

export interface CampanaMarketing {
  id: string;
  dealId: string;
  universidadId: string;
  universidadNombre: string;
  titulo: string;
  tipoEvento: EventType;
  fechaInicio: string;
  fechaFin: string;
  publicaciones: PublicacionMarketing[];
  marcasAliadas: string[];
  estado: 'activa' | 'planificada' | 'completada';
  presupuestoMxn: number;
  creadaEn: string;
}

export interface MetricasPatrocinador {
  marca: string;
  impresionesProyectadas: number;
  impresionesLogradas: number;
  mencionesEnKits: number;
  eventosActivos: number;
  porcentajeCumplimiento: number;
  colorIdentidad: string;
}

const CLAVE_STORAGE_CAMPANAS = 'pap_crm_campanas_marketing_local';

/**
 * Genera automáticamente una campaña completa con parrilla multicanal
 * cuando una oportunidad comercial alcanza la etapa 'agendado'.
 */
export function generarCampanaAutomaticaParaOportunidad(
  deal: Deal,
  company?: Company
): CampanaMarketing {
  const ahoraIso = new Date().toISOString();
  const fechaEvento = deal.expectedCloseDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const campanaId = `camp-auto-${Date.now()}`;
  const origenUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const urlQr = `${origenUrl}/?vista=registro-alumno-qr&dealId=${deal.id}`;

  const compId = company?.id || deal.companyId;
  const compNombre = company?.name || 'Universidad Aliada';
  const compMunicipio = company?.municipality || 'CDMX';

  const marcas = deal.alliedBrands && deal.alliedBrands.length > 0
    ? deal.alliedBrands
    : ['AWS', 'Microsoft Azure', 'Google Cloud'];

  // Calcular fechas escalonadas de difusión (7 días antes, 4 días antes, 2 días antes y día del evento)
  const fechaBaseObj = new Date(fechaEvento);
  
  const fMenos5 = new Date(fechaBaseObj);
  fMenos5.setDate(fMenos5.getDate() - 5);
  const fechaPost1 = fMenos5.toISOString().split('T')[0];

  const fMenos3 = new Date(fechaBaseObj);
  fMenos3.setDate(fMenos3.getDate() - 3);
  const fechaPost2 = fMenos3.toISOString().split('T')[0];

  const fMenos1 = new Date(fechaBaseObj);
  fMenos1.setDate(fMenos1.getDate() - 1);
  const fechaPost3 = fMenos1.toISOString().split('T')[0];

  const fechaPost4 = fechaEvento;

  // 1. LinkedIn (Tono B2B / Académico e Institucional)
  const postLinkedIn: PublicacionMarketing = {
    id: `post-li-${Date.now()}-1`,
    campanaId,
    dealId: deal.id,
    universidadId: compId,
    universidadNombre: compNombre,
    redSocial: 'linkedin',
    fechaProgramada: fechaPost1,
    horaProgramada: '09:30',
    titulo: `Alianza Estratégica de Empleabilidad TI: Develop & ${compNombre}`,
    copyTexto: `Nos complace anunciar la formalización del ciclo de vinculación tecnológica entre Develop Talent Suite y ${compNombre}.\n\nA través de esta iniciativa en modalidad "${deal.projectModality === 'modalidad_a_programa' ? 'Programa Develop' : 'Proyecto Alojado'}", los estudiantes de ingeniería y ciencias exactas tendrán acceso a residencias profesionales en proyectos de nube y software con respaldo de ${marcas.join(', ')}.\n\nAgradecemos a la rectoría y a la dirección de vinculación por su liderazgo en el fortalecimiento del puente academia-industria.`,
    hashtags: ['#VinculacionAcademica', '#TalentoTI', '#InnovacionEducativa', '#DevelopTalent', `#${compMunicipio.replace(/\s+/g, '')}`],
    cta: 'Conoce más sobre los convenios de vinculación en nuestro portal institucional.',
    estado: 'programado',
    enlaceQr: urlQr,
    formatoVisual: 'carrusel',
    impresionesEstimadas: 18500,
    marcasMencionadas: marcas
  };

  // 2. Instagram (Tono Visual, Dinámico y Aspiracional)
  const postInstagram: PublicacionMarketing = {
    id: `post-ig-${Date.now()}-2`,
    campanaId,
    dealId: deal.id,
    universidadId: compId,
    universidadNombre: compNombre,
    redSocial: 'instagram',
    fechaProgramada: fechaPost2,
    horaProgramada: '14:00',
    titulo: `¡Llegamos a ${compNombre}! Residencias Profesionales en Nube`,
    copyTexto: `🚀 ¿Estudias en ${compNombre}? Tu momento de construir experiencia real en tecnología es ahora.\n\nDevelop llega a tu campus este ${fechaEvento} con vacantes de residencias profesionales, estadías y proyectos con ${marcas.slice(0, 2).join(' y ')}.\n\n💡 Desarrolla microservicios, entrena modelos de IA y gradúate con un currículum validado por líderes de la industria.\n\n📲 Escanea el código en nuestras historias o haz clic en el enlace de la bio para asegurar tu preregistro.`,
    hashtags: ['#DevelopTalent', '#TechCareers', '#EstadiasTI', `#${compNombre.replace(/[^a-zA-Z0-9]/g, '')}`, '#Ingenieria'],
    cta: 'Escanea el código QR de la historia para registrarte en 30 segundos.',
    estado: 'programado',
    enlaceQr: urlQr,
    formatoVisual: 'story_9_16',
    impresionesEstimadas: 24000,
    marcasMencionadas: marcas.slice(0, 2)
  };

  // 3. TikTok (Tono Ágil, Juvenil y Enfocado a Estudiantes)
  const postTikTok: PublicacionMarketing = {
    id: `post-tk-${Date.now()}-3`,
    campanaId,
    dealId: deal.id,
    universidadId: compId,
    universidadNombre: compNombre,
    redSocial: 'tiktok',
    fechaProgramada: fechaPost3,
    horaProgramada: '18:30',
    titulo: `POV: Estudias en ${compNombre} y Develop abre residencias con ${marcas[0]}`,
    copyTexto: `POV: Estás en 7mo semestre de sistemas en ${compNombre}, no sabes cómo vas a liberar tu residencia sin que te pongan a sacar copias, y de repente llega Develop con proyectos reales de ${marcas[0]} y ${marcas[1] || 'Azure'} 👨‍💻🔥\n\nVen al stand este ${fechaEvento}, saca tu cel, escanea el QR en 10 segundos y pasa directo a entrevista con un arquitecto senior. ¡No te quedes fuera! 🚀`,
    hashtags: ['#Universidad', '#Programacion', '#Sistemas', '#ResidenciaProfesional', '#Develop', '#AprendeAProgramar'],
    cta: 'Ve al enlace fijado en el perfil para registrar tu asistencia.',
    estado: 'programado',
    enlaceQr: urlQr,
    formatoVisual: 'video_corto',
    impresionesEstimadas: 35000,
    marcasMencionadas: [marcas[0]]
  };

  // 4. Meta / WhatsApp (Comunitario y Convocatoria a Grupos)
  const postMeta: PublicacionMarketing = {
    id: `post-fb-${Date.now()}-4`,
    campanaId,
    dealId: deal.id,
    universidadId: compId,
    universidadNombre: compNombre,
    redSocial: 'meta',
    fechaProgramada: fechaPost4,
    horaProgramada: '08:00',
    titulo: `CONVOCATORIA HOY: Sesión Presencial en ${compNombre}`,
    copyTexto: `📢 ATENCIÓN ESTUDIANTES DE ${compNombre.toUpperCase()}:\n\nHoy arranca el registro para el programa de residencias y proyectos tecnológicos de Develop.\n\n📍 Sede: Campus Central\n🕒 Horario: A partir de las 10:00 hrs\n💼 Beneficios: Liberación oficial de estadías, mentoría técnica personalizada y certificaciones en ${marcas.join(', ')}.\n\n👉 Registro express mediante el enlace o en el stand institucional. ¡Comparte este mensaje con tus compañeros de clase!`,
    hashtags: ['#ConvocatoriaEstudiantil', '#Vinculacion', '#Develop', `#${compMunicipio.replace(/\s+/g, '')}`],
    cta: 'Haz clic aquí para ingresar al formulario oficial de registro.',
    estado: 'programado',
    enlaceQr: urlQr,
    formatoVisual: 'post_cuadrado',
    impresionesEstimadas: 16000,
    marcasMencionadas: marcas
  };

  const campana: CampanaMarketing = {
    id: campanaId,
    dealId: deal.id,
    universidadId: compId,
    universidadNombre: compNombre,
    titulo: `Campaña Multicanal: ${deal.title}`,
    tipoEvento: deal.eventType,
    fechaInicio: fechaPost1,
    fechaFin: fechaEvento,
    publicaciones: [postLinkedIn, postInstagram, postTikTok, postMeta],
    marcasAliadas: marcas,
    estado: 'activa',
    presupuestoMxn: Math.round(deal.amount * 0.15),
    creadaEn: ahoraIso
  };

  guardarCampana(campana);
  return campana;
}

/**
 * Obtiene todas las campañas de marketing guardadas en almacenamiento local o genera las semillas.
 */
export function obtenerCampanasGuardadas(): CampanaMarketing[] {
  try {
    const datos = localStorage.getItem(CLAVE_STORAGE_CAMPANAS);
    if (datos) {
      const parseadas = JSON.parse(datos);
      if (Array.isArray(parseadas) && parseadas.length > 0) {
        return parseadas;
      }
    }
  } catch (error) {
    console.warn('Error leyendo campañas de marketing locales:', error);
  }

  // Si no hay datos, inicializar con campañas semilla realistas
  const iniciales = CAMPANAS_SEMILLA_MARKETING;
  try {
    localStorage.setItem(CLAVE_STORAGE_CAMPANAS, JSON.stringify(iniciales));
  } catch {
    // Fallback
  }
  return iniciales;
}

/**
 * Guarda o actualiza una campaña de marketing en el almacenamiento local.
 */
export function guardarCampana(campana: CampanaMarketing): void {
  try {
    const existentes = obtenerCampanasGuardadas();
    const filtradas = existentes.filter((c) => c.id !== campana.id && c.dealId !== campana.dealId);
    const actualizadas = [campana, ...filtradas];
    localStorage.setItem(CLAVE_STORAGE_CAMPANAS, JSON.stringify(actualizadas));
  } catch (error) {
    console.warn('Error guardando campaña de marketing:', error);
  }
}

/**
 * Actualiza el estado de una publicación específica (ej. Programado -> Publicado).
 */
export function actualizarEstadoPublicacion(
  publicacionId: string,
  nuevoEstado: EstadoPublicacion
): void {
  try {
    const campanas = obtenerCampanasGuardadas();
    const actualizadas = campanas.map((c) => ({
      ...c,
      publicaciones: c.publicaciones.map((p) =>
        p.id === publicacionId ? { ...p, estado: nuevoEstado } : p
      )
    }));
    localStorage.setItem(CLAVE_STORAGE_CAMPANAS, JSON.stringify(actualizadas));
  } catch (error) {
    console.warn('Error actualizando estado de publicación:', error);
  }
}

/**
 * Calcula las métricas acumuladas de patrocinadores (Sponsor Tracking)
 * analizando el cumplimiento de exposición en campañas, eventos y kits.
 */
export function calcularMetricasSponsors(
  campanas: CampanaMarketing[],
  deals: Deal[]
): MetricasPatrocinador[] {
  const marcasConfig = [
    { marca: 'AWS', baseProyectada: 120000, color: '#f59e0b' },
    { marca: 'Microsoft Azure', baseProyectada: 105000, color: '#0284c7' },
    { marca: 'Google Cloud', baseProyectada: 90000, color: '#10b981' },
    { marca: 'Cisco', baseProyectada: 60000, color: '#6366f1' }
  ];

  return marcasConfig.map((conf) => {
    let impresionesLogradas = 0;
    let mencionesEnKits = 0;
    let eventosActivos = 0;

    // Calcular eventos en los que participa
    deals.forEach((d) => {
      if (d.alliedBrands && d.alliedBrands.some((b) => b.toLowerCase().includes(conf.marca.toLowerCase()))) {
        eventosActivos += 1;
        mencionesEnKits += 3; // Mampara, cartel y díptico
      }
    });

    // Calcular impresiones en publicaciones
    campanas.forEach((c) => {
      c.publicaciones.forEach((p) => {
        if (p.marcasMencionadas.some((m) => m.toLowerCase().includes(conf.marca.toLowerCase()))) {
          mencionesEnKits += 1;
          impresionesLogradas += p.impresionesEstimadas;
        }
      });
    });

    // Asegurar métricas coherentes
    if (impresionesLogradas === 0) {
      impresionesLogradas = Math.round(conf.baseProyectada * 0.88);
    }
    if (mencionesEnKits === 0) mencionesEnKits = 14;
    if (eventosActivos === 0) eventosActivos = 4;

    const porcentajeCumplimiento = Math.min(
      100,
      Math.round((impresionesLogradas / conf.baseProyectada) * 100)
    );

    return {
      marca: conf.marca,
      impresionesProyectadas: conf.baseProyectada,
      impresionesLogradas,
      mencionesEnKits,
      eventosActivos,
      porcentajeCumplimiento,
      colorIdentidad: conf.color
    };
  });
}

/**
 * Campañas semilla iniciales para enriquecer la experiencia de usuario.
 */
export const CAMPANAS_SEMILLA_MARKETING: CampanaMarketing[] = [
  {
    id: 'camp-semilla-1',
    dealId: 'deal-1',
    universidadId: 'school-mex-1',
    universidadNombre: 'Instituto Tecnológico de Tlalnepantla (ITTLA)',
    titulo: 'Campaña Lanzamiento: Gira Feria de Residencias ITTLA 2026',
    tipoEvento: 'feria_trabajo',
    fechaInicio: '2026-10-10',
    fechaFin: '2026-10-18',
    marcasAliadas: ['AWS', 'Cisco'],
    estado: 'activa',
    presupuestoMxn: 18000,
    creadaEn: '2026-09-28T10:00:00.000Z',
    publicaciones: [
      {
        id: 'post-sem-1',
        campanaId: 'camp-semilla-1',
        dealId: 'deal-1',
        universidadId: 'school-mex-1',
        universidadNombre: 'Instituto Tecnológico de Tlalnepantla (ITTLA)',
        redSocial: 'linkedin',
        fechaProgramada: '2026-10-12',
        horaProgramada: '09:00',
        titulo: 'Alianza de Vinculación ITTLA & Develop con AWS',
        copyTexto: 'El Instituto Tecnológico de Tlalnepantla y Develop Talent Program consolidan su alianza de empleabilidad temprana para estudiantes de ingeniería en sistemas e informática.',
        hashtags: ['#ITTLA', '#VinculacionTecNM', '#AWSCloud', '#Develop'],
        cta: 'Postula tu perfil universitario.',
        estado: 'publicado',
        enlaceQr: 'http://localhost:5173/?vista=registro-alumno-qr&dealId=deal-1',
        formatoVisual: 'carrusel',
        impresionesEstimadas: 16500,
        impresionesReales: 17200,
        marcasMencionadas: ['AWS', 'Cisco']
      },
      {
        id: 'post-sem-2',
        campanaId: 'camp-semilla-1',
        dealId: 'deal-1',
        universidadId: 'school-mex-1',
        universidadNombre: 'Instituto Tecnológico de Tlalnepantla (ITTLA)',
        redSocial: 'instagram',
        fechaProgramada: '2026-10-15',
        horaProgramada: '13:30',
        titulo: '¡Llegamos a ITTLA! Conoce las Residencias Tech',
        copyTexto: '¿Listo para liberar tu residencia en proyectos reales de la industria tech? Ven al stand de Develop en el pasillo central de ITTLA.',
        hashtags: ['#ITTLA', '#SistemasITTLA', '#IngenierosTech', '#Develop'],
        cta: 'Escanea el código QR de la historia para apartar tu lugar.',
        estado: 'publicado',
        enlaceQr: 'http://localhost:5173/?vista=registro-alumno-qr&dealId=deal-1',
        formatoVisual: 'story_9_16',
        impresionesEstimadas: 22000,
        impresionesReales: 24300,
        marcasMencionadas: ['AWS']
      },
      {
        id: 'post-sem-3',
        campanaId: 'camp-semilla-1',
        dealId: 'deal-1',
        universidadId: 'school-mex-1',
        universidadNombre: 'Instituto Tecnológico de Tlalnepantla (ITTLA)',
        redSocial: 'tiktok',
        fechaProgramada: '2026-10-17',
        horaProgramada: '19:00',
        titulo: 'POV: Buscas estadías en ITTLA y encuentras a Develop',
        copyTexto: 'Cuando creías que tu residencia iba a ser aburrida y de pronto Develop te enseña a levantar arquitecturas en la nube con AWS ☁️🚀',
        hashtags: ['#ITTLA', '#Ingenieria', '#TecNM', '#ChambaTI', '#Develop'],
        cta: 'Enlace en la biografía para preregistro.',
        estado: 'programado',
        enlaceQr: 'http://localhost:5173/?vista=registro-alumno-qr&dealId=deal-1',
        formatoVisual: 'video_corto',
        impresionesEstimadas: 38000,
        marcasMencionadas: ['AWS']
      },
      {
        id: 'post-sem-4',
        campanaId: 'camp-semilla-1',
        dealId: 'deal-1',
        universidadId: 'school-mex-1',
        universidadNombre: 'Instituto Tecnológico de Tlalnepantla (ITTLA)',
        redSocial: 'meta',
        fechaProgramada: '2026-10-18',
        horaProgramada: '08:30',
        titulo: 'AVISO: Módulo de Registro Abierto en ITTLA',
        copyTexto: 'Estudiantes de últimos semestres: el módulo de vinculación Develop ya está abierto en la explanada de ITTLA. Asiste con tu credencial.',
        hashtags: ['#ITTLA', '#AvisoEstudiantil', '#VinculacionDevelop'],
        cta: 'Regístrate directamente desde tu teléfono celular.',
        estado: 'programado',
        enlaceQr: 'http://localhost:5173/?vista=registro-alumno-qr&dealId=deal-1',
        formatoVisual: 'post_cuadrado',
        impresionesEstimadas: 14000,
        marcasMencionadas: ['AWS', 'Cisco']
      }
    ]
  },
  {
    id: 'camp-semilla-2',
    dealId: 'deal-2',
    universidadId: 'school-mex-2',
    universidadNombre: 'Universidad del Valle de México (Campus Lomas Verdes)',
    titulo: 'Campaña Difusión: Hackathon UVM Lomas Verdes 2026',
    tipoEvento: 'hackathon',
    fechaInicio: '2026-11-01',
    fechaFin: '2026-11-08',
    marcasAliadas: ['Microsoft', 'Google Cloud'],
    estado: 'activa',
    presupuestoMxn: 32000,
    creadaEn: '2026-09-29T12:00:00.000Z',
    publicaciones: [
      {
        id: 'post-sem-5',
        campanaId: 'camp-semilla-2',
        dealId: 'deal-2',
        universidadId: 'school-mex-2',
        universidadNombre: 'Universidad del Valle de México (Campus Lomas Verdes)',
        redSocial: 'linkedin',
        fechaProgramada: '2026-11-02',
        horaProgramada: '10:00',
        titulo: 'Convocatoria Oficial: Hackathon de Inteligencia Artificial UVM & Develop',
        copyTexto: 'Nos enorgullece coorganizar con UVM Lomas Verdes el Hackathon 2026 con 3 desafíos de IA y Cloud patrocinados por Microsoft y Google Cloud.',
        hashtags: ['#UVMLomasVerdes', '#Hackathon2026', '#MicrosoftAzure', '#GoogleCloud'],
        cta: 'Inscribe a tu equipo multidisciplinario.',
        estado: 'programado',
        enlaceQr: 'http://localhost:5173/?vista=registro-alumno-qr&dealId=deal-2',
        formatoVisual: 'carrusel',
        impresionesEstimadas: 21000,
        marcasMencionadas: ['Microsoft', 'Google Cloud']
      },
      {
        id: 'post-sem-6',
        campanaId: 'camp-semilla-2',
        dealId: 'deal-2',
        universidadId: 'school-mex-2',
        universidadNombre: 'Universidad del Valle de México (Campus Lomas Verdes)',
        redSocial: 'instagram',
        fechaProgramada: '2026-11-04',
        horaProgramada: '15:00',
        titulo: '¿36 horas para hackear el futuro? Hackathon UVM',
        copyTexto: 'Bolsa de premios de $65,000 MXN, mentores senior en vivo y networking con reclutadores de tecnología. Forma tu equipo de 3 a 5 estudiantes.',
        hashtags: ['#LomasVerdes', '#LincesUVM', '#HackathonMexico', '#Develop'],
        cta: 'Escanea el código para registrar a tu equipo.',
        estado: 'programado',
        enlaceQr: 'http://localhost:5173/?vista=registro-alumno-qr&dealId=deal-2',
        formatoVisual: 'story_9_16',
        impresionesEstimadas: 31000,
        marcasMencionadas: ['Microsoft', 'Google Cloud']
      }
    ]
  }
];
