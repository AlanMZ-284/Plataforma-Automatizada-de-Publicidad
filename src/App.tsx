import React, { useState } from 'react';
import { 
  SEED_COMPANIES, 
  SEED_CONTACTS, 
  SEED_DEALS, 
  SEED_ACTIVITIES, 
  SEED_CAMPAIGNS 
} from './data/seedData';
import { Company, Contact, Deal, Activity, Campaign, PipelineStage } from './types';
import { DealsPipeline } from './components/crm/DealsPipeline';
import { CompaniesList } from './components/crm/CompaniesList';
import { SchoolRoutePlanner } from './components/routes/SchoolRoutePlanner';
import { EventKitAndContentModule } from './components/events-kit/EventKitAndContentModule';
import { CampaignAndCollateralGenerator } from './components/campaigns/CampaignAndCollateralGenerator';
import { CommercialKitView } from './components/commercial-kit/CommercialKitView';
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Sparkles, 
  Briefcase,
  Megaphone,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  ShieldCheck
} from 'lucide-react';

type MainView = 'crm-pipeline' | 'crm-schools' | 'routes' | 'events-kit' | 'campaigns' | 'commercial-kit';

export function App() {
  const [currentView, setCurrentView] = useState<MainView>('crm-pipeline');
  
  // Estados de datos en memoria reactivos
  const [companies, setCompanies] = useState<Company[]>(SEED_COMPANIES);
  const [contacts, setContacts] = useState<Contact[]>(SEED_CONTACTS);
  const [deals, setDeals] = useState<Deal[]>(SEED_DEALS);
  const [activities, setActivities] = useState<Activity[]>(SEED_ACTIVITIES);
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);

  // Estado para abrir ficha modal de escuela específica desde cualquier módulo
  const [selectedSchoolDetailId, setSelectedSchoolDetailId] = useState<string | null>(null);

  // Estado para kit comercial activo seleccionado desde el CRM o directamente
  const [activeEventKitDealId, setActiveEventKitDealId] = useState<string | null>(deals[0]?.id || null);

  // Actualizar etapa de un trato
  const handleUpdateDealStage = (dealId: string, newStage: PipelineStage) => {
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id === dealId) {
          let prob = deal.probability;
          if (newStage === 'contacto') prob = 40;
          if (newStage === 'propuesta') prob = 60;
          if (newStage === 'agendado') prob = 80;
          if (newStage === 'realizado') prob = 95;
          if (newStage === 'resultado') prob = 100;

          return {
            ...deal,
            stage: newStage,
            probability: prob,
            lastStageChange: new Date().toISOString()
          };
        }
        return deal;
      })
    );
  };

  // Agregar nuevo trato
  const handleAddDeal = (newDealData: Omit<Deal, 'id' | 'createdAt'>) => {
    const newDeal: Deal = {
      ...newDealData,
      id: `deal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDeals((prev) => [newDeal, ...prev]);

    // Registrar actividad en el CRM automáticamente
    const targetComp = companies.find((c) => c.id === newDeal.companyId);
    handleAddActivity({
      companyId: newDeal.companyId,
      dealId: newDeal.id,
      type: 'task',
      title: `Oportunidad Creada: ${newDeal.title}`,
      description: `Se abrió una nueva oportunidad comercial por $${newDeal.amount.toLocaleString('es-MX')} MXN para ${targetComp?.name}.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      completed: true,
      author: newDeal.assignedRep
    });
  };

  // Agregar actividad al timeline de una escuela
  const handleAddActivity = (activityData: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Agregar nueva campaña
  const handleAddCampaign = (newCampaign: Campaign) => {
    setCampaigns((prev) => [newCampaign, ...prev]);
  };

  // Registro automático cuando se envía una propuesta del Kit Comercial
  const handleLogProposalSent = (schoolId: string, amount: number, packageName: string) => {
    // 1. Agregar actividad de envío
    handleAddActivity({
      companyId: schoolId,
      type: 'email',
      title: `Propuesta Formal Enviada: ${packageName}`,
      description: `Se remitió propuesta institucional con membrete oficial Develop por un monto de $${amount.toLocaleString('es-MX')} MXN para revisión del comité de vinculación.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      completed: true,
      author: 'Carlos Mendoza'
    });

    // 2. Si ya hay una oportunidad en fase previa, avanzarla a 'propuesta'
    const existingDeal = deals.find((d) => d.companyId === schoolId && d.stage !== 'resultado');
    if (existingDeal) {
      handleUpdateDealStage(existingDeal.id, 'propuesta');
    }
  };

  // Registrar itinerario de ruta en el CRM
  const handleLogRouteToCRM = (trip: any) => {
    trip.stops.forEach((stop: any) => {
      handleAddActivity({
        companyId: stop.schoolId,
        type: 'meeting',
        title: `Visita Presencial Agendada en Ruta: ${stop.name}`,
        description: `Llegada estimada a las ${stop.recommendedMeetingHour} para reunión con ${stop.directorName}. Viáticos autorizados: $${trip.viaticos.totalViaticosMxn} MXN.`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        completed: false,
        author: 'Carlos Mendoza'
      });
    });
  };

  // Actualizar contador de alumnos captados desde el Kit Comercial
  const handleUpdateDealLeads = (dealId: string, count: number) => {
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id === dealId) {
          return {
            ...deal,
            registeredLeadsCount: count
          };
        }
        return deal;
      })
    );

    const targetDeal = deals.find((d) => d.id === dealId);
    if (targetDeal) {
      handleAddActivity({
        companyId: targetDeal.companyId,
        dealId: targetDeal.id,
        type: 'task',
        title: `Estudiante Registrado vía QR: ${targetDeal.title}`,
        description: `Lead universitario #${count} procesado automáticamente a través del stand/kit del evento. Sincronizado en el CRM de Develop.`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        completed: true,
        author: 'Sistema QR Develop'
      });
    }
  };

  // Abrir Kit Comercial y Contenidos IA desde una oportunidad específica del pipeline
  const handleOpenEventKit = (dealId: string) => {
    setActiveEventKitDealId(dealId);
    setCurrentView('events-kit');
  };

  // Navegar a la ficha CRM de una escuela desde la ruta o desde el pipeline
  const handleOpenSchoolInCRM = (schoolId: string) => {
    setSelectedSchoolDetailId(schoolId);
    setCurrentView('crm-schools');
  };

  return (
    <div className="min-h-screen bg-[#F8F8FC] text-[#111111] flex flex-col font-sans antialiased selection:bg-[#29008e] selection:text-white">
      {/* BARRA SUPERIOR DE NAVEGACIÓN DEVELOP (PREMIUM DARK SURFACE) */}
      <header className="sticky top-0 z-40 premium-dark-surface border-b border-white/10 shadow-lg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo e Identidad Develop */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0f094f] via-[#29008e] to-[#640354] p-[1.5px] shadow-develop-box relative group">
                <div className="w-full h-full rounded-[14px] bg-[#07052e]/80 backdrop-blur-xs flex items-center justify-center font-black text-xl text-white tracking-tight border border-white/15">
                  D
                  {/* Nodo de luz técnico / glow */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#a78bfa] shadow-[0_0_8px_#a78bfa] animate-pulse"></span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                    Develop <span className="gradient-text">CRM</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest pill-dark">
                    Enterprise
                  </span>
                </div>
                <div className="text-[11px] text-white/60 font-medium">
                  Ecosistema de Talento, Convenios & Vinculación Universitaria
                </div>
              </div>
            </div>

            {/* Menú de Módulos con Identidad Develop */}
            <nav className="hidden md:flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
              <button
                onClick={() => setCurrentView('crm-pipeline')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  currentView === 'crm-pipeline'
                    ? 'btn-primary-dark shadow-develop-glow'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Pipeline</span>
              </button>

              <button
                onClick={() => setCurrentView('crm-schools')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  currentView === 'crm-schools'
                    ? 'btn-primary-dark shadow-develop-glow'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Directorio 360°</span>
              </button>

              <button
                onClick={() => setCurrentView('routes')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  currentView === 'routes'
                    ? 'btn-primary-dark shadow-develop-glow'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Rutas Logísticas</span>
              </button>

              <button
                onClick={() => setCurrentView('events-kit')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  currentView === 'events-kit'
                    ? 'btn-primary-dark shadow-develop-glow'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#a78bfa]" />
                <span>Kits & IA</span>
              </button>

              <button
                onClick={() => setCurrentView('commercial-kit')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  currentView === 'commercial-kit'
                    ? 'btn-primary-dark shadow-develop-glow'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <Briefcase className="w-4 h-4 text-[#f472b6]" />
                <span>Propuestas</span>
              </button>

              <button
                onClick={() => setCurrentView('campaigns')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  currentView === 'campaigns'
                    ? 'btn-primary-dark shadow-develop-glow'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>Campañas</span>
              </button>
            </nav>

            {/* Perfil del Ejecutivo Develop */}
            <div className="flex items-center gap-3 pl-4 border-l border-white/15">
              <div className="hidden lg:block text-right">
                <div className="font-bold text-xs text-white">Carlos Mendoza</div>
                <div className="text-[10px] text-[#a78bfa] font-medium flex items-center justify-end gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#a78bfa]" />
                  Partner de Vinculación
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#29008e] to-[#f472b6] p-[1.5px] shadow-sm">
                <div className="w-full h-full rounded-[14px] bg-[#07052e] flex items-center justify-center text-xs font-bold text-white border border-white/20">
                  CM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Navegación Móvil */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-white/10 bg-[#07052e]/90 backdrop-blur-md px-2 overflow-x-auto">
          {[
            { id: 'crm-pipeline', label: 'Pipeline', icon: LayoutDashboard },
            { id: 'crm-schools', label: 'Escuelas', icon: Building2 },
            { id: 'routes', label: 'Rutas', icon: MapPin },
            { id: 'events-kit', label: 'Kits IA', icon: Sparkles },
            { id: 'commercial-kit', label: 'Propuestas', icon: Briefcase },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id as MainView)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-semibold ${
                currentView === id ? 'text-[#a78bfa]' : 'text-white/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL DINÁMICO */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'crm-pipeline' && (
          <DealsPipeline
            deals={deals}
            companies={companies}
            onUpdateDealStage={handleUpdateDealStage}
            onAddDeal={handleAddDeal}
            onSelectSchoolForCRM={handleOpenSchoolInCRM}
            onOpenEventKit={handleOpenEventKit}
          />
        )}

        {currentView === 'crm-schools' && (
          <CompaniesList
            companies={companies}
            contacts={contacts}
            deals={deals}
            activities={activities}
            onAddActivity={handleAddActivity}
            onNavigateToRoutePlanner={() => setCurrentView('routes')}
            selectedCompanyId={selectedSchoolDetailId}
            onCloseCompanyDetail={() => setSelectedSchoolDetailId(null)}
            onOpenCompanyDetail={(id) => setSelectedSchoolDetailId(id)}
          />
        )}

        {currentView === 'routes' && (
          <SchoolRoutePlanner
            schools={companies}
            onSelectSchoolForCRM={handleOpenSchoolInCRM}
            onLogRouteToCRM={handleLogRouteToCRM}
          />
        )}

        {currentView === 'events-kit' && (
          <EventKitAndContentModule
            deals={deals}
            companies={companies}
            selectedDealId={activeEventKitDealId}
            onUpdateDealLeads={handleUpdateDealLeads}
            onSelectSchoolForCRM={handleOpenSchoolInCRM}
          />
        )}

        {currentView === 'campaigns' && (
          <CampaignAndCollateralGenerator
            campaigns={campaigns}
            companies={companies}
            onAddCampaign={handleAddCampaign}
          />
        )}

        {currentView === 'commercial-kit' && (
          <CommercialKitView
            companies={companies}
            onLogProposalSent={handleLogProposalSent}
          />
        )}
      </main>

      {/* FOOTER ENTERPRISE DEVELOP */}
      <footer className="bg-white border-t border-black/5 py-6 text-xs text-[#555555]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#29008e]"></span>
            <span className="font-bold text-[#111111]">Develop Enterprise Ecosystem</span>
            <span className="text-[#888888]">•</span>
            <span>Plataforma de Vinculación Universitaria & Talento Tech</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#888888]">
            <span>Inter Typography</span>
            <span>•</span>
            <span>Algoritmo Logístico TSP</span>
            <span>•</span>
            <span>Motor de Contenidos IA</span>
            <span>•</span>
            <span className="font-semibold text-[#0f094f]">Develop Digital 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
