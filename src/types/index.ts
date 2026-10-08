export type CompanyType = 'universidad' | 'instituto_tecnologico' | 'universidad_tecnologica' | 'colegio' | 'empresa_asociada';

// Etapas exactas según sección 4.1 y Figura 1 del PDF oficial PAP:
// prospecto -> contacto -> propuesta -> agendado -> realizado -> resultado
export type PipelineStage = 
  | 'prospecto'
  | 'contacto'
  | 'propuesta'
  | 'agendado'
  | 'realizado'
  | 'resultado';

// Dos modalidades de proyecto según sección 2 y 4.1 del PDF:
// Modalidad A: Proyecto dentro de un programa (relación Alumno <-> Programa)
// Modalidad B: Proyecto alojado en la escuela (relación Escuela <-> Presencia institucional)
export type ProjectModality = 'modalidad_a_programa' | 'modalidad_b_escuela';

// Tipo de oportunidad/evento en universidades según sección 4.1 del PDF
export type EventType = 'recorrido_comercial' | 'conferencia_taller' | 'feria_trabajo' | 'hackathon' | 'proyecto';

export type PluriProgram = 'Develop Talent Program' | 'Develop Innovation Labs' | 'Develop Career Hub' | 'TODO Academy' | 'PluriOne Talent Solutions';

export interface Company {
  id: string;
  name: string;
  type: CompanyType;
  state: 'CDMX' | 'Estado de México';
  municipality: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  directorName: string;
  studentCount: number;
  monthlyTuition: number;
  leadScore: number; // 0 - 100
  status: 'prospecto' | 'cliente_activo' | 'en_seguimiento' | 'inactivo';
  tags: string[];
  preferredModality?: ProjectModality;
  alliedBrands?: string[];
  datos_adicionales?: Record<string, any>;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
  lastContactedAt?: string;
}

export interface Deal {
  id: string;
  title: string;
  companyId: string;
  amount: number;
  stage: PipelineStage;
  probability: number;
  expectedCloseDate: string;
  assignedRep: string;
  servicePackage: string;
  notes: string;
  createdAt: string;
  lastStageChange?: string;
  projectModality: ProjectModality;
  eventType: EventType;
  alliedBrands: string[];
  registeredLeadsCount?: number;
  cancelado?: boolean;
  motivoCancelacion?: string;
}

export interface Activity {
  id: string;
  dealId?: string;
  companyId: string;
  type: 'call' | 'meeting' | 'email' | 'note' | 'task';
  title: string;
  description: string;
  date: string;
  completed: boolean;
  author: string;
}

export type CollateralType = 'folleto' | 'cartel' | 'historia_social' | 'banner_web';

export interface CollateralItem {
  id: string;
  campaignId: string;
  type: CollateralType;
  title: string;
  headline: string;
  subheadline: string;
  bulletPoints: string[];
  cta: string;
  themeColor: string;
  secondaryColor: string;
  institutionName: string;
  phoneContact: string;
  website: string;
  badgeText?: string;
  alliedBrandBranding?: string;
}

export interface Campaign {
  id: string;
  name: string;
  companyId: string;
  objective: string;
  budgetTotal: number;
  budgetSpent: number;
  startDate: string;
  endDate: string;
  targetAudience: string;
  status: 'activa' | 'borrador' | 'en_revision' | 'finalizada';
  eventType: EventType;
  projectModality: ProjectModality;
  alliedBrands: string[];
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    leadsGenerated: number;
    roi: string;
  };
  collaterals: CollateralItem[];
}

export interface RouteStop {
  order: number;
  schoolId: string;
  name: string;
  address: string;
  municipality: string;
  state: string;
  lat: number;
  lng: number;
  distanceFromPrevKm: number;
  drivingTimeFromPrevMin: number;
  suggestedStayMin: number;
  directorName: string;
  phone: string;
  leadScore: number;
  recommendedMeetingHour: string;
  tollEstimateMxn?: number;
}

export interface ViaticosBreakdown {
  gasolinaMxn: number;
  casetasMxn: number;
  alimentosMxn: number;
  totalViaticosMxn: number;
  fuelLitersEstimate: number;
  daysEstimate: number;
}

export interface OptimizedTrip {
  id: string;
  title: string;
  origin: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  stateFilter: string;
  stops: RouteStop[];
  totalDistanceKm: number;
  totalDrivingMinutes: number;
  totalEstimatedTripMinutes: number;
  efficiencyGainPct: number; // Comparación contra ruta desordenada
  viaticos: ViaticosBreakdown;
  createdAt: string;
}
