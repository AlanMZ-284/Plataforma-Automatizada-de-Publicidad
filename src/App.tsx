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
import { FormularioRegistroAlumnoQr } from './components/publico/FormularioRegistroAlumnoQr';
import { 
  LayoutDashboard, 
  Building2, 
  MapPin, 
  Sparkles, 
  ShieldCheck,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode
} from 'lucide-react';

type MainView = 'crm-pipeline' | 'crm-schools' | 'routes' | 'events-kit' | 'registro-alumno-qr';

export function App() {
  const [currentView, setCurrentView] = useState<MainView>('crm-pipeline');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  // Estado para la oportunidad activa en el Formulario QR de captura de alumnos
  const [activeQrDealId, setActiveQrDealId] = useState<string | null>(deals[0]?.id || null);

  // Soporte para abrir directamente el formulario QR por URL (?vista=registro-alumno-qr&dealId=xxx)
  React.useEffect(() => {
    try {
      const parametros = new URLSearchParams(window.location.search);
      const vistaParam = parametros.get('vista');
      const dealIdParam = parametros.get('dealId');
      if (vistaParam === 'registro-alumno-qr') {
        if (dealIdParam) setActiveQrDealId(dealIdParam);
        setCurrentView('registro-alumno-qr');
      }
    } catch {
      // Entorno sin window
    }
  }, []);

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

  // Importar instituciones educativas desde Excel o CSV a la cartera activa
  const handleImportCompanies = (newCompanies: Company[]) => {
    setCompanies((prev) => [...newCompanies, ...prev]);
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

  const navItems = [
    { id: 'crm-pipeline' as MainView, label: 'Pipeline de Ventas', shortLabel: 'Pipeline', icon: LayoutDashboard },
    { id: 'crm-schools' as MainView, label: 'Directorio 360°', shortLabel: 'Directorio', icon: Building2 },
    { id: 'routes' as MainView, label: 'Rutas Logísticas', shortLabel: 'Rutas', icon: MapPin },
    { id: 'events-kit' as MainView, label: 'Kits & Contenidos IA', shortLabel: 'Kits IA', icon: Sparkles },
    { id: 'registro-alumno-qr' as MainView, label: 'Captura QR en Stand', shortLabel: 'Captura QR', icon: QrCode }
  ];

  const currentNav = navItems.find((n) => n.id === currentView);

  return (
    <div className="h-screen w-full bg-[#F8F8FC] text-[#111111] flex overflow-hidden font-sans antialiased selection:bg-[#29008e] selection:text-white">
      {/* ============================================================== */}
      {/* SIDEBAR ESCRITORIO COLAPSABLE (Desktop >= 1024px)              */}
      {/* Guía §13: Sidebar dark premium según importancia                */}
      {/* ============================================================== */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 premium-dark-surface text-white h-screen z-30 border-r border-white/10 transition-all duration-300 ease-develop ${
          isSidebarCollapsed ? 'w-[78px]' : 'w-[260px]'
        }`}
      >
        {/* Cabecera del Sidebar con Logo Develop */}
        <div className={`p-4 border-b border-white/10 relative z-10 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0f094f] via-[#29008e] to-[#640354] p-[1.5px] shadow-develop-box relative group shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#07052e]/80 backdrop-blur-xs flex items-center justify-center font-black text-lg text-white tracking-tight border border-white/15">
                  D
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#a78bfa] shadow-[0_0_8px_#a78bfa] animate-pulse"></span>
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white truncate">
                    Develop <span className="gradient-text">CRM</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest pill-dark">
                    Enterprise
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              title="Expandir menú lateral"
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0f094f] via-[#29008e] to-[#640354] p-[1.5px] shadow-develop-box relative group shrink-0 hover:scale-105 transition-transform"
            >
              <div className="w-full h-full rounded-[14px] bg-[#07052e]/80 backdrop-blur-xs flex items-center justify-center font-black text-lg text-white tracking-tight border border-white/15">
                D
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#a78bfa] shadow-[0_0_8px_#a78bfa] animate-pulse"></span>
              </div>
            </button>
          )}

          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              title="Colapsar menú lateral"
              className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Módulos de Navegación */}
        <nav className="flex-1 p-3 space-y-1.5 relative z-10 overflow-y-auto">
          {!isSidebarCollapsed && (
            <div className="text-[10px] font-bold uppercase text-white/40 tracking-[0.22em] mb-2 px-3">
              Módulos
            </div>
          )}
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentView === id;
            return (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                title={isSidebarCollapsed ? label : undefined}
                className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 relative group ${
                  isSidebarCollapsed
                    ? 'justify-center p-3'
                    : 'px-3.5 py-2.5 text-[13px] font-semibold'
                } ${
                  isActive
                    ? 'btn-primary-dark shadow-develop-glow'
                    : 'text-white/70 hover:text-white hover:bg-white/8'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${id === 'events-kit' && !isActive ? 'text-[#a78bfa]' : ''}`} />
                {!isSidebarCollapsed && (
                  <>
                    <span className="truncate">{label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#a78bfa] shadow-[0_0_6px_#a78bfa]"></span>
                    )}
                  </>
                )}

                {/* Tooltip flotante en modo colapsado */}
                {isSidebarCollapsed && (
                  <span className="absolute left-full ml-3 px-3 py-1.5 bg-[#07052e] text-white text-xs font-semibold rounded-xl shadow-develop-dark-card opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-white/15">
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Perfil del Ejecutivo al pie del Sidebar */}
        <div className={`p-3.5 border-t border-white/10 relative z-10 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#f472b6] p-[1.5px] shadow-sm shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#07052e] flex items-center justify-center text-xs font-bold text-white border border-white/20">
                CM
              </div>
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">Carlos Mendoza</div>
                <div className="text-[10px] text-[#a78bfa] font-medium flex items-center gap-1 truncate">
                  <ShieldCheck className="w-3 h-3 text-[#a78bfa] shrink-0" />
                  Partner de Vinculación
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* DRAWER MÓVIL / TABLET (Off-Canvas con Backdrop Blur)          */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Fondo difuminado */}
          <div
            className="fixed inset-0 bg-[#07052e]/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Panel deslizante */}
          <aside className="fixed inset-y-0 left-0 w-[280px] max-w-[85vw] premium-dark-surface text-white flex flex-col shadow-develop-modal z-10 border-r border-white/10 animate-slideRight">
            {/* Header del Drawer */}
            <div className="p-5 flex items-center justify-between border-b border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0f094f] via-[#29008e] to-[#640354] p-[1.5px] shadow-develop-box relative">
                  <div className="w-full h-full rounded-[14px] bg-[#07052e]/80 flex items-center justify-center font-black text-lg text-white border border-white/15">
                    D
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#a78bfa] shadow-[0_0_6px_#a78bfa] animate-pulse"></span>
                  </div>
                </div>
                <div>
                  <div className="font-extrabold text-base tracking-tight text-white">
                    Develop <span className="gradient-text">CRM</span>
                  </div>
                  <div className="text-[10px] text-white/60">Enterprise Ecosystem</div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menú de Módulos */}
            <nav className="flex-1 p-4 space-y-1.5 relative z-10 overflow-y-auto">
              <div className="text-[10px] font-bold uppercase text-white/40 tracking-[0.22em] mb-2 px-3">
                Navegación
              </div>
              {navItems.map(({ id, label, icon: Icon }) => {
                const isActive = currentView === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setCurrentView(id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'btn-primary-dark shadow-develop-glow'
                        : 'text-white/70 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${id === 'events-kit' && !isActive ? 'text-[#a78bfa]' : ''}`} />
                    <span>{label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#a78bfa]"></span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Perfil en Drawer */}
            <div className="p-4 border-t border-white/10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#f472b6] p-[1.5px]">
                  <div className="w-full h-full rounded-[10px] bg-[#07052e] flex items-center justify-center text-xs font-bold text-white">
                    CM
                  </div>
                </div>
                <div>
                  <div className="font-bold text-xs text-white">Carlos Mendoza</div>
                  <div className="text-[10px] text-[#a78bfa] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#a78bfa]" />
                    Partner de Vinculación
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ============================================================== */}
      {/* CONTENEDOR PRINCIPAL FLUIDO (APP SHELL)                        */}
      {/* El sidebar permanece fijo y el área de contenido se desplaza    */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Barra Contextual Superior (Header de Aplicación) */}
        <header className="shrink-0 h-16 bg-white/85 backdrop-blur-md border-b border-black/5 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            {/* Botón de apertura en móvil/tablet */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#111111] hover:bg-black/5 transition-colors"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Botón para alternar sidebar en desktop */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl text-[#555555] hover:text-[#111111] hover:bg-black/5 transition-colors"
              title={isSidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Breadcrumb contextual del módulo activo */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#888888] hidden sm:inline">Develop CRM</span>
              <span className="text-[#888888] hidden sm:inline">/</span>
              <span className="font-bold text-[#111111] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#29008e]"></span>
                {currentNav?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Estado del Sistema */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistema En Línea
            </div>

            {/* Ficha de Usuario en Topbar */}
            <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-black/5">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-[#111111]">Carlos Mendoza</div>
                <div className="text-[10px] text-[#555555]">Sede CDMX</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#f472b6] p-[1px]">
                <div className="w-full h-full rounded-[10px] bg-[#07052e] flex items-center justify-center text-[10px] font-bold text-white">
                  CM
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Área de Contenido con Scroll Propio Suave */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8">
            {currentView === 'crm-pipeline' && (
              <DealsPipeline
                deals={deals}
                companies={companies}
                onUpdateDealStage={handleUpdateDealStage}
                onAddDeal={handleAddDeal}
                onSelectSchoolForCRM={handleOpenSchoolInCRM}
                onOpenEventKit={handleOpenEventKit}
                onAddActivity={handleAddActivity}
                onAbrirRegistroQr={(dealId) => {
                  setActiveQrDealId(dealId);
                  setCurrentView('registro-alumno-qr');
                }}
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
                onImportCompanies={handleImportCompanies}
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

            {currentView === 'registro-alumno-qr' && (() => {
              const tratoActivo = deals.find((d) => d.id === activeQrDealId) || deals[0];
              const universidadActiva = companies.find((c) => c.id === tratoActivo?.companyId);

              return (
                <div className="py-2 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-black/5 shadow-xs">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#29008e]">
                        Modo Stand de Vinculación Universitaria
                      </div>
                      <div className="text-xs text-[#555555] mt-0.5">
                        Iniciativa activa:{' '}
                        <strong className="text-[#0f094f]">{tratoActivo?.title}</strong> ({universidadActiva?.name})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentView('crm-pipeline')}
                        className="btn-secondary-light text-xs py-2 px-3.5 rounded-xl font-bold"
                      >
                        Volver al Pipeline
                      </button>
                    </div>
                  </div>

                  <FormularioRegistroAlumnoQr
                    oportunidadId={tratoActivo?.id || ''}
                    universidadId={tratoActivo?.companyId || ''}
                    nombreUniversidad={universidadActiva?.name || 'Universidad Aliada'}
                    tituloEvento={tratoActivo?.title || 'Feria de Empleo & Talento'}
                    alRegistrarExitoso={() => {
                      if (tratoActivo) {
                        handleUpdateDealLeads(tratoActivo.id, (tratoActivo.registeredLeadsCount || 0) + 1);
                      }
                    }}
                    alCerrarVista={() => setCurrentView('crm-pipeline')}
                  />
                </div>
              );
            })()}
          </main>

          {/* Footer Enterprise Develop Integrado al final del scroll */}
          <footer className="mt-auto premium-dark-surface border-t border-white/10 py-5 text-xs text-white/70">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#a78bfa] shadow-[0_0_6px_#a78bfa]"></span>
                <span className="font-bold text-white">Develop Enterprise Ecosystem</span>
                <span className="text-white/30">•</span>
                <span>Plataforma de Vinculación Universitaria & Talento Tech</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-white/50">
                <span>Inter Typography</span>
                <span>•</span>
                <span>Algoritmo Logístico TSP</span>
                <span>•</span>
                <span>Motor de Contenidos IA</span>
                <span>•</span>
                <span className="font-semibold text-[#a78bfa]">Develop Digital 2026</span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BARRA DE NAVEGACIÓN INFERIOR PARA MÓVIL (< 1024px)             */}
      {/* Acceso ergonómico y rápido con el pulgar                       */}
      {/* ============================================================== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07052e]/95 backdrop-blur-md border-t border-white/10 py-1.5 px-3 flex items-center justify-around shadow-develop-modal">
        {navItems.map(({ id, shortLabel, icon: Icon }) => {
          const isActive = currentView === id;
          return (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
                isActive ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-white/15 text-[#a78bfa] shadow-[0_0_12px_rgba(167,139,250,0.3)]' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="truncate">{shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
