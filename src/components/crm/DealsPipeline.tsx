import React, { useState } from 'react';
import { Deal, Company, PipelineStage, ProjectModality, EventType, Activity } from '../../types';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Filter, 
  Search,
  Sparkles,
  Award,
  Layers,
  Flag,
  Users,
  X,
  QrCode,
  AlertTriangle
} from 'lucide-react';
import { actualizarEtapaOportunidad } from '../../services/servicioCrm';

interface DealsPipelineProps {
  deals: Deal[];
  companies: Company[];
  onUpdateDealStage: (dealId: string, newStage: PipelineStage) => void;
  onAddDeal: (newDeal: Omit<Deal, 'id' | 'createdAt'>) => void;
  onSelectSchoolForCRM?: (schoolId: string) => void;
  onOpenEventKit?: (dealId: string) => void;
  onAddActivity?: (activity: Omit<Activity, 'id'>) => void;
  onAbrirRegistroQr?: (dealId: string) => void;
}

// 6 etapas con colores armónicos alineados a la identidad visual Develop
const STAGES_CONFIG: { stage: PipelineStage; label: string; color: string; bg: string; border: string; badge: string }[] = [
  { stage: 'prospecto', label: '1. Prospecto', color: 'text-[#555555]', bg: 'bg-[#F8F8FC]', border: 'border-black/5', badge: 'bg-black/5 text-[#555555]' },
  { stage: 'contacto', label: '2. Contacto', color: 'text-[#0f094f]', bg: 'bg-[#0f094f]/[0.02]', border: 'border-[#0f094f]/10', badge: 'bg-[#0f094f]/10 text-[#0f094f]' },
  { stage: 'propuesta', label: '3. Propuesta', color: 'text-[#640354]', bg: 'bg-[#640354]/[0.02]', border: 'border-[#640354]/10', badge: 'bg-[#640354]/10 text-[#640354]' },
  { stage: 'agendado', label: '4. Agendado 📅', color: 'text-[#29008e]', bg: 'bg-[#29008e]/[0.02]', border: 'border-[#29008e]/10', badge: 'bg-[#29008e]/10 text-[#29008e]' },
  { stage: 'realizado', label: '5. Realizado 🚀', color: 'text-[#6d28d9]', bg: 'bg-[#a78bfa]/[0.05]', border: 'border-[#a78bfa]/20', badge: 'bg-[#a78bfa]/15 text-[#29008e]' },
  { stage: 'resultado', label: '6. Resultado / Éxito 🏆', color: 'text-emerald-700', bg: 'bg-emerald-50/50', border: 'border-emerald-200/60', badge: 'bg-emerald-100 text-emerald-800' },
];

export const DealsPipeline: React.FC<DealsPipelineProps> = ({
  deals,
  companies,
  onUpdateDealStage,
  onAddDeal,
  onSelectSchoolForCRM,
  onOpenEventKit,
  onAddActivity,
  onAbrirRegistroQr
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRep, setSelectedRep] = useState('todos');
  const [selectedModalityFilter, setSelectedModalityFilter] = useState<'todos' | ProjectModality>('todos');
  const [selectedEventTypeFilter, setSelectedEventTypeFilter] = useState<'todos' | EventType>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para validaciones y notificaciones de avance
  const [mensajeValidacion, setMensajeValidacion] = useState<string | null>(null);
  const [alertaExito, setAlertaExito] = useState<{ titulo: string; mensaje: string } | null>(null);

  // Formulario nuevo trato / oportunidad
  const [newTitle, setNewTitle] = useState('');
  const [newCompanyId, setNewCompanyId] = useState(companies[0]?.id || '');
  const [newAmount, setNewAmount] = useState('140000');
  const [newStage, setNewStage] = useState<PipelineStage>('prospecto');
  const [newRep, setNewRep] = useState('Carlos Mendoza');
  const [newModality, setNewModality] = useState<ProjectModality>('modalidad_a_programa');
  const [newEventType, setNewEventType] = useState<EventType>('hackathon');
  const [newAlliedBrands, setNewAlliedBrands] = useState('AWS, Microsoft');
  const [newNotes, setNewNotes] = useState('');

  const companyMap = new Map<string, Company>(companies.map((c) => [c.id, c]));

  // Filtrado de tratos
  const filteredDeals = deals.filter((deal) => {
    const comp = companyMap.get(deal.companyId);
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp && comp.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      deal.alliedBrands.some((b) => b.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRep = selectedRep === 'todos' || deal.assignedRep === selectedRep;
    const matchesModality = selectedModalityFilter === 'todos' || deal.projectModality === selectedModalityFilter;
    const matchesEventType = selectedEventTypeFilter === 'todos' || deal.eventType === selectedEventTypeFilter;

    return matchesSearch && matchesRep && matchesModality && matchesEventType;
  });

  // Métricas globales del Pipeline
  const totalPipelineValue = deals.reduce((acc, d) => acc + d.amount, 0);
  const weightedForecast = deals.reduce((acc, d) => acc + (d.amount * d.probability) / 100, 0);
  const completedTotal = deals
    .filter((d) => d.stage === 'realizado' || d.stage === 'resultado')
    .reduce((acc, d) => acc + d.amount, 0);
  const totalAlumnosCaptados = deals.reduce((sum, d) => sum + (d.registeredLeadsCount || 0), 0);

  const handleStageChange = async (dealId: string, currentStage: PipelineStage, targetStage: PipelineStage) => {
    const dealObjetivo = deals.find((d) => d.id === dealId);
    if (!dealObjetivo) return;

    setMensajeValidacion(null);

    // Regla 1: Para mover a 'agendado': validar fecha asignada y modalidad definida (A o B)
    if (targetStage === 'agendado') {
      const tieneFecha = Boolean(dealObjetivo.expectedCloseDate && dealObjetivo.expectedCloseDate.trim() !== '');
      const tieneModalidad =
        dealObjetivo.projectModality === 'modalidad_a_programa' ||
        dealObjetivo.projectModality === 'modalidad_b_escuela';

      if (!tieneFecha || !tieneModalidad) {
        setMensajeValidacion(
          `Requisito de Salida: Para agendar "${dealObjetivo.title}" es obligatorio contar con una fecha tentativa asignada y tener definida la modalidad del proyecto (Modalidad A o Modalidad B).`
        );
        return;
      }
    }

    // Regla 2: Para mover a 'resultado': verificar número de alumnos registrados y celebrar
    if (targetStage === 'resultado') {
      const alumnos = dealObjetivo.registeredLeadsCount || 0;

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#0f094f', '#640354', '#29008e', '#a78bfa', '#f472b6']
      });

      setAlertaExito({
        titulo: `¡Convenio Concretado con Éxito!`,
        mensaje: `"${dealObjetivo.title}" cerró favorablemente con ${alumnos} alumno(s) captados vía QR y una derrama de $${dealObjetivo.amount.toLocaleString('es-MX')} MXN.`
      });

      setTimeout(() => {
        setAlertaExito(null);
      }, 7000);
    }

    // Persistencia asíncrona en Supabase / Servicio CRM
    actualizarEtapaOportunidad(dealId, targetStage as any).catch((err) =>
      console.warn('Error actualizando etapa en el servicio central:', err)
    );

    // Regla 3: Registrar automáticamente actividad en la bitácora del CRM con el cambio de etapa
    if (onAddActivity) {
      const descripcion =
        targetStage === 'agendado'
          ? `Iniciativa AGENDADA para ${dealObjetivo.expectedCloseDate} en ${
              dealObjetivo.projectModality === 'modalidad_a_programa'
                ? 'Modalidad A (Programa)'
                : 'Modalidad B (Alojado Escuela)'
            }.`
          : targetStage === 'resultado'
          ? `RESULTADO Y ÉXITO FINAL: Alumnos registrados: ${dealObjetivo.registeredLeadsCount || 0}. Monto acordado: $${dealObjetivo.amount.toLocaleString('es-MX')} MXN.`
          : `La oportunidad cambió de etapa: "${currentStage.toUpperCase()}" ➔ "${targetStage.toUpperCase()}". Responsable: ${dealObjetivo.assignedRep}.`;

      onAddActivity({
        companyId: dealObjetivo.companyId,
        dealId: dealObjetivo.id,
        type: 'task',
        title: `Etapa Actualizada: ${targetStage.toUpperCase()}`,
        description: descripcion,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        completed: true,
        author: dealObjetivo.assignedRep
      });
    }

    onUpdateDealStage(dealId, targetStage);
  };

  const handleCreateDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let probability = 20;
    if (newStage === 'contacto') probability = 40;
    if (newStage === 'propuesta') probability = 60;
    if (newStage === 'agendado') probability = 80;
    if (newStage === 'realizado') probability = 95;
    if (newStage === 'resultado') probability = 100;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const brandsArray = newAlliedBrands
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    onAddDeal({
      title: newTitle,
      companyId: newCompanyId,
      amount: parseFloat(newAmount) || 50000,
      stage: newStage,
      probability,
      expectedCloseDate: futureDate.toISOString().split('T')[0],
      assignedRep: newRep,
      servicePackage: `${newEventType.replace('_', ' ')} (${newModality === 'modalidad_a_programa' ? 'Modalidad A' : 'Modalidad B'})`,
      notes: newNotes,
      projectModality: newModality,
      eventType: newEventType,
      alliedBrands: brandsArray.length > 0 ? brandsArray : ['Develop'],
      registeredLeadsCount: 0
    });

    setNewTitle('');
    setNewNotes('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-7">
      {/* HEADER DE MÓDULO CON IDENTIDAD EDITORIAL DEVELOP */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-black/5">
        <div>
          <div className="text-[11px] font-bold text-[#29008e] uppercase tracking-[0.22em] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]"></span>
            Pipeline Comercial & Alianzas Universitarias
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#111111] tracking-tight mt-1">
            Gestión de Oportunidades & Eventos
          </h1>
          <p className="text-sm text-[#555555] mt-1 max-w-2xl">
            Seguimiento riguroso de acuerdos de estadías, hackathons y alianzas tecnológicas institucionales.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary-develop inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-[#a78bfa]" />
          <span>Nueva Oportunidad</span>
        </button>
      </div>

      {/* BANNER DE ERROR DE VALIDACIÓN DE SALIDA (REQUISITOS AGENDADO/RESULTADO) */}
      {mensajeValidacion && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-start justify-between gap-3 shadow-xs animate-shake">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-950 block mb-0.5">Validación de Transición de Etapa</strong>
              <span>{mensajeValidacion}</span>
            </div>
          </div>
          <button
            onClick={() => setMensajeValidacion(null)}
            className="text-amber-500 hover:text-amber-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BANNER DE ÉXITO DE RESULTADO/CONVENIO CERRADO */}
      {alertaExito && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-start justify-between gap-3 shadow-xs animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-emerald-950 block mb-0.5">{alertaExito.titulo}</strong>
              <span>{alertaExito.mensaje}</span>
            </div>
          </div>
          <button
            onClick={() => setAlertaExito(null)}
            className="text-emerald-500 hover:text-emerald-800 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* METRICAS DEL DASHBOARD (GUÍA DEVELOP: CARDS CLARAS + 1 CARD DARK PREMIUM DESTACADA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Clara 1: Cartera de Oportunidades */}
        <div className="card-light card-light-hover p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-[#888888] tracking-wider">
              Cartera Activa
            </div>
            <div className="text-2xl font-black text-[#111111] mt-1">
              ${totalPipelineValue.toLocaleString('es-MX')} <span className="text-xs font-medium text-[#888888]">MXN</span>
            </div>
            <div className="text-xs text-[#555555] mt-1 flex items-center gap-1">
              <span className="font-semibold text-[#0f094f]">{deals.length}</span> convenios e iniciativas
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl icon-box-light flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5 text-[#0f094f]" />
          </div>
        </div>

        {/* Card Dark Premium Destacada: Pronóstico Ponderado (Impacto visual Develop) */}
        <div className="premium-dark-surface rounded-[24px] p-5 shadow-develop-dark-card border border-white/10 flex items-center justify-between text-white relative group overflow-hidden">
          <div className="relative z-10">
            <div className="text-[11px] font-bold uppercase text-white/70 tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f472b6]"></span>
              Pronóstico Ponderado
            </div>
            <div className="text-2xl font-black gradient-text mt-1">
              ${Math.round(weightedForecast).toLocaleString('es-MX')} <span className="text-xs text-white/60 font-medium">MXN</span>
            </div>
            <div className="text-xs text-white/80 font-medium mt-1">
              Probabilidad por avance de etapa
            </div>
          </div>
          <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-white shadow-develop-glow/30">
            <Sparkles className="w-5 h-5 text-[#a78bfa]" />
          </div>
        </div>

        {/* Card Clara 3: Eventos Realizados */}
        <div className="card-light card-light-hover p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-[#888888] tracking-wider">
              Ejecutados & Éxito
            </div>
            <div className="text-2xl font-black text-[#29008e] mt-1">
              ${completedTotal.toLocaleString('es-MX')} <span className="text-xs font-medium text-[#888888]">MXN</span>
            </div>
            <div className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {deals.filter((d) => d.stage === 'realizado' || d.stage === 'resultado').length} eventos concluidos
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl icon-box-light flex items-center justify-center font-bold">
            <Award className="w-5 h-5 text-[#29008e]" />
          </div>
        </div>

        {/* Card Clara 4: Alumnos / Talento Captado */}
        <div className="card-light card-light-hover p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase text-[#888888] tracking-wider">
              Talento Captado
            </div>
            <div className="text-2xl font-black text-[#640354] mt-1">
              {totalAlumnosCaptados.toLocaleString('es-MX')} <span className="text-xs font-medium text-[#888888]">estudiantes</span>
            </div>
            <div className="text-xs text-[#555555] mt-1">
              Estadías, residencias y dual
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl icon-box-light flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-[#640354]" />
          </div>
        </div>
      </div>

      {/* CONTROLES DE FILTROS AVANZADOS DEVELOP */}
      <div className="card-light p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por universidad, evento o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-develop w-full pl-10 pr-4 text-xs"
            />
          </div>

          {/* Filtro Modalidad A vs B */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[#555555]">Modalidad:</span>
            <select
              value={selectedModalityFilter}
              onChange={(e) => setSelectedModalityFilter(e.target.value as any)}
              className="input-develop text-xs py-2 px-3 font-medium text-[#111111]"
            >
              <option value="todos">Todas las Modalidades</option>
              <option value="modalidad_a_programa">Modalidad A (Programa)</option>
              <option value="modalidad_b_escuela">Modalidad B (Alojado Escuela)</option>
            </select>
          </div>

          {/* Filtro Tipo de Evento */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold text-[#555555]">Evento:</span>
            <select
              value={selectedEventTypeFilter}
              onChange={(e) => setSelectedEventTypeFilter(e.target.value as any)}
              className="input-develop text-xs py-2 px-3 font-medium text-[#111111]"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="hackathon">Hackathon</option>
              <option value="feria_trabajo">Feria de Trabajo</option>
              <option value="conferencia_taller">Conferencia / Taller</option>
              <option value="recorrido_comercial">Recorrido Comercial</option>
              <option value="proyecto">Proyecto</option>
            </select>
          </div>

          {/* Filtro Asesor */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#888888]" />
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="input-develop text-xs py-2 px-3 font-medium text-[#111111]"
            >
              <option value="todos">Todos los Asesores</option>
              <option value="Carlos Mendoza">Carlos Mendoza</option>
              <option value="Sofía Valenzuela">Sofía Valenzuela</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#888888] font-medium hidden xl:block">
          Mostrando <strong className="text-[#111111]">{filteredDeals.length}</strong> de {deals.length} acuerdos
        </div>
      </div>

      {/* TABLERO KANBAN DE VENTAS (6 COLUMNAS CON ESTILO ENTERPRISE DEVELOP) */}
      <div className="overflow-x-auto pb-3 -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex xl:grid xl:grid-cols-6 gap-4 items-start min-w-max xl:min-w-0">
        {STAGES_CONFIG.map(({ stage, label, color, bg, border, badge }) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage);
          const stageTotal = stageDeals.reduce((acc, d) => acc + d.amount, 0);

          return (
            <div
              key={stage}
              className={`w-[260px] sm:w-[280px] xl:w-auto shrink-0 xl:shrink rounded-[22px] border ${border} ${bg} p-3.5 flex flex-col min-h-[520px] transition-all duration-200`}
            >
              {/* Encabezado de Columna */}
              <div className="pb-3 border-b border-black/5 mb-3">
                <div className={`text-xs font-bold ${color} truncate tracking-tight`}>{label}</div>
                <div className="flex items-center justify-between text-[11px] text-[#555555] mt-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge}`}>
                    {stageDeals.length}
                  </span>
                  <span className="font-bold text-[#111111]">
                    ${stageTotal.toLocaleString('es-MX')}
                  </span>
                </div>
              </div>

              {/* Lista de Tarjetas de Tratos */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[640px] pr-0.5">
                {stageDeals.map((deal) => {
                  const company = companyMap.get(deal.companyId);
                  const currentIdx = STAGES_CONFIG.findIndex((s) => s.stage === deal.stage);

                  return (
                    <div
                      key={deal.id}
                      className="card-light card-light-hover p-4 space-y-2.5 text-left group rounded-[18px]"
                    >
                      {/* Universidad y Lead Score */}
                      <div className="flex items-start justify-between gap-1">
                        <span
                          onClick={() => onSelectSchoolForCRM && onSelectSchoolForCRM(deal.companyId)}
                          className="text-[11px] font-bold text-[#0f094f] hover:text-[#29008e] hover:underline cursor-pointer line-clamp-1"
                          title={company?.name}
                        >
                          {company?.name || 'Universidad'}
                        </span>
                        {company && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[#640354]/10 text-[#640354] font-bold rounded-md shrink-0">
                            ★ {company.leadScore}
                          </span>
                        )}
                      </div>

                      {/* Título de la Oportunidad */}
                      <h4 className="font-bold text-xs text-[#111111] leading-snug">
                        {deal.title}
                      </h4>

                      {/* Badges de Modalidad A/B y Tipo de Evento */}
                      <div className="flex flex-wrap gap-1">
                        <span className={`text-[9px] px-2 py-0.5 font-bold rounded-md flex items-center gap-1 ${
                          deal.projectModality === 'modalidad_a_programa'
                            ? 'bg-[#0f094f]/10 text-[#0f094f] border border-[#0f094f]/15'
                            : 'bg-[#29008e]/10 text-[#29008e] border border-[#29008e]/15'
                        }`}>
                          <Layers className="w-2.5 h-2.5" />
                          {deal.projectModality === 'modalidad_a_programa' ? 'Mod. A: Programa' : 'Mod. B: Alojado'}
                        </span>

                        <span className="text-[9px] px-2 py-0.5 bg-black/5 text-[#555555] font-semibold rounded-md">
                          {deal.eventType.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Marcas Aliadas Patrocinadoras */}
                      {deal.alliedBrands && deal.alliedBrands.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#555555] pt-0.5">
                          <Flag className="w-3 h-3 text-[#29008e] shrink-0" />
                          <span className="font-medium truncate">
                            Sponsors: {deal.alliedBrands.join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Monto y Probabilidad */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-sm font-extrabold text-[#111111]">
                          ${deal.amount.toLocaleString('es-MX')}
                        </div>
                        <div className="text-[10px] font-bold text-[#555555] bg-black/5 px-2 py-0.5 rounded-full">
                          {deal.probability}% prob.
                        </div>
                      </div>

                      {/* Alumnos Captados si el evento ya se realizó */}
                      {deal.registeredLeadsCount !== undefined && deal.registeredLeadsCount > 0 && (
                        <div className="text-[10px] bg-emerald-50 text-emerald-800 p-1.5 rounded-lg font-bold flex items-center justify-between border border-emerald-200/50">
                          <span>Talento Registrado:</span>
                          <span className="font-black">{deal.registeredLeadsCount} alumnos</span>
                        </div>
                      )}

                      {/* Asesor y Fecha */}
                      <div className="flex items-center justify-between text-[10px] text-[#888888] pt-2 border-t border-black/5">
                        <span className="flex items-center gap-1 text-[#555555]">
                          <User className="w-3 h-3 text-[#888888]" />
                          {deal.assignedRep.split(' ')[0]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {deal.expectedCloseDate}
                        </span>
                      </div>

                      {/* Botones de Avance de Etapa */}
                      <div className="pt-2 flex items-center justify-between gap-1 border-t border-black/5">
                        {currentIdx > 0 ? (
                          <button
                            onClick={() =>
                              handleStageChange(deal.id, deal.stage, STAGES_CONFIG[currentIdx - 1].stage)
                            }
                            title="Regresar etapa anterior"
                            className="p-1.5 hover:bg-black/5 rounded-lg text-[#888888] hover:text-[#111111] transition-colors"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div />
                        )}

                        <div className="flex items-center gap-1">
                          {deal.stage !== 'resultado' && (
                            <button
                              onClick={() => handleStageChange(deal.id, deal.stage, 'resultado')}
                              title="Marcar como Éxito / Ganado"
                              className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Éxito
                            </button>
                          )}

                          {currentIdx < STAGES_CONFIG.length - 1 && (
                            <button
                              onClick={() =>
                                handleStageChange(deal.id, deal.stage, STAGES_CONFIG[currentIdx + 1].stage)
                              }
                              title="Avanzar siguiente etapa"
                              className="p-1.5 bg-[#0f094f] hover:bg-[#29008e] text-white rounded-lg transition-all shadow-xs"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Enlace al Kit de Evento Develop */}
                      {onOpenEventKit && (
                        <button
                          onClick={() => onOpenEventKit(deal.id)}
                          className="w-full mt-1.5 py-1.5 px-2 bg-[#0f094f]/5 hover:bg-[#0f094f]/10 text-[#0f094f] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border border-[#0f094f]/10 group-hover:border-[#0f094f]/20"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#29008e]" />
                          <span className="truncate">Ver Kit & Materiales ({deal.eventType.replace('_', ' ')})</span>
                        </button>
                      )}

                      {/* Botón directo de Captura QR en Stand */}
                      {onAbrirRegistroQr && (
                        <button
                          type="button"
                          onClick={() => onAbrirRegistroQr(deal.id)}
                          className="w-full mt-1.5 py-1.5 px-2 bg-[#640354]/10 hover:bg-[#640354]/15 text-[#640354] rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all border border-[#640354]/20 group-hover:border-[#640354]/30"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#640354]" />
                          <span>Captura QR Alumnos ({deal.registeredLeadsCount || 0})</span>
                        </button>
                      )}
                    </div>
                  );
                })}

                {stageDeals.length === 0 && (
                  <div className="h-32 flex items-center justify-center border-2 border-dashed border-black/5 rounded-[18px] text-[#888888] text-xs font-medium text-center p-3">
                    Sin iniciativas en esta fase
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* MODAL PARA CREAR NUEVA OPORTUNIDAD (DISEÑO DEVELOP ENTERPRISE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#07052e]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-[28px] shadow-develop-modal border border-black/10 overflow-hidden flex flex-col animate-fadeIn">
            {/* Header Dark Premium del Modal */}
            <div className="p-4 sm:p-6 premium-dark-surface text-white flex items-center justify-between border-b border-white/10 relative shrink-0">
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] block">
                  CRM · Vinculación Institucional
                </span>
                <h3 className="font-bold text-lg text-white mt-0.5">Registrar Oportunidad / Convenio</h3>
                <p className="text-xs text-white/70">Recorridos, conferencias, ferias y hackathons Develop</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDealSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="font-bold text-[#111111]">Título de la Iniciativa / Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Hackathon IA con AWS - ITTLA Tlalnepantla"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input-develop w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Universidad / Sede</label>
                  <select
                    value={newCompanyId}
                    onChange={(e) => setNewCompanyId(e.target.value)}
                    className="input-develop w-full"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Presupuesto / Valor ($ MXN)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="5000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="input-develop w-full"
                  />
                </div>
              </div>

              {/* Selector de Modalidad A vs B */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Modalidad de Proyecto</label>
                  <select
                    value={newModality}
                    onChange={(e) => setNewModality(e.target.value as ProjectModality)}
                    className="input-develop w-full font-semibold text-[#0f094f]"
                  >
                    <option value="modalidad_a_programa">Modalidad A (Programa Develop)</option>
                    <option value="modalidad_b_escuela">Modalidad B (Alojado Escuela)</option>
                  </select>
                  <span className="text-[10px] text-[#888888] block leading-tight">
                    {newModality === 'modalidad_a_programa' 
                      ? 'Estudiante entra a Develop Talent Program' 
                      : 'Universidad hospeda el proyecto de vinculación'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Tipo de Evento</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as EventType)}
                    className="input-develop w-full"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="feria_trabajo">Feria de Trabajo</option>
                    <option value="conferencia_taller">Conferencia / Taller</option>
                    <option value="recorrido_comercial">Recorrido Comercial</option>
                    <option value="proyecto">Proyecto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Etapa Inicial</label>
                  <select
                    value={newStage}
                    onChange={(e) => setNewStage(e.target.value as PipelineStage)}
                    className="input-develop w-full"
                  >
                    {STAGES_CONFIG.map((s) => (
                      <option key={s.stage} value={s.stage}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Consultor Asignado</label>
                  <select
                    value={newRep}
                    onChange={(e) => setNewRep(e.target.value)}
                    className="input-develop w-full"
                  >
                    <option value="Carlos Mendoza">Carlos Mendoza</option>
                    <option value="Sofía Valenzuela">Sofía Valenzuela</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111111]">Marcas Aliadas / Sponsors Tecnológicos</label>
                <input
                  type="text"
                  placeholder="Ej: AWS, Microsoft, Cisco, Google Cloud"
                  value={newAlliedBrands}
                  onChange={(e) => setNewAlliedBrands(e.target.value)}
                  className="input-develop w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111111]">Notas de Vinculación</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre directores de carrera, acuerdos preliminares..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="input-develop w-full"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary-light px-4 py-2 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-develop px-5 py-2 text-xs font-bold"
                >
                  Registrar en Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
