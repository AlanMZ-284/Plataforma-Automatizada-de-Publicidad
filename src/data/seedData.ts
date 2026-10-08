import { Company, Contact, Deal, Activity, Campaign, CollateralItem } from '../types';

export const SEED_COMPANIES: Company[] = [
  // --- ESTADO DE MÉXICO (UNIVERSIDADES & TECNOLÓGICOS PARA ALIANZAS PLURIONE) ---
  {
    id: 'school-mex-1',
    name: 'Instituto Tecnológico de Tlalnepantla (ITTLA)',
    type: 'instituto_tecnologico',
    state: 'Estado de México',
    municipality: 'Tlalnepantla de Baz',
    address: 'Av. Mario Colín s/n, La Comunidad, Tlalnepantla, Edo. Méx.',
    lat: 19.5358,
    lng: -99.2045,
    phone: '55 5565 0411',
    email: 'vinculacion@tlalnepantla.tecnm.mx',
    directorName: 'Mtra. Silvia Santiago Cruz',
    studentCount: 5400,
    monthlyTuition: 1800,
    leadScore: 96,
    status: 'en_seguimiento',
    tags: ['Ingenierías', 'Residencias Profesionales', 'Modalidad Dual'],
    preferredModality: 'modalidad_a_programa',
    alliedBrands: ['AWS', 'Cisco'],
    datos_adicionales: {
      carreras: [
        'Ingeniería en Tecnologías de la Información',
        'Ingeniería en Sistemas Computacionales',
        'Ingeniería Mecatrónica',
        'Ingeniería Industrial'
      ]
    }
  },
  {
    id: 'school-mex-2',
    name: 'Universidad del Valle de México (Campus Lomas Verdes)',
    type: 'universidad',
    state: 'Estado de México',
    municipality: 'Naucalpan de Juárez',
    address: 'Paseo de las Aves 1, San Mateo Nopala, Naucalpan, Edo. Méx.',
    lat: 19.4978,
    lng: -99.2789,
    phone: '55 5238 7300',
    email: 'experiencia.profesional.lv@uvmnet.edu',
    directorName: 'Dr. Alejandro Morales',
    studentCount: 6800,
    monthlyTuition: 8500,
    leadScore: 94,
    status: 'cliente_activo',
    tags: ['Convenio Firmado', 'Hackathon Anual', 'TODO Academy'],
    preferredModality: 'modalidad_a_programa',
    alliedBrands: ['Microsoft', 'Google Cloud'],
    datos_adicionales: {
      carreras: [
        'Ingeniería en Software y Redes',
        'Ingeniería Mecatrónica',
        'Ingeniería en Telecomunicaciones y Sistemas',
        'Licenciatura en Ciencias de Datos'
      ]
    }
  },
  {
    id: 'school-mex-3',
    name: 'Universidad Tecnológica de Nezahualcóyotl (UTN)',
    type: 'universidad_tecnologica',
    state: 'Estado de México',
    municipality: 'Nezahualcóyotl',
    address: 'Circuito Universidad Tecnológica s/n, Benito Juárez, Nezahualcóyotl',
    lat: 19.3985,
    lng: -99.0062,
    phone: '55 5716 9700',
    email: 'estadias.vinculacion@utn.edu.mx',
    directorName: 'Mtro. Gerardo Valdés',
    studentCount: 7200,
    monthlyTuition: 2100,
    leadScore: 92,
    status: 'en_seguimiento',
    tags: ['Estadías Cuatrimestrales', 'Feria de Empleo', 'TODO Academy'],
    preferredModality: 'modalidad_b_escuela',
    alliedBrands: ['Intel', 'AWS'],
    datos_adicionales: {
      carreras: [
        'TSU en Tecnologías de la Información (Desarrollo de Software)',
        'Ingeniería en Redes y Ciberseguridad',
        'TSU en Mecatrónica',
        'Ingeniería en Procesos Industriales'
      ]
    }
  },
  {
    id: 'school-mex-4',
    name: 'Tecnológico de Estudios Superiores de Ecatepec (TESE)',
    type: 'instituto_tecnologico',
    state: 'Estado de México',
    municipality: 'Ecatepec de Morelos',
    address: 'Av. Tecnológico s/n, Valle de Anáhuac, Ecatepec, Edo. Méx.',
    lat: 19.5192,
    lng: -99.0415,
    phone: '55 5000 2300',
    email: 'residencias@tese.edu.mx',
    directorName: 'Dr. Héctor Cárdenas',
    studentCount: 8900,
    monthlyTuition: 1950,
    leadScore: 90,
    status: 'prospecto',
    tags: ['Ingeniería en Sistemas', 'Proyecto en Escuela', 'Valle de México'],
    preferredModality: 'modalidad_b_escuela',
    alliedBrands: ['Oracle', 'Microsoft']
  },
  {
    id: 'school-mex-5',
    name: 'Universidad Anáhuac México (Campus Norte / Huixquilucan)',
    type: 'universidad',
    state: 'Estado de México',
    municipality: 'Huixquilucan',
    address: 'Av. Universidad Anáhuac 46, Lomas Anáhuac, Huixquilucan',
    lat: 19.3995,
    lng: -99.2655,
    phone: '55 5627 0210',
    email: 'empleabilidad.norte@anahuac.mx',
    directorName: 'Dra. Carmen Vergara',
    studentCount: 12500,
    monthlyTuition: 22000,
    leadScore: 98,
    status: 'en_seguimiento',
    tags: ['Liderazgo Empresarial', 'Hackathon Tecnológico', 'Convenio PluriOne'],
    preferredModality: 'modalidad_a_programa',
    alliedBrands: ['Google Cloud', 'IBM']
  },
  {
    id: 'school-mex-6',
    name: 'Tec Milenio (Campus Cuautitlán Izcalli)',
    type: 'universidad',
    state: 'Estado de México',
    municipality: 'Cuautitlán Izcalli',
    address: 'Av. Rancho Jacal 100, La Perla, Cuautitlán Izcalli',
    lat: 19.6482,
    lng: -99.2215,
    phone: '55 5864 7700',
    email: 'semestre.empresarial@tecmilenio.mx',
    directorName: 'Ing. Roberto Dávalos',
    studentCount: 3400,
    monthlyTuition: 7200,
    leadScore: 88,
    status: 'prospecto',
    tags: ['Semestre Empresarial', 'Conferencias Tech', 'Modalidad Dual'],
    preferredModality: 'modalidad_a_programa',
    alliedBrands: ['Cisco']
  },
  {
    id: 'school-mex-7',
    name: 'Instituto Tecnológico de Toluca (ITToluca)',
    type: 'instituto_tecnologico',
    state: 'Estado de México',
    municipality: 'Metepec',
    address: 'Av. Tecnológico s/n, Agrícola Bellavista, Metepec / Toluca',
    lat: 19.2568,
    lng: -99.5855,
    phone: '722 208 7200',
    email: 'vinculacion@toluca.tecnm.mx',
    directorName: 'Dr. Juan Carlos Rivas',
    studentCount: 6200,
    monthlyTuition: 2300,
    leadScore: 89,
    status: 'en_seguimiento',
    tags: ['Valle de Toluca', 'Proyecto Alojado Escuela', 'TODO Academy'],
    preferredModality: 'modalidad_b_escuela',
    alliedBrands: ['AWS']
  },

  // --- CIUDAD DE MÉXICO (CDMX) ---
  {
    id: 'school-cdmx-1',
    name: 'Universidad La Salle México (Campus Condesa)',
    type: 'universidad',
    state: 'CDMX',
    municipality: 'Cuauhtémoc',
    address: 'Benjamín Franklin 47, Hipódromo Condesa, CDMX',
    lat: 19.4075,
    lng: -99.1812,
    phone: '55 5278 9500',
    email: 'bolsadetrabajo@lasalle.mx',
    directorName: 'Mtro. Javier Albarrán',
    studentCount: 9400,
    monthlyTuition: 11500,
    leadScore: 97,
    status: 'cliente_activo',
    tags: ['Convenio Activo', 'Feria de Trabajo', 'TODO Academy PluriOne'],
    preferredModality: 'modalidad_a_programa',
    alliedBrands: ['Microsoft', 'AWS']
  },
  {
    id: 'school-cdmx-2',
    name: 'Instituto Politécnico Nacional - UPIITA (Lindavista)',
    type: 'universidad',
    state: 'CDMX',
    municipality: 'Gustavo A. Madero',
    address: 'Av. Instituto Politécnico Nacional 2580, La Laguna Ticoman, CDMX',
    lat: 19.5115,
    lng: -99.1278,
    phone: '55 5729 6000',
    email: 'vinculacion.upiita@ipn.mx',
    directorName: 'Dr. Sergio Valenzuela',
    studentCount: 4200,
    monthlyTuition: 800,
    leadScore: 95,
    status: 'en_seguimiento',
    tags: ['Telemática & Mecatrónica', 'Hackathon Robótica', 'Proyecto en Escuela'],
    preferredModality: 'modalidad_b_escuela',
    alliedBrands: ['Intel', 'Cisco']
  },
  {
    id: 'school-cdmx-3',
    name: 'Universidad Iberoamericana (Campus Santa Fe)',
    type: 'universidad',
    state: 'CDMX',
    municipality: 'Álvaro Obregón',
    address: 'Prol. Paseo de la Reforma 880, Lomas de Santa Fe, CDMX',
    lat: 19.3705,
    lng: -99.2635,
    phone: '55 5950 4000',
    email: 'empleabilidad@ibero.mx',
    directorName: 'Dra. Regina Von Gunten',
    studentCount: 11000,
    monthlyTuition: 24000,
    leadScore: 99,
    status: 'en_seguimiento',
    tags: ['Prácticas de Excelencia', 'Conferencia Magistral', 'Alto Impacto'],
    preferredModality: 'modalidad_a_programa',
    alliedBrands: ['Google Cloud', 'AWS']
  }
];

export const SEED_CONTACTS: Contact[] = [
  {
    id: 'contact-1',
    companyId: 'school-mex-1',
    name: 'Mtra. Silvia Santiago Cruz',
    role: 'Directora de Vinculación y Residencias Profesionales',
    email: 'vinculacion@tlalnepantla.tecnm.mx',
    phone: '55 5565 0412',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    lastContactedAt: '2026-09-20T14:30:00Z'
  },
  {
    id: 'contact-2',
    companyId: 'school-mex-2',
    name: 'Lic. Fernando Gutiérrez',
    role: 'Coordinador de Empleabilidad y Experiencia Profesional',
    email: 'fgutierrez@uvmnet.edu',
    phone: '55 5238 7340',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    lastContactedAt: '2026-09-21T10:15:00Z'
  },
  {
    id: 'contact-3',
    companyId: 'school-mex-3',
    name: 'Mtro. Gerardo Valdés',
    role: 'Jefe del Depto. de Estadías y Modalidad Dual',
    email: 'estadias.dual@utn.edu.mx',
    phone: '55 5716 9720',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
    lastContactedAt: '2026-09-18T16:00:00Z'
  },
  {
    id: 'contact-4',
    companyId: 'school-cdmx-1',
    name: 'Mtro. Javier Albarrán',
    role: 'Director de Alianzas Universitarias & Bolsa de Trabajo',
    email: 'jalbarran@lasalle.mx',
    phone: '55 5278 9522',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    lastContactedAt: '2026-09-19T11:00:00Z'
  }
];

// Oportunidades según el ciclo oficial del PDF:
// prospecto -> contacto -> propuesta -> agendado -> realizado -> resultado
export const SEED_DEALS: Deal[] = [
  {
    id: 'deal-1',
    title: 'Hackathon Tecnológico de Innovación & IA 2026 - ITTLA',
    companyId: 'school-mex-1',
    amount: 175000,
    stage: 'agendado',
    probability: 80,
    expectedCloseDate: '2026-10-15',
    assignedRep: 'Carlos Mendoza',
    servicePackage: 'Kit Hackathon: Retos AWS + Mentores + Kit de Bienvenida',
    notes: 'Comité de vinculación aprobó la fecha del Hackathon para el 24 de octubre. AWS participará como marca patrocinadora con retos en la nube.',
    createdAt: '2026-09-02',
    projectModality: 'modalidad_a_programa',
    eventType: 'hackathon',
    alliedBrands: ['AWS', 'Cisco'],
    registeredLeadsCount: 180
  },
  {
    id: 'deal-2',
    title: 'Feria de Empleabilidad & Estadías TODO Academy - UVM Lomas Verdes',
    companyId: 'school-mex-2',
    amount: 140000,
    stage: 'resultado',
    probability: 100,
    expectedCloseDate: '2026-09-15',
    assignedRep: 'Sofía Valenzuela',
    servicePackage: 'Kit Feria de Trabajo: Stand + Banners + Formulario QR',
    notes: 'Evento realizado con éxito rotundo. Se registraron 215 alumnos interesados en estadías y 38 fueron canalizados a proyectos activos.',
    createdAt: '2026-08-20',
    projectModality: 'modalidad_a_programa',
    eventType: 'feria_trabajo',
    alliedBrands: ['Microsoft', 'Google Cloud'],
    registeredLeadsCount: 215
  },
  {
    id: 'deal-3',
    title: 'Proyecto Alojado: Laboratorio de Soluciones de Software - UTN Neza',
    companyId: 'school-mex-3',
    amount: 190000,
    stage: 'propuesta',
    probability: 60,
    expectedCloseDate: '2026-11-01',
    assignedRep: 'Carlos Mendoza',
    servicePackage: 'Convenio Modalidad B: Proyecto Alojado en Escuela + Intel',
    notes: 'Propuesta formal presentada ante el Abogado General de la UTN. La escuela no licita a gobierno y PluriOne lidera el desarrollo técnico.',
    createdAt: '2026-09-10',
    projectModality: 'modalidad_b_escuela',
    eventType: 'proyecto',
    alliedBrands: ['Intel'],
    registeredLeadsCount: 0
  },
  {
    id: 'deal-4',
    title: 'Ciclo de Conferencias: Inteligencia Artificial en Entornos Reales - TESE',
    companyId: 'school-mex-4',
    amount: 85000,
    stage: 'contacto',
    probability: 30,
    expectedCloseDate: '2026-10-30',
    assignedRep: 'Sofía Valenzuela',
    servicePackage: 'Kit Conferencia: Presentación + Guion + Difusión en Redes',
    notes: 'Primer contacto con el Jefe de Carrera de Sistemas. Se planteó conferencia magistral para 300 alumnos de últimos semestres.',
    createdAt: '2026-09-14',
    projectModality: 'modalidad_a_programa',
    eventType: 'conferencia_taller',
    alliedBrands: ['Oracle', 'Microsoft'],
    registeredLeadsCount: 0
  },
  {
    id: 'deal-5',
    title: 'Recorrido Comercial & Firma de Convenio Marco - La Salle CDMX',
    companyId: 'school-cdmx-1',
    amount: 160000,
    stage: 'realizado',
    probability: 90,
    expectedCloseDate: '2026-09-10',
    assignedRep: 'Carlos Mendoza',
    servicePackage: 'Recorrido Comercial + Alianza de Modalidad Dual',
    notes: 'Reunión en rectoría concluida. Firma de convenio agendada para formalización este viernes.',
    createdAt: '2026-08-15',
    projectModality: 'modalidad_a_programa',
    eventType: 'recorrido_comercial',
    alliedBrands: ['Microsoft', 'AWS'],
    registeredLeadsCount: 45
  },
  {
    id: 'deal-6',
    title: 'Hackathon Nacional de Ciberseguridad & Dual - Anáhuac Huixquilucan',
    companyId: 'school-mex-5',
    amount: 220000,
    stage: 'prospecto',
    probability: 20,
    expectedCloseDate: '2026-11-25',
    assignedRep: 'Carlos Mendoza',
    servicePackage: 'Kit Hackathon Alta Gama: Retos Google Cloud + Mentores PluriOne',
    notes: 'Prospección inicial enviada a la Facultad de Ingeniería. Pendiente definir fecha tentativa con agenda de Google Cloud.',
    createdAt: '2026-09-18',
    projectModality: 'modalidad_a_programa',
    eventType: 'hackathon',
    alliedBrands: ['Google Cloud'],
    registeredLeadsCount: 0
  }
];

export const SEED_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    dealId: 'deal-1',
    companyId: 'school-mex-1',
    type: 'meeting',
    title: 'Junta de Coordinación del Hackathon ITTLA con AWS',
    description: 'Se revisaron los 3 retos técnicos que aportará AWS y la logística de entrega de kits de bienvenida y stands.',
    date: '2026-09-20 11:30',
    completed: true,
    author: 'Carlos Mendoza'
  },
  {
    id: 'act-2',
    dealId: 'deal-1',
    companyId: 'school-mex-1',
    type: 'task',
    title: 'Validar presupuesto de viáticos para visita previa al campus ITTLA',
    description: 'Cálculo de gasolina y casetas para el recorrido técnico del equipo de montaje.',
    date: '2026-09-21 16:00',
    completed: true,
    author: 'Carlos Mendoza'
  },
  {
    id: 'act-3',
    dealId: 'deal-3',
    companyId: 'school-mex-3',
    type: 'email',
    title: 'Envío de propuesta de Proyecto Alojado en Escuela (Modalidad B)',
    description: 'Se remitió documentación justificando que la universidad no requiere licitar y que PluriOne lidera el desarrollo.',
    date: '2026-09-19 10:15',
    completed: true,
    author: 'Carlos Mendoza'
  },
  {
    id: 'act-4',
    dealId: 'deal-2',
    companyId: 'school-mex-2',
    type: 'call',
    title: 'Llamada de confirmación de stand de feria con Dra. Mónica Estrada',
    description: 'Confirmar medidas del stand (3x2m), requerimiento de toma eléctrica y pase vehicular para promotores.',
    date: '2026-10-12 10:00',
    completed: false,
    author: 'Carlos Mendoza'
  },
  {
    id: 'act-5',
    dealId: 'deal-6',
    companyId: 'school-mex-5',
    type: 'meeting',
    title: 'Presentación ejecutiva a Dirección de Ingeniería en Anáhuac',
    description: 'Sesión presencial para detallar los beneficios curriculares del Talent Program y entrega de minuta con Google Cloud.',
    date: '2026-10-15 12:00',
    completed: false,
    author: 'Carlos Mendoza'
  }
];

export const SEED_COLLATERALS: CollateralItem[] = [
  {
    id: 'col-1',
    campaignId: 'camp-1',
    type: 'folleto',
    title: 'Folleto Feria de Trabajo & Estadías (Stand y Alumnos)',
    headline: 'Convocatoria Oficial: Estadías & Residencias 2026',
    subheadline: 'Develop Talent Program en alianza con AWS ofrece vacantes reales en proyectos tecnológicos para universitarios.',
    bulletPoints: [
      'Modalidad A: Desarrolla tu residencia profesional dentro de proyectos Develop',
      'Acreditación curricular oficial garantizada ante tu dirección de carrera',
      'Mentoría técnica con líderes de ingeniería y bolsa de trabajo post-graduación'
    ],
    cta: 'Postula tu perfil universitario y agenda entrevista técnica',
    themeColor: '#0f094f',
    secondaryColor: '#a78bfa',
    institutionName: 'Develop Talent Program',
    phoneContact: '55 5343 0000',
    website: 'develop.com/talento',
    badgeText: 'Feria de Trabajo Universitaria',
    alliedBrandBranding: 'En alianza con AWS & Cisco'
  },
  {
    id: 'col-2',
    campaignId: 'camp-1',
    type: 'historia_social',
    title: 'Historia 9:16 Convocatoria Alumnos (Instagram/TikTok)',
    headline: '¿Listo para liberar tu residencia profesional con impacto?',
    subheadline: 'Develop te conecta con proyectos tecnológicos reales donde aprendes y creces.',
    bulletPoints: [
      'Modalidad híbrida compatible con tus materias',
      'Certificación oficial al completar tu estadía',
      'Oportunidad de contratación inmediata'
    ],
    cta: 'Desliza hacia arriba para registrarte',
    themeColor: '#29008e',
    secondaryColor: '#f472b6',
    institutionName: 'Develop | Talent Program',
    phoneContact: '55 5343 0000',
    website: 'develop.com/talento',
    badgeText: '¡Convocatoria Abierta!',
    alliedBrandBranding: 'Patrocinado por AWS'
  },
  {
    id: 'col-3',
    campaignId: 'camp-1',
    type: 'cartel',
    title: 'Cartel A4 para Mamparas Universitarias y Pasillos',
    headline: 'Develop: Convocatoria Residencias & Modalidad Dual',
    subheadline: 'Desarrolla tu estadía profesional en Develop con proyectos de software, IA y cloud.',
    bulletPoints: [
      'Convenio oficial activo con tu universidad',
      'Acreditación de horas de servicio y residencia técnica',
      'Talleres técnicos y mentorías quincenales'
    ],
    cta: 'Escanea el código QR de mampara o visita vinculación',
    themeColor: '#0f094f',
    secondaryColor: '#a78bfa',
    institutionName: 'Develop • Enterprise Ecosystem',
    phoneContact: '55 5343 0000',
    website: 'develop.com/residencias',
    badgeText: 'Convocatoria Abierta',
    alliedBrandBranding: 'Marcas Aliadas: AWS • Microsoft'
  },
  {
    id: 'col-4',
    campaignId: 'camp-1',
    type: 'banner_web',
    title: 'Banner Intranet & Bolsa de Trabajo Universitaria (16:9)',
    headline: 'Realiza tu Estadía en Develop Talent Program',
    subheadline: 'Espacios exclusivos para alumnos de últimos semestres.',
    bulletPoints: [
      'Modalidad Dual Certificada',
      'Estadías Curriculares Oficiales'
    ],
    cta: 'Ver Requisitos y Postularme',
    themeColor: '#07052e',
    secondaryColor: '#f472b6',
    institutionName: 'Develop Talent Program',
    phoneContact: '55 5343 0000',
    website: 'develop.com/talento',
    badgeText: 'Ciclo 2026',
    alliedBrandBranding: 'Alianza Tecnológica AWS'
  }
];

export const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Hackathon & Convocatoria Estadías 2026 - ITTLA',
    companyId: 'school-mex-1',
    objective: 'Reclutamiento de Alumnos e Integración de Retos Técnicos con AWS',
    budgetTotal: 175000,
    budgetSpent: 52000,
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    targetAudience: 'Estudiantes de Ingenierías y Tecnologías en Tlalnepantla y Valle de México',
    status: 'activa',
    eventType: 'hackathon',
    projectModality: 'modalidad_a_programa',
    alliedBrands: ['AWS', 'Cisco'],
    metrics: {
      impressions: 245000,
      clicks: 9840,
      ctr: 4.02,
      leadsGenerated: 180,
      roi: '4.8x'
    },
    collaterals: SEED_COLLATERALS
  },
  {
    id: 'camp-2',
    name: 'Feria de Empleo Universitario - UVM Lomas Verdes',
    companyId: 'school-mex-2',
    objective: 'Firma de Convenios Marco y Captación de Residentes en Naucalpan',
    budgetTotal: 140000,
    budgetSpent: 140000,
    startDate: '2026-08-15',
    endDate: '2026-09-15',
    targetAudience: 'Estudiantes y recién egresados de facultades de ingeniería y negocios',
    status: 'finalizada',
    eventType: 'feria_trabajo',
    projectModality: 'modalidad_a_programa',
    alliedBrands: ['Microsoft', 'Google Cloud'],
    metrics: {
      impressions: 280000,
      clicks: 11200,
      ctr: 4.00,
      leadsGenerated: 215,
      roi: '5.2x'
    },
    collaterals: []
  }
];
