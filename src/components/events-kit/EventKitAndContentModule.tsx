import React, { useState, useEffect } from 'react';
import { Deal, Company } from '../../types';
import {
  Package,
  Sparkles,
  Printer,
  CheckCircle2,
  QrCode,
  Layout,
  Users,
  FileText,
  Flag,
  Share2,
  Presentation,
  MessageSquareText,
  Flame,
  BookOpen,
  Trophy,
  UserCheck
} from 'lucide-react';

interface EventKitAndContentModuleProps {
  deals: Deal[];
  companies: Company[];
  selectedDealId?: string | null;
  onUpdateDealLeads?: (dealId: string, count: number) => void;
  onSelectSchoolForCRM?: (schoolId: string) => void;
}

export const EventKitAndContentModule: React.FC<EventKitAndContentModuleProps> = ({
  deals,
  companies,
  selectedDealId,
  onUpdateDealLeads,
  onSelectSchoolForCRM
}) => {
  const [activeDealId, setActiveDealId] = useState<string>(selectedDealId || deals[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<string>('principal');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Estado para prueba interactiva del Formulario QR de Alumnos
  const [testStudentName, setTestStudentName] = useState('');
  const [testStudentEmail, setTestStudentEmail] = useState('');
  const [testStudentCareer, setTestStudentCareer] = useState('Ingeniería en Sistemas Computacionales');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Sincronizar prop externa
  useEffect(() => {
    if (selectedDealId) {
      setActiveDealId(selectedDealId);
    }
  }, [selectedDealId]);

  const activeDeal = deals.find((d) => d.id === activeDealId) || deals[0];
  const company = companies.find((c) => c.id === activeDeal?.companyId);

  // Resetear subpestaña al cambiar de deal/tipo de evento
  useEffect(() => {
    setActiveSubTab('principal');
  }, [activeDeal?.eventType]);

  // Motor de Contenidos con IA (Generador de Piezas Develop)
  const handleGenerateAIContent = () => {
    setIsGeneratingAI(true);
    setAiSuccessMessage(null);
    setTimeout(() => {
      setIsGeneratingAI(false);
      setAiSuccessMessage(
        `¡Materiales generados con éxito por IA para ${company?.name}! Se compilaron guiones, retos técnicos y piezas gráficas adaptadas a la identidad de Develop.`
      );
      setTimeout(() => setAiSuccessMessage(null), 5000);
    }, 700);
  };

  // Simulación de captura de lead por QR en evento
  const handleTestStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testStudentName.trim() || !activeDeal) return;

    const currentCount = activeDeal.registeredLeadsCount || 0;
    if (onUpdateDealLeads) {
      onUpdateDealLeads(activeDeal.id, currentCount + 1);
    }
    setRegistrationSuccess(true);
    setTimeout(() => {
      setRegistrationSuccess(false);
      setTestStudentName('');
      setTestStudentEmail('');
    }, 3500);
  };

  if (!activeDeal || !company) {
    return (
      <div className="p-8 card-light rounded-[24px] text-center text-[#555555]">
        No hay iniciativas o eventos registrados en el pipeline.
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* HEADER HERO ESTÁTICO DEVELOP */}
      <div className="internal-hero-surface rounded-[28px] p-7 lg:p-8 shadow-develop-modal border border-white/10 text-white relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 pill-dark text-xs font-bold uppercase tracking-widest text-[#a78bfa]">
              <Package className="w-3.5 h-3.5" />
              Develop Talent Suite · Motor de Contenidos IA & Kits
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Kit Comercial Digital & <span className="gradient-text">Generador de Piezas IA</span>
            </h1>
            <p className="text-white/70 text-xs lg:text-sm leading-relaxed">
              El motor inteligente estructura automáticamente el paquete de piezas (stands, folletos, guiones, retos técnicos o presentaciones magistrales) según el <strong>tipo de evento</strong> y los acuerdos registrados en el CRM.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateAIContent}
              disabled={isGeneratingAI}
              className="btn-primary-dark inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition-all shadow-develop-glow"
            >
              <Sparkles className={`w-4 h-4 text-[#29008e] ${isGeneratingAI ? 'animate-spin' : ''}`} />
              {isGeneratingAI ? 'Generando con IA...' : 'Regenerar Piezas con IA'}
            </button>
            <button
              onClick={() => window.print()}
              className="btn-outline-dark inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              Exportar / PDF
            </button>
          </div>
        </div>
      </div>

      {aiSuccessMessage && (
        <div className="bg-[#0f094f]/5 border border-[#0f094f]/15 text-[#0f094f] p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs animate-fadeIn">
          <Sparkles className="w-5 h-5 text-[#29008e] shrink-0" />
          <span>{aiSuccessMessage}</span>
        </div>
      )}

      {/* BARRA DE SELECCIÓN DE EVENTO / UNIVERSIDAD */}
      <div className="card-light p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <span className="text-[11px] font-bold uppercase text-[#888888] tracking-wider shrink-0">
            Evento Seleccionado:
          </span>
          <select
            value={activeDealId}
            onChange={(e) => setActiveDealId(e.target.value)}
            className="input-develop w-full max-w-xl text-xs font-bold text-[#111111]"
          >
            {deals.map((d) => {
              const comp = companies.find((c) => c.id === d.companyId);
              return (
                <option key={d.id} value={d.id}>
                  {d.title} • {comp?.name} ({d.eventType.replace('_', ' ')})
                </option>
              );
            })}
          </select>
        </div>

        {/* Ficha Rápida del Evento */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="chip-skill text-[10px] px-2.5 py-1">
            {activeDeal.projectModality === 'modalidad_a_programa' ? 'Mod. A: Programa Develop' : 'Mod. B: Alojado Escuela'}
          </span>

          <span className="px-2.5 py-1 bg-[#640354]/10 text-[#640354] font-bold rounded-lg border border-[#640354]/20 text-[10px]">
            Tipo: {activeDeal.eventType.replace('_', ' ')}
          </span>

          {activeDeal.alliedBrands && activeDeal.alliedBrands.length > 0 && (
            <span className="px-2.5 py-1 bg-[#29008e]/5 text-[#29008e] font-bold rounded-lg border border-[#29008e]/15 flex items-center gap-1 text-[10px]">
              <Flag className="w-3 h-3 text-[#29008e]" />
              {activeDeal.alliedBrands.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* PESTAÑAS DINÁMICAS DEL KIT SEGÚN EL TIPO DE EVENTO */}
      <div className="card-light rounded-[28px] overflow-hidden">
        {/* Barra de Subpestañas */}
        <div className="flex border-b border-black/5 bg-[#F8F8FC] px-5 pt-3 gap-2 overflow-x-auto">
          {/* CASO 1: FERIA DE TRABAJO */}
          {activeDeal.eventType === 'feria_trabajo' && (
            <>
              <button
                onClick={() => setActiveSubTab('principal')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'principal'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <Layout className="w-4 h-4 text-[#0f094f]" />
                1. Stand & Banners
              </button>

              <button
                onClick={() => setActiveSubTab('folleto')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'folleto'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <FileText className="w-4 h-4 text-[#29008e]" />
                2. Folletos de Estadías (500 pzas)
              </button>

              <button
                onClick={() => setActiveSubTab('qr_registro')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'qr_registro'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-700" />
                3. Formulario QR Captura Alumnos
              </button>

              <button
                onClick={() => setActiveSubTab('areas')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'areas'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <Users className="w-4 h-4 text-[#640354]" />
                4. Áreas y Perfiles Solicitados
              </button>
            </>
          )}

          {/* CASO 2: HACKATHON TECNOLÓGICO */}
          {activeDeal.eventType === 'hackathon' && (
            <>
              <button
                onClick={() => setActiveSubTab('principal')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'principal'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <Flame className="w-4 h-4 text-[#29008e]" />
                1. Retos Técnicos & Sponsors
              </button>

              <button
                onClick={() => setActiveSubTab('premios')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'premios'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                2. Bolsa de Premios & Trofeos
              </button>

              <button
                onClick={() => setActiveSubTab('mentores')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'mentores'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <UserCheck className="w-4 h-4 text-[#0f094f]" />
                3. Mentores Senior & Agenda
              </button>

              <button
                onClick={() => setActiveSubTab('kit_bienvenida')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'kit_bienvenida'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <Package className="w-4 h-4 text-[#640354]" />
                4. Kit de Bienvenida (150 alumnos)
              </button>
            </>
          )}

          {/* CASO 3: CONFERENCIA / TALLER / RECORRIDO / PROYECTO */}
          {(activeDeal.eventType === 'conferencia_taller' || activeDeal.eventType === 'recorrido_comercial' || activeDeal.eventType === 'proyecto') && (
            <>
              <button
                onClick={() => setActiveSubTab('principal')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'principal'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <Presentation className="w-4 h-4 text-[#0f094f]" />
                1. Deck de Diapositivas
              </button>

              <button
                onClick={() => setActiveSubTab('guion')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'guion'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <MessageSquareText className="w-4 h-4 text-[#29008e]" />
                2. Guion del Ponente (IA)
              </button>

              <button
                onClick={() => setActiveSubTab('difusion')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'difusion'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <Share2 className="w-4 h-4 text-[#640354]" />
                3. Difusión en Redes
              </button>

              <button
                onClick={() => setActiveSubTab('seguimiento')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
                  activeSubTab === 'seguimiento'
                    ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                    : 'border-transparent text-[#555555] hover:text-[#111111]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-700" />
                4. Material de Seguimiento
              </button>
            </>
          )}
        </div>

        {/* CONTENIDO INTERACTIVO DE CADA PESTAÑA */}
        <div className="p-7 bg-white min-h-[500px]">
          {/* ============================================================== */}
          {/* VISTAS PARA: FERIA DE TRABAJO                                 */}
          {/* ============================================================== */}
          {activeDeal.eventType === 'feria_trabajo' && (
            <>
              {activeSubTab === 'principal' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/5">
                    <div>
                      <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                        <Layout className="w-5 h-5 text-[#0f094f]" />
                        Maqueta del Stand Físico & Roll-up Banners Develop
                      </h3>
                      <p className="text-xs text-[#555555]">
                        Estructura visual modular lista para el pasillo central de {company.name}.
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-[#0f094f]/10 text-[#0f094f] font-bold rounded-full border border-[#0f094f]/15">
                      Kit Presencial Develop
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Render visual del Stand con Premium Dark Surface */}
                    <div className="lg:col-span-8 premium-dark-surface p-7 rounded-[26px] text-white shadow-develop-modal relative overflow-hidden flex flex-col justify-between min-h-[360px] border border-white/10">
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 bg-white text-[#07052e] rounded-xl font-extrabold text-xs shadow-develop-glow">
                            DEVELOP STAND
                          </span>
                          <span className="text-xs text-white/80 font-semibold">{company.name}</span>
                        </div>
                        <div className="text-right text-xs">
                          <span className="text-white/60 block text-[10px] font-bold uppercase tracking-wider">Marcas Patrocinadoras</span>
                          <span className="font-bold text-[#a78bfa]">{activeDeal.alliedBrands.join(' • ')}</span>
                        </div>
                      </div>

                      <div className="text-center space-y-2 my-auto py-6 relative z-10">
                        <div className="text-xs font-mono tracking-widest uppercase font-bold text-[#a78bfa]">
                          Develop Talent Ecosystem
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
                          Estadías & Residencias Profesionales 2026
                        </h2>
                        <p className="text-xs text-white/70 max-w-lg mx-auto">
                          Desarrolla proyectos tecnológicos de impacto en entornos reales con mentoría técnica senior y certificación curricular garantizada.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/15 text-center text-[11px] relative z-10">
                        <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                          <div className="font-bold text-white">Modalidad Dual</div>
                          <div className="text-[10px] text-white/60">Acreditación Oficial</div>
                        </div>
                        <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                          <div className="font-bold text-[#f472b6]">Plazas Abiertas</div>
                          <div className="text-[10px] text-white/60">Cloud, Web & IA</div>
                        </div>
                        <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                          <div className="font-bold text-[#a78bfa]">Registro Digital</div>
                          <div className="text-[10px] text-white/60">Código QR en Stand</div>
                        </div>
                      </div>
                    </div>

                    {/* Especificaciones Técnicas del Stand */}
                    <div className="lg:col-span-4 space-y-4 text-xs">
                      <div className="card-light p-5 rounded-2xl space-y-3">
                        <h4 className="font-bold text-[#111111] text-sm">Componentes del Kit Físico</h4>
                        <ul className="space-y-2.5 text-[#555555]">
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0f094f]"></span>
                            1 Mostrador modular de atención (2.0 x 1.0 m)
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#29008e]"></span>
                            2 Roll-up Banners retráctiles (85 x 200 cm)
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#640354]"></span>
                            Totem rígido con código QR de registro
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#a78bfa]"></span>
                            Lote de 500 folletos trípticos institucionales
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-[#0f094f]/5 rounded-2xl border border-[#0f094f]/15 text-[#0f094f] text-[11px] leading-relaxed">
                        <strong>Logística:</strong> Montaje coordinado por el equipo de campo Develop 2 horas previas a la apertura oficial de la feria.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'folleto' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-black/5">
                    <div>
                      <h3 className="text-base font-bold text-[#111111]">
                        Folleto Tríptico de Estadías & Residencias (Listo para Imprenta)
                      </h3>
                      <p className="text-xs text-[#555555]">
                        Material editorial impreso que se entrega a alumnos y coordinadores de carrera.
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="btn-primary-develop px-4 py-2 text-xs font-bold"
                    >
                      Descargar PDF Vectorial
                    </button>
                  </div>

                  {/* Render del tríptico con identidad Develop */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                    {/* Panel 1: Portada Premium */}
                    <div className="premium-dark-surface text-white p-6 rounded-[22px] border border-white/10 flex flex-col justify-between min-h-[320px]">
                      <div className="relative z-10">
                        <span className="text-[10px] uppercase font-bold text-[#a78bfa] tracking-widest block">
                          Develop Talent Program
                        </span>
                        <h4 className="text-xl font-black mt-2 leading-tight text-white">
                          Convocatoria de Residencias & Modalidad Dual 2026
                        </h4>
                        <p className="text-[11px] text-white/70 mt-2 leading-relaxed">
                          Alianza estratégica para inserción profesional con respaldo de {activeDeal.alliedBrands.join(' y ')}.
                        </p>
                      </div>
                      <div className="relative z-10 text-[10px] text-white/60 pt-4 border-t border-white/10">
                        {company.name} • Dirección de Vinculación
                      </div>
                    </div>

                    {/* Panel 2: Requisitos y Beneficios */}
                    <div className="card-light p-6 rounded-[22px] flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-[#111111] text-sm mb-3">Requisitos de Acreditación</h4>
                        <ul className="space-y-2 text-[#555555] text-[11px]">
                          <li>• Estudiante regular de 7º semestre en adelante</li>
                          <li>• 70%+ de créditos concluidos</li>
                          <li>• Disponibilidad de 20 a 30 hrs semanales</li>
                          <li>• Aprobación de coordinación académica</li>
                        </ul>
                      </div>
                      <div className="bg-[#0f094f]/5 p-3 rounded-xl border border-[#0f094f]/15 text-[#0f094f] text-[10px] font-bold">
                        Acreditación curricular 100% oficial ante rectoría y comités de carrera.
                      </div>
                    </div>

                    {/* Panel 3: Registro y Contacto */}
                    <div className="card-light p-6 rounded-[22px] flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-[#111111] text-sm mb-3">Proceso de Postulación</h4>
                        <ol className="list-decimal list-inside space-y-2 text-[#555555] text-[11px]">
                          <li>Escaneo del código QR del stand</li>
                          <li>Carga de CV o kardex estudiantil</li>
                          <li>Entrevista técnica con líder de área</li>
                          <li>Emisión y firma de carta de aceptación</li>
                        </ol>
                      </div>
                      <div className="pt-3 border-t border-black/5 text-[10px] text-[#888888]">
                        vinculacion@develop.com • develop.com/talento
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'qr_registro' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Simulador del Código QR */}
                  <div className="lg:col-span-5 card-light p-7 rounded-[26px] text-center space-y-4">
                    <span className="px-3 py-1 bg-[#0f094f]/10 text-[#0f094f] font-bold text-xs rounded-full border border-[#0f094f]/15">
                      Código QR Activo para Mamparas
                    </span>
                    <h3 className="font-bold text-lg text-[#111111]">
                      Captura Digital Inmediata
                    </h3>
                    <p className="text-xs text-[#555555]">
                      Los estudiantes escanean este código en el stand y quedan sincronizados en tiempo real en la base de datos del CRM.
                    </p>

                    <div className="w-52 h-52 mx-auto premium-dark-surface text-white rounded-2xl flex flex-col items-center justify-center p-4 shadow-develop-modal border-2 border-white/20">
                      <QrCode className="w-36 h-36 text-white" />
                      <span className="text-[10px] font-mono mt-1 text-[#a78bfa] font-bold">
                        DEV-{activeDeal.id.toUpperCase().slice(-5)}
                      </span>
                    </div>

                    <div className="text-xs text-[#555555] font-medium">
                      Estudiantes registrados en este evento:
                      <strong className="text-[#0f094f] ml-1.5 font-black text-sm">
                        {activeDeal.registeredLeadsCount || 0} registrados
                      </strong>
                    </div>
                  </div>

                  {/* Simulador del Formulario Móvil */}
                  <div className="lg:col-span-7 card-light p-7 rounded-[26px] space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-black/5">
                      <div>
                        <h4 className="font-bold text-sm text-[#111111]">
                          Simulador de Registro Móvil del Estudiante
                        </h4>
                        <span className="text-[11px] text-[#555555]">
                          Ingresa datos de prueba para registrar un lead directamente en el CRM
                        </span>
                      </div>
                      <span className="chip-skill text-[10px] px-2 py-0.5">
                        Sincronización Inmediata
                      </span>
                    </div>

                    {registrationSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ¡Estudiante registrado con éxito! Lead incorporado en el expediente de {company.name}.
                      </div>
                    )}

                    <form onSubmit={handleTestStudentSubmit} className="space-y-3.5 text-xs">
                      <div>
                        <label className="font-bold text-[#111111] block mb-1">Nombre Completo del Estudiante</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Alan Morales López"
                          value={testStudentName}
                          onChange={(e) => setTestStudentName(e.target.value)}
                          className="input-develop w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-[#111111] block mb-1">Correo Institucional / Personal</label>
                          <input
                            type="email"
                            required
                            placeholder="alan.morales@alumno.edu.mx"
                            value={testStudentEmail}
                            onChange={(e) => setTestStudentEmail(e.target.value)}
                            className="input-develop w-full"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-[#111111] block mb-1">Carrera / Especialidad</label>
                          <select
                            value={testStudentCareer}
                            onChange={(e) => setTestStudentCareer(e.target.value)}
                            className="input-develop w-full"
                          >
                            <option value="Ingeniería en Sistemas Computacionales">Ing. en Sistemas Computacionales</option>
                            <option value="Ingeniería Mecatrónica & Robótica">Ing. Mecatrónica & Robótica</option>
                            <option value="Licenciatura en Informática">Lic. en Informática</option>
                            <option value="Mercadotecnia & Negocios Digitales">Mercadotecnia & Negocios</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-primary-develop w-full py-3 text-xs font-bold shadow-xs"
                      >
                        Simular Envío de Postulación
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeSubTab === 'areas' && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-[#111111]">
                    Áreas de Desempeño y Cupos Disponibles en Develop
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="card-light p-5 rounded-2xl space-y-2">
                      <div className="font-bold text-[#0f094f] text-sm">Desarrollo Web & Cloud</div>
                      <p className="text-[#555555] text-[11px] leading-relaxed">
                        React, Node.js, TypeScript y arquitecturas distribuidas en la nube.
                      </p>
                      <div className="text-[10px] text-emerald-700 font-bold">18 cupos disponibles</div>
                    </div>

                    <div className="card-light p-5 rounded-2xl space-y-2">
                      <div className="font-bold text-[#29008e] text-sm">Inteligencia Artificial & Datos</div>
                      <p className="text-[#555555] text-[11px] leading-relaxed">
                        Modelos generativos, agentes autónomos y análisis predictivo aplicado.
                      </p>
                      <div className="text-[10px] text-emerald-700 font-bold">12 cupos disponibles</div>
                    </div>

                    <div className="card-light p-5 rounded-2xl space-y-2">
                      <div className="font-bold text-[#640354] text-sm">Automatización & CRM</div>
                      <p className="text-[#555555] text-[11px] leading-relaxed">
                        Integraciones empresariales, analítica y optimización de plataformas de talento.
                      </p>
                      <div className="text-[10px] text-emerald-700 font-bold">15 cupos disponibles</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============================================================== */}
          {/* VISTAS PARA: HACKATHON TECNOLÓGICO                            */}
          {/* ============================================================== */}
          {activeDeal.eventType === 'hackathon' && (
            <>
              {activeSubTab === 'principal' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-black/5">
                    <div>
                      <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                        <Flame className="w-5 h-5 text-[#29008e]" />
                        Retos Técnicos Formulados con Marcas Aliadas
                      </h3>
                      <p className="text-xs text-[#555555]">
                        Desafíos de programación y desarrollo que resolverán los equipos de {company.name}.
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-[#29008e]/10 text-[#29008e] font-bold rounded-full border border-[#29008e]/15">
                      Sponsor Principal: {activeDeal.alliedBrands.join(' & ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
                    {/* Reto 1 */}
                    <div className="card-light p-6 rounded-[22px] flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="px-2.5 py-0.5 bg-[#0f094f]/10 text-[#0f094f] font-bold rounded text-[10px]">
                          RETO 1 · CLOUD & IA
                        </span>
                        <h4 className="font-bold text-sm text-[#111111] leading-tight">
                          Optimización Logística con Modelos de Lenguaje
                        </h4>
                        <p className="text-[#555555] text-[11px] leading-relaxed">
                          Construir un asistente inteligente que analice tiempos de traslado y genere rutas óptimas para equipos de campo usando APIs avanzadas.
                        </p>
                      </div>
                      <div className="pt-3 border-t border-black/5 text-[10px] text-[#888888] font-semibold">
                        Evaluador: Líder de Arquitectura Cloud
                      </div>
                    </div>

                    {/* Reto 2 */}
                    <div className="card-light p-6 rounded-[22px] flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="px-2.5 py-0.5 bg-[#29008e]/10 text-[#29008e] font-bold rounded text-[10px]">
                          RETO 2 · FULLSTACK ENTERPRISE
                        </span>
                        <h4 className="font-bold text-sm text-[#111111] leading-tight">
                          Portal de Estadías y Registro Automático
                        </h4>
                        <p className="text-[#555555] text-[11px] leading-relaxed">
                          Crear un prototipo de portal web responsivo con validación de matrícula y carga segura de currículum en la nube.
                        </p>
                      </div>
                      <div className="pt-3 border-t border-black/5 text-[10px] text-[#888888] font-semibold">
                        Evaluador: Senior Developer Develop
                      </div>
                    </div>

                    {/* Reto 3 */}
                    <div className="card-light p-6 rounded-[22px] flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="px-2.5 py-0.5 bg-[#640354]/10 text-[#640354] font-bold rounded text-[10px]">
                          RETO 3 · DATA & ALGORITMOS
                        </span>
                        <h4 className="font-bold text-sm text-[#111111] leading-tight">
                          Generador Dinámico de Creatividades
                        </h4>
                        <p className="text-[#555555] text-[11px] leading-relaxed">
                          Desarrollar un pipeline que ensamble creatividades institucionales en formatos estándar a partir de parámetros estructurados.
                        </p>
                      </div>
                      <div className="pt-3 border-t border-black/5 text-[10px] text-[#888888] font-semibold">
                        Evaluador: Dirección de Producto Develop
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'premios' && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Bolsa de Premios del Hackathon
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="premium-dark-surface p-6 rounded-[24px] text-white space-y-2 border border-white/10 shadow-develop-modal">
                      <div className="text-2xl font-black gradient-text">1er Lugar 🥇</div>
                      <div className="font-bold text-white text-base">$30,000 MXN en efectivo</div>
                      <p className="text-[11px] text-white/70 leading-relaxed">
                        + Aceptación directa sin filtro técnico en el programa de talento Develop.
                      </p>
                    </div>

                    <div className="card-light p-6 rounded-[24px] space-y-2">
                      <div className="text-2xl font-black text-[#29008e]">2do Lugar 🥈</div>
                      <div className="font-bold text-[#111111] text-base">$15,000 MXN en equipo tech</div>
                      <p className="text-[11px] text-[#555555] leading-relaxed">
                        + Vales para certificaciones oficiales en la nube y kit exclusivo.
                      </p>
                    </div>

                    <div className="card-light p-6 rounded-[24px] space-y-2">
                      <div className="text-2xl font-black text-[#640354]">3er Lugar 🥉</div>
                      <div className="font-bold text-[#111111] text-base">Cursos & Certificaciones</div>
                      <p className="text-[11px] text-[#555555] leading-relaxed">
                        + Acceso prioritario a entrevistas de talento e inserción laboral.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'mentores' && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-[#111111]">
                    Equipo de Mentores Senior Designados para el Evento
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {['Ing. Carlos Mendoza (Develop)', 'Mtra. Andrea Ruiz (Cloud Partner)', 'Lic. David Soto (Tech Lead)', 'Dra. Gabriela Fuentes (AI Lab)'].map((mentor, idx) => (
                      <div key={idx} className="card-light p-4 rounded-2xl text-center space-y-1.5">
                        <div className="w-11 h-11 rounded-full bg-[#0f094f] text-white font-bold flex items-center justify-center mx-auto text-xs shadow-xs">
                          {mentor.split(' ')[1]?.[0] || 'M'}
                        </div>
                        <div className="font-bold text-[#111111] text-xs">{mentor}</div>
                        <div className="text-[10px] text-[#888888]">Mentoría y revisión técnica</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSubTab === 'kit_bienvenida' && (
                <div className="card-light p-6 rounded-[24px] text-xs space-y-3">
                  <h4 className="font-bold text-[#111111] text-sm">Artículos del Kit de Bienvenida Físico</h4>
                  <p className="text-[#555555] text-[11px]">
                    Entregados en el check-in matutino del hackathon institucional:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#111111] font-semibold">
                    <div className="p-3 bg-[#F8F8FC] rounded-xl border border-black/5">👕 Playera oficial del evento</div>
                    <div className="p-3 bg-[#F8F8FC] rounded-xl border border-black/5">🏷️ Gafete y lanyard oficial</div>
                    <div className="p-3 bg-[#F8F8FC] rounded-xl border border-black/5">✨ Pack de stickers Develop</div>
                    <div className="p-3 bg-[#F8F8FC] rounded-xl border border-black/5">📓 Libreta técnica y pluma</div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============================================================== */}
          {/* VISTAS PARA: CONFERENCIA / TALLER / RECORRIDO                  */}
          {/* ============================================================== */}
          {(activeDeal.eventType === 'conferencia_taller' || activeDeal.eventType === 'recorrido_comercial' || activeDeal.eventType === 'proyecto') && (
            <>
              {activeSubTab === 'principal' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-black/5">
                    <div>
                      <h3 className="text-base font-bold text-[#111111] flex items-center gap-2">
                        <Presentation className="w-5 h-5 text-[#0f094f]" />
                        Presentación de Diapositivas en Alta Resolución (Deck del Ponente)
                      </h3>
                      <p className="text-xs text-[#555555]">
                        Estructura visual lista para proyectar en el auditorio de {company.name}.
                      </p>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="btn-primary-develop px-4 py-2 text-xs font-bold"
                    >
                      Exportar Diapositivas
                    </button>
                  </div>

                  {/* Diapositiva interactiva con Premium Dark Surface */}
                  <div className="premium-dark-surface text-white p-8 sm:p-10 rounded-[28px] shadow-develop-modal border border-white/10 min-h-[400px] flex flex-col justify-between">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 bg-white text-[#07052e] font-extrabold text-xs rounded-xl shadow-develop-glow">
                          DEVELOP
                        </span>
                        <span className="text-xs text-white/80 font-bold tracking-wide">TALENT ECOSYSTEM</span>
                      </div>
                      <span className="text-xs text-[#a78bfa] font-mono">Conferencia Magistral 2026</span>
                    </div>

                    <div className="my-auto space-y-3 py-6 text-center relative z-10">
                      <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
                        Inteligencia Artificial y Modalidad Dual:
                        <span className="block gradient-text mt-1.5">Tu Puente al Ecosistema Laboral</span>
                      </h2>
                      <p className="text-sm text-white/70 max-w-xl mx-auto leading-relaxed">
                        Presentación magistral para los estudiantes de ingeniería y tecnologías de {company.name}.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/15 text-xs text-white/60 relative z-10">
                      <span>Ponente: Lic. Carlos Mendoza · Develop</span>
                      <span>Sede: Auditorio de {company.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'guion' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-black/5">
                    <div>
                      <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2">
                        <MessageSquareText className="w-4 h-4 text-[#29008e]" />
                        Guion del Ponente (Generado con IA a partir de datos del CRM)
                      </h3>
                      <p className="text-[11px] text-[#555555]">
                        Estructurado con introducción, puntos de contacto y llamado a la acción.
                      </p>
                    </div>
                    <span className="chip-skill text-[10px] px-2 py-0.5">
                      Generado con IA
                    </span>
                  </div>

                  <div className="card-light p-6 rounded-[22px] space-y-4 text-[#555555] leading-relaxed max-h-[440px] overflow-y-auto">
                    <div>
                      <strong className="text-[#111111] block mb-1">00:00 - 05:00 min · Introducción y Apertura:</strong>
                      <p className="text-[11px]">
                        "Buenos días a todos los futuros ingenieros y directivos de {company.name}. Hoy venimos de parte de Develop con un objetivo claro: mostrarles qué busca la industria de tecnología e inteligencia artificial en México en este 2026..."
                      </p>
                    </div>

                    <div>
                      <strong className="text-[#111111] block mb-1">05:00 - 20:00 min · El Valor de la Modalidad Dual y Estadías:</strong>
                      <p className="text-[11px]">
                        "En el mercado actual, la experiencia previa comprobable es el diferenciador definitivo. Mediante el convenio que tenemos con {company.name}, ustedes pueden liberar su residencia o estadía desarrollando proyectos reales..."
                      </p>
                    </div>

                    <div>
                      <strong className="text-[#111111] block mb-1">20:00 - 35:00 min · Demostración de Proyectos y Marcas Aliadas:</strong>
                      <p className="text-[11px]">
                        "Mostramos ejemplos concretos de sistemas desarrollados por residentes anteriores en alianza con líderes tecnológicos como {activeDeal.alliedBrands.join(' y ')}..."
                      </p>
                    </div>

                    <div>
                      <strong className="text-[#111111] block mb-1">35:00 - 45:00 min · Llamada a la Acción (Call to Action):</strong>
                      <p className="text-[11px]">
                        "Los invitamos a escanear en este momento el código QR de mampara para registrar su interés. El proceso de selección técnica arranca la próxima semana..."
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'difusion' && (
                <div className="space-y-4 text-xs">
                  <h3 className="font-bold text-sm text-[#111111]">
                    Piezas Gráficas para Difusión Previa en Redes Sociales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Story 9:16 */}
                    <div className="premium-dark-surface p-6 rounded-[22px] text-white space-y-2.5 text-center border border-white/10">
                      <span className="text-[10px] pill-dark px-3 py-1 font-bold inline-block">HISTORIA 9:16</span>
                      <div className="font-black text-base text-white">¡Conferencia Magistral este Jueves!</div>
                      <p className="text-[11px] text-white/70">
                        Auditorio Central · {company.name}. Conoce el programa de talento Develop.
                      </p>
                    </div>

                    {/* Cartel A4 */}
                    <div className="card-light p-6 rounded-[22px] space-y-2.5 text-left">
                      <span className="text-[10px] bg-[#0f094f] text-white px-2.5 py-1 rounded font-bold inline-block">CARTEL IMPRESO</span>
                      <div className="font-black text-base text-[#111111]">Conferencia: Inteligencia Artificial en Entornos Reales</div>
                      <p className="text-[11px] text-[#555555]">
                        Entrada libre para estudiantes de ingeniería. Registro previo mediante QR.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'seguimiento' && (
                <div className="card-light p-6 rounded-[24px] text-xs space-y-3">
                  <h4 className="font-bold text-[#111111] text-sm">Material Digital de Seguimiento para Estudiantes Asistentes</h4>
                  <p className="text-[#555555] text-[11px]">
                    PDF descargable que se envía por correo a los alumnos que escanearon el QR durante la conferencia:
                  </p>
                  <ul className="space-y-2 text-[#111111] font-medium">
                    <li>• Resumen de diapositivas de la conferencia en formato PDF</li>
                    <li>• Guía de preparación para entrevistas técnicas de estadías</li>
                    <li>• Enlace a la prueba diagnóstica de código de Develop</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
