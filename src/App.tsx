import React, { useState, useRef } from 'react';
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
import { LoginView, PerfilUsuario, PERFILES_DEMO } from './components/auth/LoginView';
import { MarketingAutomationModule } from './components/marketing/MarketingAutomationModule';
import { ExecutiveRoiDashboard } from './components/analytics/ExecutiveRoiDashboard';
import { generarCampanaAutomaticaParaOportunidad } from './services/servicioMarketing';
import { clienteSupabase, verificarConexionSupabase } from './services/clienteSupabase';
import {
  obtenerUniversidadesDesdeBD,
  verificarConexionBaseDatos,
  poblarDatosSemillaEnSupabase,
  limpiarBaseDatosSupabase,
  obtenerOportunidades,
  guardarOportunidad,
  mapearOportunidadADeal,
  mapearDealAOportunidad
} from './services/servicioCrm';
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
  Database,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  LogOut,
  Calendar,
  CheckSquare,
  Clock,
  Phone,
  Mail,
  Users,
  FileText,
  Check,
  ChevronRight,
  User
} from 'lucide-react';

type MainView = 'crm-pipeline' | 'crm-schools' | 'routes' | 'events-kit' | 'marketing' | 'analitica-roi' | 'registro-alumno-qr';

export function App() {
  const [currentView, setCurrentView] = useState<MainView>('crm-pipeline');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estado de autenticación y perfil de usuario activo
  const [usuarioActivo, setUsuarioActivo] = useState<PerfilUsuario>(() => {
    try {
      const guardado = localStorage.getItem('pap_crm_perfil_usuario');
      if (guardado) return JSON.parse(guardado);
    } catch {}
    return PERFILES_DEMO[0];
  });

  const [sesionIniciada, setSesionIniciada] = useState<boolean>(() => {
    try {
      const sesionGuardada = localStorage.getItem('pap_crm_sesion_activa');
      if (sesionGuardada !== null) {
        return sesionGuardada === 'true';
      }
    } catch {}
    return true; // Sesión iniciada por defecto para no obstruir el flujo inicial
  });

  const manejarIniciarSesion = (perfil: PerfilUsuario) => {
    setUsuarioActivo(perfil);
    setSesionIniciada(true);
    try {
      localStorage.setItem('pap_crm_sesion_activa', 'true');
      localStorage.setItem('pap_crm_perfil_usuario', JSON.stringify(perfil));
    } catch {}
    if (perfil.rol === 'promotor') {
      setCurrentView('registro-alumno-qr');
    } else {
      setCurrentView('crm-pipeline');
    }
  };

  const manejarCerrarSesion = () => {
    setSesionIniciada(false);
    try {
      localStorage.setItem('pap_crm_sesion_activa', 'false');
    } catch {}
  };
  
  // Estado de conexión a base de datos Supabase
  const [estadoBd, setEstadoBd] = useState<{
    conectada: boolean;
    totalUniversidades: number;
    cargando: boolean;
  }>({
    conectada: false,
    totalUniversidades: 0,
    cargando: true
  });

  // Estados de control administrativo
  const [modalVaciarAbierto, setModalVaciarAbierto] = useState(false);
  const [cargandoAccionBd, setCargandoAccionBd] = useState(false);
  const [notificacionToast, setNotificacionToast] = useState<{
    tipo: 'exito' | 'error' | 'info';
    titulo: string;
    mensaje: string;
  } | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const mostrarToast = (
    tipo: 'exito' | 'error' | 'info',
    titulo: string,
    mensaje: string,
    duracionMs: number = 4500
  ) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setNotificacionToast({ tipo, titulo, mensaje });
    toastTimerRef.current = setTimeout(() => {
      setNotificacionToast(null);
    }, duracionMs);
  };

  // Estados de datos en memoria reactivos con persistencia resiliente
  const [companies, setCompanies] = useState<Company[]>(() => {
    try {
      const guardadas = localStorage.getItem('pap_crm_universidades_local');
      if (guardadas !== null) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error cargando universidades locales:', e);
    }
    return [];
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const guardadas = localStorage.getItem('pap_crm_universidades_local');
      if (guardadas !== null && JSON.parse(guardadas).length === 0) {
        return [];
      }
    } catch {}
    return SEED_CONTACTS;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    try {
      const guardadas = localStorage.getItem('pap_crm_oportunidades_local');
      if (guardadas !== null) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(mapearOportunidadADeal);
        }
      }
    } catch {}
    return [];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    try {
      const guardadas = localStorage.getItem('pap_crm_actividades_local');
      if (guardadas !== null) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {}
    return SEED_ACTIVITIES;
  });
  const [panelTareasAbierto, setPanelTareasAbierto] = useState(false);
  const [filtroTareas, setFiltroTareas] = useState<'pendientes' | 'todas' | 'completadas'>('pendientes');
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);

  // Estado para abrir ficha modal de escuela específica desde cualquier módulo
  const [selectedSchoolDetailId, setSelectedSchoolDetailId] = useState<string | null>(null);

  // Estados para la ruta precargada
  const [escuelaRutaSeleccionadaId, setEscuelaRutaSeleccionadaId] = useState<string | null>(null);
  const [escuelasRutaIds, setEscuelasRutaIds] = useState<string[] | null>(null);
  const [tituloGiraRuta, setTituloGiraRuta] = useState<string | undefined>(undefined);
  const [fechaRutaSeleccionada, setFechaRutaSeleccionada] = useState<string | undefined>(undefined);
  const [asesorRutaSeleccionada, setAsesorRutaSeleccionada] = useState<string | undefined>(undefined);

  // Estado para kit comercial activo seleccionado desde el CRM o directamente
  const [activeEventKitDealId, setActiveEventKitDealId] = useState<string | null>(deals[0]?.id || null);

  // Estado para la oportunidad activa en el Formulario QR de captura de alumnos
  const [activeQrDealId, setActiveQrDealId] = useState<string | null>(deals[0]?.id || null);
  const [modalQrAbierto, setModalQrAbierto] = useState(false);

  // Soporte para abrir directamente el formulario QR por URL (?vista=registro-alumno-qr&dealId=xxx)
  React.useEffect(() => {
    try {
      const parametros = new URLSearchParams(window.location.search);
      const vistaParam = parametros.get('vista');
      const dealIdParam = parametros.get('dealId');
      if (vistaParam === 'registro-alumno-qr') {
        if (dealIdParam) setActiveQrDealId(dealIdParam);
        setModalQrAbierto(true);
        setCurrentView('crm-pipeline');
      }
    } catch {
      // Entorno sin window
    }
  }, []);

  // Sincronización reactiva con Supabase al iniciar la aplicación
  const sincronizarDatosDesdeBd = async () => {
    try {
      setEstadoBd((prev) => ({ ...prev, cargando: true }));
      const estadoConexion = await verificarConexionBaseDatos();
      const univsBd = await obtenerUniversidadesDesdeBD();
      const oporBd = await obtenerOportunidades();
      
      setCompanies(univsBd);
      if (oporBd && oporBd.length > 0) {
        setDeals(oporBd.map(mapearOportunidadADeal));
      } else {
        setDeals([]);
      }

      setEstadoBd({
        conectada: estadoConexion.conectada,
        totalUniversidades: univsBd.length,
        cargando: false
      });
    } catch (error) {
      console.warn('Error sincronizando con base de datos:', error);
      setEstadoBd((prev) => ({ ...prev, cargando: false }));
    }
  };

  React.useEffect(() => {
    sincronizarDatosDesdeBd();
  }, []);

  // Cargar lote inicial de datos semilla en PostgreSQL Supabase
  const manejarCargarSemilla = async () => {
    setCargandoAccionBd(true);
    try {
      const res = await poblarDatosSemillaEnSupabase();
      if (res.exito) {
        await sincronizarDatosDesdeBd();
        setActivities(SEED_ACTIVITIES);
        try {
          localStorage.setItem('pap_crm_actividades_local', JSON.stringify(SEED_ACTIVITIES));
        } catch {}
        mostrarToast(
          'exito',
          'Catálogo Oficial Poblado',
          `Se cargaron ${res.totalUniversidades} instituciones, ${res.totalContactos} contactos y ${res.totalOportunidades} oportunidades en PostgreSQL.`
        );
      } else {
        mostrarToast(
          'error',
          'Aviso de Carga',
          `No se pudieron cargar los datos semilla: ${res.error || 'Verifica la conexión'}`
        );
      }
    } catch (e: any) {
      mostrarToast(
        'error',
        'Error',
        `Fallo durante la carga semilla: ${e?.message || 'Error desconocido'}`
      );
    } finally {
      setCargandoAccionBd(false);
    }
  };

  // Vaciar cartera de instituciones en base de datos y memoria local
  const manejarVaciarCartera = async () => {
    setCargandoAccionBd(true);
    try {
      await limpiarBaseDatosSupabase();
      setCompanies([]);
      setDeals([]);
      setContacts([]);
      setActivities([]);
      try {
        localStorage.removeItem('pap_crm_actividades_local');
      } catch {}
      setCampaigns([]);
      setEstadoBd((prev) => ({ ...prev, totalUniversidades: 0 }));
      setModalVaciarAbierto(false);
      mostrarToast(
        'info',
        'Cartera Reiniciada',
        'La base de datos y los respaldos locales se encuentran limpios en 0 para nuevas ingestas.'
      );
    } catch (e: any) {
      mostrarToast(
        'error',
        'Error al Vaciar',
        `No fue posible vaciar la cartera: ${e?.message || 'Error desconocido'}`
      );
    } finally {
      setCargandoAccionBd(false);
    }
  };

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

    // Disparador automático de Marketing: Al cambiar a 'agendado', generar automáticamente campaña multicanal
    if (newStage === 'agendado') {
      const dealObjetivo = deals.find((d) => d.id === dealId);
      if (dealObjetivo) {
        const compObjetivo = companies.find((c) => c.id === dealObjetivo.companyId);
        const campanaGenerada = generarCampanaAutomaticaParaOportunidad(
          { ...dealObjetivo, stage: 'agendado' },
          compObjetivo
        );

        // Registrar actividad en la bitácora del CRM
        handleAddActivity({
          companyId: dealObjetivo.companyId,
          dealId: dealObjetivo.id,
          type: 'task',
          title: `Campaña Multicanal Generada Automáticamente`,
          description: `Oportunidad en etapa "Agendado". Se generó y programó la parrilla de difusión en LinkedIn, Instagram, TikTok y Meta con código QR de registro (${campanaGenerada.publicaciones.length} publicaciones). Presupuesto de difusión: $${campanaGenerada.presupuestoMxn.toLocaleString('es-MX')} MXN.`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          completed: true,
          author: 'Automatización de Marketing PAP'
        });
      }
    }
  };

  // Agregar nuevo trato con persistencia dual
  const handleAddDeal = async (newDealData: Omit<Deal, 'id' | 'createdAt'>) => {
    const idTemporal = `deal-${Date.now()}`;
    const newDeal: Deal = {
      ...newDealData,
      id: idTemporal,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDeals((prev) => [newDeal, ...prev]);

    // Persistir de inmediato en PostgreSQL Supabase y respaldo local
    try {
      const opoGuardada = await guardarOportunidad(mapearDealAOportunidad(newDeal));
      if (opoGuardada) {
        const dealPersistido = mapearOportunidadADeal(opoGuardada);
        setDeals((prev) => prev.map((d) => (d.id === idTemporal ? dealPersistido : d)));
      }
    } catch (err) {
      console.warn('Error persistiendo oportunidad:', err);
    }

    // Registrar actividad en el CRM automáticamente
    const targetComp = companies.find((c) => c.id === newDeal.companyId);
    handleAddActivity({
      companyId: newDeal.companyId,
      dealId: newDeal.id,
      type: 'task',
      title: `Oportunidad Creada: ${newDeal.title}`,
      description: `Se abrió una nueva oportunidad comercial por $${newDeal.amount.toLocaleString('es-MX')} MXN para ${targetComp?.name || 'la institución'}.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      completed: true,
      author: newDeal.assignedRep
    });

    mostrarToast(
      'exito',
      'Oportunidad Registrada',
      `Se agregó "${newDeal.title}" con pronóstico de $${newDeal.amount.toLocaleString('es-MX')} MXN.`
    );
  };

  // Actualizar detalles y notas de un trato / oportunidad
  const handleUpdateDealDetails = (dealId: string, updates: Partial<Deal>) => {
    setDeals((prev) =>
      prev.map((deal) => (deal.id === dealId ? { ...deal, ...updates } : deal))
    );
    mostrarToast(
      'exito',
      'Oportunidad Actualizada',
      'Los acuerdos y detalles del trato han sido guardados con éxito.'
    );
  };

  // Eliminar oportunidad definitivamente de la cartera
  const handleDeleteDeal = (dealId: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== dealId));
    mostrarToast(
      'info',
      'Oportunidad Eliminada',
      'La oportunidad comercial ha sido eliminada definitivamente del CRM.'
    );
  };

  // Agregar actividad al timeline de una escuela
  const handleAddActivity = (activityData: Omit<Activity, 'id'>) => {
    const newActivity: Activity = {
      ...activityData,
      id: `act-${Date.now()}`
    };
    setActivities((prev) => {
      const actualizadas = [newActivity, ...prev];
      try {
        localStorage.setItem('pap_crm_actividades_local', JSON.stringify(actualizadas));
      } catch {}
      return actualizadas;
    });
  };

  const handleToggleActivity = (activityId: string) => {
    setActivities((prev) => {
      const actualizadas = prev.map((act) =>
        act.id === activityId ? { ...act, completed: !act.completed } : act
      );
      try {
        localStorage.setItem('pap_crm_actividades_local', JSON.stringify(actualizadas));
      } catch {}
      return actualizadas;
    });
  };

  // Importar instituciones educativas desde Excel o CSV a la cartera activa
  const handleImportCompanies = async (newCompanies: Company[]) => {
    setCompanies((prev) => {
      // Filtrar para evitar duplicados por ID
      const idsExistentes = new Set(prev.map((p) => p.id));
      const noDuplicadas = newCompanies.filter((c) => !idsExistentes.has(c.id));
      const actualizadas = [...noDuplicadas, ...prev];
      try {
        localStorage.setItem('pap_crm_universidades_local', JSON.stringify(actualizadas));
      } catch (e) {
        console.warn('Error guardando universidades en localStorage:', e);
      }
      return actualizadas;
    });

    // Actualizar el contador en el Topbar consultando Supabase PostgreSQL
    try {
      const conexionOk = await verificarConexionSupabase();
      if (conexionOk) {
        const { count } = await clienteSupabase
          .from('universidades')
          .select('*', { count: 'exact', head: true });
        
        setEstadoBd((prev) => ({
          ...prev,
          totalUniversidades: count ?? prev.totalUniversidades
        }));
      }
    } catch (e) {
      console.warn('Error sincronizando contador de universidades con Supabase:', e);
    }

    mostrarToast(
      'exito',
      'Instituciones Importadas',
      `Se incorporaron exitosamente ${newCompanies.length} instituciones a la cartera activa.`
    );
  };

  // Registrar itinerario de ruta y viáticos en la agenda del CRM
  const handleLogRouteToCRM = (trip: any, fechaGira?: string, asesor?: string) => {
    const paradas = trip.paradas || trip.stops || [];
    const fechaBase = fechaGira || new Date().toISOString().split('T')[0];
    const totalViaticos = (trip.viaticos?.total_viaticos_mxn ?? trip.viaticos?.totalViaticosMxn ?? 0).toLocaleString('es-MX');
    const autorAsesor = asesor || 'Carlos Mendoza';

    paradas.forEach((stop: any) => {
      const escuelaId = stop.universidad_id || stop.schoolId;
      const nombreEscuela = stop.nombre || stop.name;
      const horaLlegada = stop.hora_reunion_recomendada || stop.recommendedMeetingHour || '09:00 hrs';
      const director = stop.director_nombre || stop.directorName || 'Director(a) de Vinculación';

      handleAddActivity({
        companyId: escuelaId,
        type: 'meeting',
        title: `Visita Presencial Agendada en Gira: ${nombreEscuela}`,
        description: `Llegada recomendada: ${horaLlegada}. Reunión con ${director}. Viáticos autorizados para la gira: $${totalViaticos} MXN.`,
        date: `${fechaBase} ${horaLlegada.replace(' hrs', '')}`,
        completed: false,
        author: autorAsesor
      });
    });

    mostrarToast(
      'exito',
      'Gira Comercial Agendada',
      `Se integraron ${paradas.length} paradas y viáticos ($${totalViaticos} MXN) a la bitácora del CRM.`
    );
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

  const handleTrazarRutaParaEscuela = (escuelaId: string, fecha?: string, asesor?: string) => {
    setEscuelaRutaSeleccionadaId(escuelaId);
    setEscuelasRutaIds(null);
    setTituloGiraRuta(undefined);
    if (fecha) setFechaRutaSeleccionada(fecha);
    if (asesor) setAsesorRutaSeleccionada(asesor);
    setCurrentView('routes');
  };

  const handleTrazarGiraMultisede = (schoolIds: string[], titulo?: string, fecha?: string, asesor?: string) => {
    setEscuelasRutaIds(schoolIds);
    setTituloGiraRuta(titulo);
    setEscuelaRutaSeleccionadaId(null);
    if (fecha) setFechaRutaSeleccionada(fecha);
    if (asesor) setAsesorRutaSeleccionada(asesor);
    setCurrentView('routes');
  };

  const handleAbrirStandQrDesdeRuta = (schoolId: string) => {
    const tratoCorrespondiente = deals.find((d) => d.companyId === schoolId) || deals[0];
    if (tratoCorrespondiente) {
      setActiveQrDealId(tratoCorrespondiente.id);
    }
    setModalQrAbierto(true);
  };

  const navItems = [
    { id: 'crm-pipeline' as MainView, label: 'Pipeline de Ventas', shortLabel: 'Pipeline', icon: LayoutDashboard },
    { id: 'crm-schools' as MainView, label: 'Directorio 360°', shortLabel: 'Directorio', icon: Building2 },
    { id: 'routes' as MainView, label: 'Rutas Logísticas', shortLabel: 'Rutas', icon: MapPin },
    { id: 'events-kit' as MainView, label: 'Kits & Contenidos IA', shortLabel: 'Kits IA', icon: Sparkles }
  ];

  const currentNav = navItems.find((n) => n.id === currentView) || navItems[0];
  const inicialesUsuario = usuarioActivo.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  if (!sesionIniciada) {
    return <LoginView onIniciarSesion={manejarIniciarSesion} />;
  }

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
        <div className={`p-3 border-t border-white/10 relative z-10 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center justify-between gap-2 min-w-0 w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#f472b6] p-[1.5px] shadow-sm shrink-0">
                <div className="w-full h-full rounded-[9px] bg-[#07052e] flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
                  {inicialesUsuario}
                </div>
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <div className="font-bold text-xs text-white truncate">{usuarioActivo.nombre}</div>
                  <div className="text-[10px] text-[#a78bfa] font-medium flex items-center gap-1 truncate">
                    <ShieldCheck className="w-3 h-3 text-[#a78bfa] shrink-0" />
                    {usuarioActivo.etiquetaRol}
                  </div>
                </div>
              )}
            </div>
            {!isSidebarCollapsed && (
              <button
                onClick={manejarCerrarSesion}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
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
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#f472b6] p-[1.5px] shrink-0">
                    <div className="w-full h-full rounded-[10px] bg-[#07052e] flex items-center justify-center text-xs font-bold text-white">
                      {inicialesUsuario}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate">{usuarioActivo.nombre}</div>
                    <div className="text-[10px] text-[#a78bfa] font-medium flex items-center gap-1 truncate">
                      <ShieldCheck className="w-3 h-3 text-[#a78bfa] shrink-0" />
                      {usuarioActivo.etiquetaRol}
                    </div>
                  </div>
                </div>
                <button
                  onClick={manejarCerrarSesion}
                  title="Cerrar sesión"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors cursor-pointer shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indicador de Estado de Base de Datos Supabase PostgreSQL */}
            {estadoBd.conectada ? (
              <div
                title="Conexión en tiempo real activa con Supabase PostgreSQL local"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">PostgreSQL Local Conectado ({estadoBd.totalUniversidades} escuelas)</span>
                <span className="sm:hidden">PG Conectado ({estadoBd.totalUniversidades})</span>
              </div>
            ) : (
              <div
                title="Operando en memoria local (localStorage) de contingencia"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="hidden sm:inline">Modo Respaldo Local (Sin conexión a BD)</span>
                <span className="sm:hidden">Respaldo Local</span>
              </div>
            )}

            {/* Botones Administrativos Discretos */}
            <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-black/5">
              <button
                onClick={manejarCargarSemilla}
                disabled={cargandoAccionBd}
                title="Poblar catálogo de prueba oficial en PostgreSQL (SEED_COMPANIES, contactos y tratos)"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#0f094f]/5 text-[#0f094f] hover:bg-[#0f094f]/10 border border-[#0f094f]/15 transition-all disabled:opacity-50"
              >
                <Database className={`w-3.5 h-3.5 text-[#29008e] ${cargandoAccionBd ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Cargar Semilla en BD</span>
              </button>

              <button
                onClick={() => setModalVaciarAbierto(true)}
                disabled={cargandoAccionBd}
                title="Limpiar base de datos y reiniciar en modo cartera vacía para pruebas limpias de Excel"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100/80 border border-red-200/60 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden md:inline">Vaciar Cartera (Modo Limpio)</span>
              </button>
            </div>

            {/* Botón de Centro de Agenda & Compromisos Globales */}
            <div className="flex items-center pl-1 sm:pl-2 border-l border-black/5">
              <button
                onClick={() => setPanelTareasAbierto(true)}
                title="Agenda consolidada de acuerdos, tareas y visitas en todas las instituciones"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                  panelTareasAbierto
                    ? 'bg-[#29008e] text-white shadow-develop-glow'
                    : 'bg-white hover:bg-[#07052e]/5 text-[#07052e] border border-black/10'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#29008e]" />
                <span className="hidden md:inline">Agenda de Tareas</span>
                {activities.filter((a) => !a.completed).length > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-[#f472b6] text-white leading-tight">
                    {activities.filter((a) => !a.completed).length}
                  </span>
                )}
              </button>
            </div>

            {/* Ficha de Usuario en Topbar con acción de Cerrar Sesión */}
            <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-black/5">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-[#111111]">{usuarioActivo.nombre}</div>
                <div className="text-[10px] text-[#555555]">{usuarioActivo.etiquetaRol}</div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#f472b6] p-[1px]">
                <div className="w-full h-full rounded-[10px] bg-[#07052e] flex items-center justify-center text-[10px] font-bold text-white">
                  {inicialesUsuario}
                </div>
              </div>
              <button
                onClick={manejarCerrarSesion}
                title="Cerrar sesión y ver portal de acceso"
                className="p-1.5 rounded-lg text-[#888888] hover:text-red-600 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
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
                onUpdateDealDetails={handleUpdateDealDetails}
                onDeleteDeal={handleDeleteDeal}
                esSuperusuario={usuarioActivo.rol === 'superusuario'}
                onSelectSchoolForCRM={handleOpenSchoolInCRM}
                onOpenEventKit={handleOpenEventKit}
                onAddActivity={handleAddActivity}
                onAbrirRegistroQr={(dealId) => {
                  setActiveQrDealId(dealId);
                  setModalQrAbierto(true);
                }}
                onCargarSemilla={manejarCargarSemilla}
                onIrAImportar={() => setCurrentView('crm-schools')}
                onTrazarRuta={handleTrazarRutaParaEscuela}
                onTrazarGiraMultisede={handleTrazarGiraMultisede}
              />
            )}

            {currentView === 'crm-schools' && (
              <CompaniesList
                companies={companies}
                contacts={contacts}
                deals={deals}
                activities={activities}
                onAddActivity={handleAddActivity}
                onToggleActivity={handleToggleActivity}
                onNavigateToRoutePlanner={() => handleTrazarRutaParaEscuela(selectedSchoolDetailId || '')}
                selectedCompanyId={selectedSchoolDetailId}
                onCloseCompanyDetail={() => setSelectedSchoolDetailId(null)}
                onOpenCompanyDetail={(id) => setSelectedSchoolDetailId(id)}
                onImportCompanies={handleImportCompanies}
                onCargarSemilla={manejarCargarSemilla}
                onAddContact={(newContact) => setContacts((prev) => [newContact, ...prev])}
              />
            )}

            {currentView === 'routes' && (
              <SchoolRoutePlanner
                schools={companies}
                onSelectSchoolForCRM={handleOpenSchoolInCRM}
                onLogRouteToCRM={handleLogRouteToCRM}
                escuelaPreseleccionadaId={escuelaRutaSeleccionadaId}
                escuelasPreseleccionadasIds={escuelasRutaIds}
                tituloGiraPreseleccionada={tituloGiraRuta}
                fechaPreseleccionada={fechaRutaSeleccionada}
                asesorPreseleccionado={asesorRutaSeleccionada}
                onLimpiarEscuelaPreseleccionada={() => {
                  setEscuelaRutaSeleccionadaId(null);
                  setEscuelasRutaIds(null);
                  setTituloGiraRuta(undefined);
                  setFechaRutaSeleccionada(undefined);
                  setAsesorRutaSeleccionada(undefined);
                }}
                onAbrirStandQr={handleAbrirStandQrDesdeRuta}
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

            {currentView === 'marketing' && (
              <MarketingAutomationModule
                deals={deals}
                companies={companies}
                onNavigateToDeal={(dealId) => {
                  setActiveEventKitDealId(dealId);
                  setCurrentView('events-kit');
                }}
              />
            )}

            {currentView === 'analitica-roi' && (
              <ExecutiveRoiDashboard
                deals={deals}
                companies={companies}
                onNavigateToPipeline={() => setCurrentView('crm-pipeline')}
                onNavigateToRoutes={() => setCurrentView('routes')}
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
                    carrerasSugeridas={Array.isArray(universidadActiva?.datos_adicionales?.carreras) ? universidadActiva.datos_adicionales.carreras : undefined}
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

      {/* ============================================================== */}
      {/* MODAL SUPERPUESTO DE CAPTURA QR CON FONDO OSCURO DESENFOCADO    */}
      {/* ============================================================== */}
      {modalQrAbierto && (() => {
        const tratoActivo = deals.find((d) => d.id === activeQrDealId) || deals[0];
        const universidadActiva = companies.find((c) => c.id === tratoActivo?.companyId);

        const cerrarModal = () => {
          setModalQrAbierto(false);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fadeIn">
            {/* Fondo oscuro desenfocado */}
            <div
              className="fixed inset-0 bg-[#07052e]/80 backdrop-blur-md transition-opacity cursor-pointer"
              onClick={cerrarModal}
              title="Cerrar modal"
            />

            {/* Contenedor relativo centrado */}
            <div className="relative z-10 w-full max-w-lg my-auto shadow-develop-modal">
              <FormularioRegistroAlumnoQr
                oportunidadId={tratoActivo?.id || ''}
                universidadId={tratoActivo?.companyId || ''}
                nombreUniversidad={universidadActiva?.name || 'Universidad Aliada'}
                tituloEvento={tratoActivo?.title || 'Feria de Empleo & Talento'}
                carrerasSugeridas={Array.isArray(universidadActiva?.datos_adicionales?.carreras) ? universidadActiva.datos_adicionales.carreras : undefined}
                esModal={true}
                alRegistrarExitoso={() => {
                  if (tratoActivo) {
                    handleUpdateDealLeads(tratoActivo.id, (tratoActivo.registeredLeadsCount || 0) + 1);
                  }
                }}
                alCerrarVista={cerrarModal}
              />
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* MODAL DE CONFIRMACIÓN: VACIAR CARTERA (MODO LIMPIO)           */}
      {/* ============================================================== */}
      {modalVaciarAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07052e]/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-develop-modal border border-black/10 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4 border border-red-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#111111] tracking-tight">
              ¿Vaciar Cartera y Reiniciar en Modo Limpio?
            </h3>
            
            <p className="text-xs text-[#555555] mt-2 leading-relaxed">
              Esta acción ejecutará un borrado masivo controlado en las tablas de <strong>PostgreSQL</strong> (actividades, prospectos, rutas, oportunidades y universidades) y restablecerá los respaldos locales a 0 registros.
            </p>

            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Ideal para validar la ingesta limpia de archivos <strong>Excel (.xlsx) y CSV</strong> desde cero o para restaurar semillas cuando lo requieras.
              </span>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setModalVaciarAbierto(false)}
                disabled={cargandoAccionBd}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#555555] hover:bg-black/5 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={manejarVaciarCartera}
                disabled={cargandoAccionBd}
                className="btn-danger-develop px-4 py-2 text-xs font-bold inline-flex items-center gap-2 disabled:opacity-50"
              >
                {cargandoAccionBd ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Vaciando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Vaciar Cartera</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DRAWER LATERAL: CENTRO GLOBAL DE TAREAS Y COMPROMISOS CRM       */}
      {/* ============================================================== */}
      {panelTareasAbierto && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop con Blur */}
          <div
            className="fixed inset-0 bg-[#07052e]/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setPanelTareasAbierto(false)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
            <div className="w-screen max-w-md sm:max-w-lg bg-white shadow-develop-modal border-l border-black/10 flex flex-col animate-slideLeft">
              {/* Cabecera del Panel */}
              <div className="p-5 border-b border-black/10 bg-gradient-to-r from-[#07052e] via-[#0f094f] to-[#29008e] text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-[#a78bfa]">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                        Agenda Global de Compromisos
                      </h3>
                      <p className="text-xs text-white/70">
                        Bitácora consolidada de todas las instituciones educativas
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setPanelTareasAbierto(false)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Cerrar panel de agenda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Métricas rápidas */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-white/60">Pendientes</div>
                    <div className="text-lg font-black text-[#f472b6]">
                      {activities.filter((a) => !a.completed).length}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-white/60">Realizadas</div>
                    <div className="text-lg font-black text-emerald-400">
                      {activities.filter((a) => a.completed).length}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-white/60">Total</div>
                    <div className="text-lg font-black text-[#a78bfa]">
                      {activities.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtros de Pestaña */}
              <div className="p-3 bg-slate-50 border-b border-black/5 flex items-center gap-2">
                <button
                  onClick={() => setFiltroTareas('pendientes')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    filtroTareas === 'pendientes'
                      ? 'bg-[#29008e] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Pendientes ({activities.filter((a) => !a.completed).length})
                </button>
                <button
                  onClick={() => setFiltroTareas('todas')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    filtroTareas === 'todas'
                      ? 'bg-[#29008e] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Todas ({activities.length})
                </button>
                <button
                  onClick={() => setFiltroTareas('completadas')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                    filtroTareas === 'completadas'
                      ? 'bg-[#29008e] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  Realizadas ({activities.filter((a) => a.completed).length})
                </button>
              </div>

              {/* Listado de Actividades */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(() => {
                  const listaFiltrada = activities.filter((act) => {
                    if (filtroTareas === 'pendientes') return !act.completed;
                    if (filtroTareas === 'completadas') return act.completed;
                    return true;
                  });

                  if (listaFiltrada.length === 0) {
                    return (
                      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-700">Sin tareas en esta vista</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">
                          {filtroTareas === 'pendientes'
                            ? 'Excelente trabajo: todos los compromisos agendados están al día.'
                            : 'No se encontraron actividades registradas con el filtro seleccionado.'}
                        </p>
                      </div>
                    );
                  }

                  return listaFiltrada.map((act) => {
                    const escuelaAsociada = companies.find((c) => c.id === act.companyId);
                    
                    // Helpers de Icono y Color según tipo
                    let tipoBadge = {
                      label: 'Tarea',
                      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      icon: CheckSquare
                    };
                    if (act.type === 'meeting') {
                      tipoBadge = {
                        label: 'Reunión / Visita',
                        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                        icon: Users
                      };
                    } else if (act.type === 'call') {
                      tipoBadge = {
                        label: 'Llamada',
                        bg: 'bg-blue-50 text-blue-700 border-blue-200',
                        icon: Phone
                      };
                    } else if (act.type === 'email') {
                      tipoBadge = {
                        label: 'Correo',
                        bg: 'bg-purple-50 text-purple-700 border-purple-200',
                        icon: Mail
                      };
                    } else if (act.type === 'note') {
                      tipoBadge = {
                        label: 'Minuta / Nota',
                        bg: 'bg-slate-100 text-slate-700 border-slate-200',
                        icon: FileText
                      };
                    }

                    const TipoIcon = tipoBadge.icon;

                    return (
                      <div
                        key={act.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          act.completed
                            ? 'bg-slate-50/70 border-slate-200 opacity-75'
                            : 'bg-white border-slate-200 hover:border-[#29008e]/40 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Botón de toggle completado */}
                          <button
                            onClick={() => handleToggleActivity(act.id)}
                            title={act.completed ? 'Marcar como pendiente' : 'Marcar como realizada'}
                            className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              act.completed
                                ? 'bg-emerald-500 text-white'
                                : 'border-2 border-slate-300 hover:border-[#29008e] text-transparent hover:text-slate-300'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${tipoBadge.bg}`}>
                                <TipoIcon className="w-3 h-3" />
                                {tipoBadge.label}
                              </span>

                              {act.date && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {act.date}
                                </span>
                              )}
                            </div>

                            <h5
                              className={`text-xs font-bold leading-snug ${
                                act.completed ? 'line-through text-slate-400' : 'text-[#111111]'
                              }`}
                            >
                              {act.title}
                            </h5>

                            {act.description && (
                              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                {act.description}
                              </p>
                            )}

                            {/* Institución Asociada y Enlace a Expediente 360° */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0f094f] truncate">
                                <Building2 className="w-3.5 h-3.5 text-[#29008e] shrink-0" />
                                <span className="truncate">{escuelaAsociada?.name || 'Institución no asignada'}</span>
                              </div>

                              {act.companyId && (
                                <button
                                  onClick={() => {
                                    handleOpenSchoolInCRM(act.companyId);
                                    setPanelTareasAbierto(false);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-[#29008e] hover:text-[#640354] shrink-0 cursor-pointer"
                                  title="Abrir expediente completo de la universidad"
                                >
                                  <span>Ver 360°</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>

                            {/* Asesor Responsable */}
                            {act.author && (
                              <div className="mt-1 text-[10px] text-slate-400 flex items-center gap-1">
                                <User className="w-2.5 h-2.5" />
                                <span>Responsable: {act.author}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Pie de Panel con Acceso Directo al Directorio */}
              <div className="p-3 bg-slate-50 border-t border-black/10 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">
                  {activities.filter((a) => !a.completed).length} pendientes restantes
                </span>
                <button
                  onClick={() => {
                    setCurrentView('crm-schools');
                    setPanelTareasAbierto(false);
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#0f094f] text-white hover:bg-[#29008e] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Ir al Directorio 360°</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TOAST DE NOTIFICACIÓN FLOTANTE (ESTADOS DE BD / ACCIONES)      */}
      {/* ============================================================== */}
      {notificacionToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl border flex items-start gap-3.5 animate-slideUp bg-[#07052e] text-white border-white/15 shadow-[0_20px_50px_rgba(7,5,46,0.6)] backdrop-blur-xl">
          {notificacionToast.tipo === 'exito' && (
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          {notificacionToast.tipo === 'info' && (
            <div className="w-8 h-8 rounded-xl bg-[#29008e]/40 text-[#a78bfa] flex items-center justify-center shrink-0 border border-[#a78bfa]/30">
              <Database className="w-4 h-4" />
            </div>
          )}
          {notificacionToast.tipo === 'error' && (
            <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white leading-tight">
              {notificacionToast.titulo}
            </h4>
            <p className="text-[11px] text-white/70 mt-0.5 leading-snug">
              {notificacionToast.mensaje}
            </p>
          </div>

          <button
            onClick={() => setNotificacionToast(null)}
            className="text-white/40 hover:text-white p-1 -mr-1 -mt-1 rounded-lg transition-colors"
            title="Cerrar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
