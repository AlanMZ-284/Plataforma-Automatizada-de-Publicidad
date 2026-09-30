import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Deal, Company } from '../../types';
import {
  Package,
  Sparkles,
  Printer,
  CheckCircle2,
  QrCode,
  Layout,
  FileText,
  Flag,
  Share2,
  Presentation,
  Flame,
  Trophy,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  Square,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  Sliders,
  Calendar,
  Clock,
  Sparkle
} from 'lucide-react';
import { registrarAlumnoQr } from '../../services/servicioCrm';
import {
  generarContenidoEventoIa,
  ContenidoKitCompleto
} from '../../services/servicioContenidosIa';
import { GeneradorQrVectorial } from './GeneradorQrVectorial';

interface EventKitAndContentModuleProps {
  deals: Deal[];
  companies: Company[];
  selectedDealId?: string | null;
  onUpdateDealLeads?: (dealId: string, count: number) => void;
  onSelectSchoolForCRM?: (schoolId: string) => void;
}

type PestanaKit = 'graficos_html' | 'insumos_logisticos' | 'editor_rapido' | 'guion_cronometro' | 'qr_en_vivo';
type FormatoGrafico = 'a4_cartel' | 'banner_9_16' | 'triptico';

export const EventKitAndContentModule: React.FC<EventKitAndContentModuleProps> = ({
  deals,
  companies,
  selectedDealId,
  onUpdateDealLeads,
  onSelectSchoolForCRM
}) => {
  const [activeDealId, setActiveDealId] = useState<string>(selectedDealId || deals[0]?.id || '');
  const [pestanaActiva, setPestanaActiva] = useState<PestanaKit>('graficos_html');
  const [formatoGrafico, setFormatoGrafico] = useState<FormatoGrafico>('a4_cartel');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Estado del cronómetro de lectura para el ponente
  const [cronometroSegundos, setCronometroSegundos] = useState<number>(0);
  const [cronometroActivo, setCronometroActivo] = useState<boolean>(false);
  const cronometroIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Estados de prueba para captura rápida de alumnos en la zona QR
  const [testStudentName, setTestStudentName] = useState('');
  const [testStudentEmail, setTestStudentEmail] = useState('');
  const [testStudentCareer, setTestStudentCareer] = useState('Ingeniería en Sistemas Computacionales');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Copiado al portapapeles
  const [textoCopiadoKey, setTextoCopiadoKey] = useState<string | null>(null);

  // Checklist interactivo de insumos logísticos
  const [checklistCompletados, setChecklistCompletados] = useState<Record<string, boolean>>({});

  // Sincronizar prop externa de trato seleccionado
  useEffect(() => {
    if (selectedDealId) {
      setActiveDealId(selectedDealId);
    }
  }, [selectedDealId]);

  const activeDeal = useMemo(() => {
    return deals.find((d) => d.id === activeDealId) || deals[0];
  }, [deals, activeDealId]);

  const company = useMemo(() => {
    return companies.find((c) => c.id === activeDeal?.companyId) || companies[0];
  }, [companies, activeDeal]);

  // Contenido estructurado generado por IA
  const [contenidoKit, setContenidoKit] = useState<ContenidoKitCompleto>(() => {
    return {
      id: `kit-${Date.now()}`,
      oportunidadId: activeDeal?.id || 'demo',
      tipoEvento: activeDeal?.eventType || 'feria_trabajo',
      nombreEvento: activeDeal?.title || 'Feria de Talento y Vinculación',
      nombreUniversidad: company?.name || 'Universidad Aliada',
      fechaEvento: activeDeal?.expectedCloseDate || '15 de Octubre • 10:00 hrs',
      lugarEspecifico: `Auditorio Central • ${company?.name || 'Campus Principal'}`,
      marcasAliadas: activeDeal?.alliedBrands || ['AWS', 'Microsoft Azure', 'Google Cloud'],
      copysRedes: {
        instagramStories: '',
        tikTok: '',
        metaFacebookWhatsapp: '',
        linkedIn: ''
      },
      cartelA4: {
        encabezadoSuperior: '',
        tituloPrincipal: '',
        subtitulo: '',
        fechaHoraLugar: '',
        beneficiosClave: [],
        marcasAliadas: [],
        llamadoAccion: '',
        textoPie: ''
      },
      triptico: {
        portada: { titulo: '', subtitulo: '', lema: '', fecha: '' },
        cuerpoInterior: { tituloSeccion: '', descripcion: '', areasFormativas: [], beneficiosEstudiantes: [] },
        reversoContacto: { requisitos: [], testimonios: [], datosContacto: { coordinacion: '', correo: '', sitioWeb: '' } }
      },
      guionPonente: [],
      insumosLogistica: { standYMampara: [], impresosYPapeleria: [], tecnologiaYSoporte: [], reconocimientosYMerchandising: [] },
      generadoConIa: false,
      marcaTiempo: new Date().toISOString()
    };
  });

  // Cargar contenidos cuando cambia el trato seleccionado
  useEffect(() => {
    if (!activeDeal || !company) return;

    generarContenidoEventoIa({
      oportunidadId: activeDeal.id,
      tipoEvento: activeDeal.eventType,
      nombreEvento: activeDeal.title,
      nombreUniversidad: company.name,
      municipio: company.municipality,
      estado: company.state,
      fechaEvento: activeDeal.expectedCloseDate,
      modalidad: activeDeal.projectModality,
      marcasAliadas: activeDeal.alliedBrands,
      directorNombre: company.directorName,
      lugarEspecifico: `Campus Principal • ${company.name}`
    }).then((contenido) => {
      setContenidoKit(contenido);
    });
  }, [activeDeal, company]);

  // Manejo del cronómetro de lectura
  useEffect(() => {
    if (cronometroActivo) {
      cronometroIntervalRef.current = setInterval(() => {
        setCronometroSegundos((s) => s + 1);
      }, 1000);
    } else if (cronometroIntervalRef.current) {
      clearInterval(cronometroIntervalRef.current);
    }
    return () => {
      if (cronometroIntervalRef.current) clearInterval(cronometroIntervalRef.current);
    };
  }, [cronometroActivo]);

  const formatearTiempoCronometro = (totalSegundos: number) => {
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  // Motor de Contenidos con IA (Generador de Piezas Develop)
  const handleGenerateAIContent = async () => {
    if (!activeDeal || !company) return;
    setIsGeneratingAI(true);
    setAiSuccessMessage(null);

    try {
      const nuevoContenido = await generarContenidoEventoIa({
        oportunidadId: activeDeal.id,
        tipoEvento: activeDeal.eventType,
        nombreEvento: activeDeal.title,
        nombreUniversidad: company.name,
        municipio: company.municipality,
        estado: company.state,
        fechaEvento: activeDeal.expectedCloseDate,
        modalidad: activeDeal.projectModality,
        marcasAliadas: activeDeal.alliedBrands,
        directorNombre: company.directorName,
        lugarEspecifico: `Auditorio Central • ${company.name}`
      });

      setContenidoKit({
        ...nuevoContenido,
        generadoConIa: true
      });

      setAiSuccessMessage(
        `¡Materiales generados y personalizados con éxito para ${company.name}! Se estructuraron copys, cartel A4, folleto tríptico y guion adaptados al evento.`
      );
      setTimeout(() => setAiSuccessMessage(null), 5000);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Copiar texto genérico al portapapeles
  const handleCopiarTexto = async (texto: string, clave: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setTextoCopiadoKey(clave);
      setTimeout(() => setTextoCopiadoKey(null), 2500);
    } catch {
      // Fallback
    }
  };

  // Alternar ítem de checklist
  const toggleChecklist = (idItem: string) => {
    setChecklistCompletados((prev) => ({
      ...prev,
      [idItem]: !prev[idItem]
    }));
  };

  // Simulación de captura de lead por QR en evento
  const handleTestStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testStudentName.trim() || !activeDeal) return;

    const currentCount = activeDeal.registeredLeadsCount || 0;
    if (onUpdateDealLeads) {
      onUpdateDealLeads(activeDeal.id, currentCount + 1);
    }

    try {
      await registrarAlumnoQr({
        oportunidad_id: activeDeal.id,
        universidad_id: activeDeal.companyId,
        nombre_completo: testStudentName.trim(),
        correo_electronico: testStudentEmail.trim() || 'alumno@universidad.edu.mx',
        carrera: testStudentCareer,
        aviso_privacidad_aceptado: true
      });
    } catch (err) {
      console.warn('Error sincronizando captura QR:', err);
    }

    setRegistrationSuccess(true);
    setTimeout(() => {
      setRegistrationSuccess(false);
      setTestStudentName('');
      setTestStudentEmail('');
    }, 3500);
  };

  // Imprimir pieza con diálogo nativo
  const handleImprimirPieza = () => {
    window.print();
  };

  if (!activeDeal || !company) {
    return (
      <div className="p-8 card-light rounded-[24px] text-center text-[#555555]">
        No hay iniciativas o eventos registrados en el pipeline de ventas.
      </div>
    );
  }

  // Marcas aliadas activas
  const marcasAliadasTexto = contenidoKit.marcasAliadas.join(', ');

  return (
    <div className="space-y-7">
      {/* ============================================================== */}
      {/* ESTILOS DE IMPRESIÓN EXACTOS (@media print)                    */}
      {/* ============================================================== */}
      <style>{`
        @media print {
          /* Ocultar elementos de navegación y UI de la aplicación */
          aside, header, nav, .btn-no-print, .internal-hero-surface, .pestanas-kit-navegacion {
            display: none !important;
          }
          body, main, #root {
            background: white !important;
            color: #111111 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .area-impresion-publicitaria {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .page-break-before {
            page-break-before: always;
          }
        }
      `}</style>

      {/* HEADER HERO ESTÁTICO DEVELOP */}
      <div className="internal-hero-surface rounded-[20px] sm:rounded-[28px] p-4 sm:p-7 lg:p-8 shadow-develop-modal border border-white/10 text-white relative btn-no-print">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 pill-dark text-xs font-bold uppercase tracking-widest text-[#a78bfa]">
              <Package className="w-3.5 h-3.5" />
              Develop Talent Suite · Kits Comerciales & Motor IA
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Kit de Eventos & <span className="gradient-text">Motor de Contenidos IA HTML-First</span>
            </h1>
            <p className="text-white/70 text-xs lg:text-sm leading-relaxed">
              Generación de piezas publicitarias con medidas de impresión exactas (Cartel A4, Banner 9:16 y Tríptico de 3 cuerpos), códigos QR vectoriales dinámicos y guiones con cronómetro para el speaker.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateAIContent}
              disabled={isGeneratingAI}
              className="btn-primary-dark inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition-all shadow-develop-glow disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-[#29008e] ${isGeneratingAI ? 'animate-spin' : ''}`} />
              {isGeneratingAI ? 'Generando con IA...' : 'Regenerar Contenidos con IA'}
            </button>
            <button
              onClick={handleImprimirPieza}
              className="btn-outline-dark inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Exportar a PDF
            </button>
          </div>
        </div>
      </div>

      {aiSuccessMessage && (
        <div className="bg-[#0f094f]/5 border border-[#0f094f]/15 text-[#0f094f] p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs animate-fadeIn btn-no-print">
          <Sparkle className="w-5 h-5 text-[#29008e] shrink-0" />
          <span>{aiSuccessMessage}</span>
        </div>
      )}

      {/* BARRA DE SELECCIÓN DE EVENTO / UNIVERSIDAD */}
      <div className="card-light p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 btn-no-print">
        <div className="flex flex-col sm:flex-row sm:items-center flex-1 gap-2 sm:gap-3 w-full">
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

          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 text-[10px]">
            {activeDeal.registeredLeadsCount || 0} alumnos captados
          </span>

          {activeDeal.alliedBrands && activeDeal.alliedBrands.length > 0 && (
            <span className="px-2.5 py-1 bg-[#29008e]/5 text-[#29008e] font-bold rounded-lg border border-[#29008e]/15 flex items-center gap-1 text-[10px]">
              <Flag className="w-3 h-3 text-[#29008e]" />
              {activeDeal.alliedBrands.join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* PESTAÑAS PRINCIPALES DEL KIT */}
      <div className="card-light rounded-[28px] overflow-hidden">
        {/* Barra de Navegación de Pestañas */}
        <div className="flex border-b border-black/5 bg-[#F8F8FC] px-3 sm:px-5 pt-3 gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pestanas-kit-navegacion btn-no-print">
          <button
            onClick={() => setPestanaActiva('graficos_html')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-xs font-bold shrink-0 whitespace-nowrap transition-all border-t border-x ${
              pestanaActiva === 'graficos_html'
                ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                : 'border-transparent text-[#555555] hover:text-[#111111]'
            }`}
          >
            <Layout className="w-4 h-4 text-[#0f094f]" />
            1. Materiales Gráficos HTML
          </button>

          <button
            onClick={() => setPestanaActiva('insumos_logisticos')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-xs font-bold shrink-0 whitespace-nowrap transition-all border-t border-x ${
              pestanaActiva === 'insumos_logisticos'
                ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                : 'border-transparent text-[#555555] hover:text-[#111111]'
            }`}
          >
            <Package className="w-4 h-4 text-[#29008e]" />
            2. Insumos Físicos & Checklist
          </button>

          <button
            onClick={() => setPestanaActiva('editor_rapido')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-xs font-bold shrink-0 whitespace-nowrap transition-all border-t border-x ${
              pestanaActiva === 'editor_rapido'
                ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                : 'border-transparent text-[#555555] hover:text-[#111111]'
            }`}
          >
            <Edit3 className="w-4 h-4 text-[#640354]" />
            3. Editor Rápido en Vivo
          </button>

          <button
            onClick={() => setPestanaActiva('guion_cronometro')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-xs font-bold shrink-0 whitespace-nowrap transition-all border-t border-x ${
              pestanaActiva === 'guion_cronometro'
                ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                : 'border-transparent text-[#555555] hover:text-[#111111]'
            }`}
          >
            <Presentation className="w-4 h-4 text-[#0f094f]" />
            4. Guion del Ponente / MC
          </button>

          <button
            onClick={() => setPestanaActiva('qr_en_vivo')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-t-xl text-xs font-bold shrink-0 whitespace-nowrap transition-all border-t border-x ${
              pestanaActiva === 'qr_en_vivo'
                ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                : 'border-transparent text-[#555555] hover:text-[#111111]'
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-700" />
            5. Zona QR en Vivo & Stand
          </button>
        </div>

        {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* ============================================================== */}
          {/* PESTAÑA 1: MATERIALES GRÁFICOS HTML-FIRST CON MEDIDAS REALES   */}
          {/* ============================================================== */}
          {pestanaActiva === 'graficos_html' && (
            <div className="space-y-6">
              {/* Barra de Subformatos (A4, 9:16, Tríptico) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5 btn-no-print">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                    Formato de Salida:
                  </span>
                  <div className="inline-flex rounded-xl bg-[#F8F8FC] p-1 border border-black/5">
                    <button
                      onClick={() => setFormatoGrafico('a4_cartel')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formatoGrafico === 'a4_cartel'
                          ? 'bg-white text-[#0f094f] shadow-xs'
                          : 'text-[#555555] hover:text-[#111111]'
                      }`}
                    >
                      Cartel A4 Mampara
                    </button>
                    <button
                      onClick={() => setFormatoGrafico('banner_9_16')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formatoGrafico === 'banner_9_16'
                          ? 'bg-white text-[#0f094f] shadow-xs'
                          : 'text-[#555555] hover:text-[#111111]'
                      }`}
                    >
                      Historia / Story 9:16
                    </button>
                    <button
                      onClick={() => setFormatoGrafico('triptico')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formatoGrafico === 'triptico'
                          ? 'bg-white text-[#0f094f] shadow-xs'
                          : 'text-[#555555] hover:text-[#111111]'
                      }`}
                    >
                      Folleto Tríptico (3 Cuerpos)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleImprimirPieza}
                    className="btn-primary-develop px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#a78bfa]" />
                    Imprimir Esta Pieza
                  </button>
                </div>
              </div>

              {/* FORMATO 1: CARTEL A4 MAMPARA (210mm x 297mm) */}
              {formatoGrafico === 'a4_cartel' && (
                <div className="flex justify-center">
                  <div
                    className="area-impresion-publicitaria w-full max-w-[650px] bg-white rounded-2xl shadow-develop-modal border border-black/10 overflow-hidden text-[#111111] p-6 sm:p-10 flex flex-col justify-between"
                    style={{ minHeight: '850px' }}
                  >
                    {/* Encabezado Institucional Superior */}
                    <div className="border-b-2 border-[#0f094f] pb-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#29008e]">
                          {contenidoKit.cartelA4.encabezadoSuperior}
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-[#0f094f] tracking-tight mt-1">
                          {contenidoKit.cartelA4.tituloPrincipal}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-[#640354] mt-0.5">
                          {contenidoKit.cartelA4.subtitulo}
                        </div>
                      </div>

                      {/* Logotipo Develop Badge */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0f094f] via-[#29008e] to-[#640354] flex items-center justify-center text-white font-black text-xl shadow-develop-box shrink-0">
                        D
                      </div>
                    </div>

                    {/* Fecha y Sede Destacada */}
                    <div className="my-5 bg-[#F8F8FC] p-4 rounded-xl border border-black/5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0f094f]/10 text-[#0f094f] flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#888888]">Fecha y Lugar Oficial:</div>
                        <div className="font-extrabold text-xs sm:text-sm text-[#111111]">
                          {contenidoKit.cartelA4.fechaHoraLugar}
                        </div>
                      </div>
                    </div>

                    {/* Beneficios Clave */}
                    <div className="space-y-3 my-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0f094f]">
                        Beneficios Exclusivos para Estudiantes:
                      </div>
                      <div className="space-y-2.5">
                        {contenidoKit.cartelA4.beneficiosClave.map((beneficio, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-[#222222]">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="font-medium leading-relaxed">{beneficio}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Marcas Patrocinadoras */}
                    <div className="my-4 pt-4 border-t border-black/5">
                      <div className="text-[10px] font-bold uppercase text-[#888888] tracking-wider mb-2">
                        Capacitación y Proyectos Respaldados Por:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {contenidoKit.cartelA4.marcasAliadas.map((marca, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-[#0f094f]/5 text-[#0f094f] border border-[#0f094f]/15 rounded-lg text-xs font-bold"
                          >
                            {marca}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bloque de Escaneo QR Vectorial */}
                    <div className="mt-6 pt-5 border-t-2 border-dashed border-[#29008e]/30 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-[#0f094f]/5 to-[#29008e]/5 p-5 rounded-2xl">
                      <div className="shrink-0 bg-white p-2 rounded-xl shadow-xs border border-black/10">
                        <GeneradorQrVectorial
                          oportunidadId={activeDeal.id}
                          nombreEvento={contenidoKit.nombreEvento}
                          nombreInstitucion={company.name}
                          tamano={130}
                          mostrarBotonesDescarga={false}
                          mostrarEnlace={false}
                          etiquetaInstruccion=""
                        />
                      </div>

                      <div className="text-left space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#29008e]/10 text-[#29008e] text-[10px] font-bold uppercase">
                          <QrCode className="w-3 h-3" /> Escaneo Inmediato
                        </div>
                        <h4 className="font-extrabold text-sm sm:text-base text-[#111111]">
                          ¡Asegura tu lugar en el programa!
                        </h4>
                        <p className="text-[11px] text-[#555555] leading-relaxed">
                          {contenidoKit.cartelA4.llamadoAccion}
                        </p>
                      </div>
                    </div>

                    {/* Pie Legal LFPDPPP */}
                    <div className="mt-5 text-center text-[9px] text-[#888888]">
                      {contenidoKit.cartelA4.textoPie}
                    </div>
                  </div>
                </div>
              )}

              {/* FORMATO 2: BANNER HISTORIA 9:16 (MOBILE / TIKTOK / INSTAGRAM) */}
              {formatoGrafico === 'banner_9_16' && (
                <div className="flex justify-center">
                  <div
                    className="area-impresion-publicitaria w-full max-w-[380px] rounded-[32px] overflow-hidden shadow-develop-modal border border-white/20 text-white flex flex-col justify-between p-6 relative"
                    style={{
                      aspectRatio: '9/16',
                      background: 'linear-gradient(160deg, #07052e 0%, #0f094f 40%, #29008e 75%, #640354 100%)'
                    }}
                  >
                    {/* Header Historia */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-black tracking-widest text-[#a78bfa] px-2.5 py-1 bg-white/10 rounded-full backdrop-blur-xs">
                          Develop Talent Suite
                        </span>
                        <span className="text-[10px] text-white/60 font-semibold">
                          {company.municipality}
                        </span>
                      </div>

                      <div className="mt-6 text-center space-y-2">
                        <h2 className="text-2xl font-black tracking-tight leading-tight">
                          {contenidoKit.nombreEvento}
                        </h2>
                        <div className="text-xs text-emerald-400 font-bold">
                          📍 {company.name}
                        </div>
                        <div className="text-[11px] text-white/80">
                          {contenidoKit.fechaEvento}
                        </div>
                      </div>
                    </div>

                    {/* Centro con Marcas y Llamado */}
                    <div className="my-auto py-4 text-center space-y-4">
                      <div className="inline-block p-4 rounded-3xl bg-white text-[#111111] shadow-develop-box mx-auto">
                        <GeneradorQrVectorial
                          oportunidadId={activeDeal.id}
                          nombreEvento={contenidoKit.nombreEvento}
                          nombreInstitucion={company.name}
                          tamano={160}
                          mostrarBotonesDescarga={false}
                          mostrarEnlace={false}
                          etiquetaInstruccion=""
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-black uppercase tracking-wider text-white">
                          Escanea para tu Residencia TI
                        </div>
                        <div className="text-[11px] text-white/70">
                          Proyectos y certificaciones con {marcasAliadasTexto}
                        </div>
                      </div>
                    </div>

                    {/* Footer con CTA */}
                    <div className="text-center pt-2 border-t border-white/10">
                      <span className="text-[10px] text-white/50">
                        Desliza hacia arriba o escanea en el stand institucional
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* FORMATO 3: TRÍPTICO DE 3 CUERPOS */}
              {formatoGrafico === 'triptico' && (
                <div className="area-impresion-publicitaria bg-white rounded-2xl p-5 border border-black/10 shadow-develop-card">
                  <div className="mb-4 text-xs font-bold text-[#888888] flex items-center justify-between border-b border-black/5 pb-2">
                    <span>VISTA DE IMPRESIÓN EXTENDIDA · FOLLETO TRÍPTICO DE 3 CUERPOS</span>
                    <span className="text-[#29008e]">Líneas punteadas indican doblez de folleto</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black/10 rounded-2xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-dashed divide-black/20 text-xs">
                    {/* CUERPO 1: PORTADA */}
                    <div className="p-6 bg-gradient-to-b from-[#0f094f] to-[#29008e] text-white flex flex-col justify-between min-h-[460px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center font-bold text-sm">
                            D
                          </div>
                          <span className="font-extrabold text-sm tracking-tight">Develop Talent</span>
                        </div>

                        <div className="mt-12 space-y-2">
                          <span className="text-[9px] uppercase tracking-widest text-[#a78bfa] font-bold">
                            Cuerpo 1 · Portada
                          </span>
                          <h3 className="text-xl font-black text-white leading-tight">
                            {contenidoKit.triptico.portada.titulo}
                          </h3>
                          <p className="text-[11px] text-white/80">
                            {contenidoKit.triptico.portada.subtitulo}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-[11px] italic text-white/70">
                          "{contenidoKit.triptico.portada.lema}"
                        </p>
                        <div className="text-[10px] text-[#a78bfa] font-bold">
                          {contenidoKit.triptico.portada.fecha}
                        </div>
                      </div>
                    </div>

                    {/* CUERPO 2: INTERIOR / OFERTA */}
                    <div className="p-6 bg-[#F8F8FC] flex flex-col justify-between min-h-[460px]">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-[#640354] font-bold">
                          Cuerpo 2 · Oferta Formativa
                        </span>
                        <h4 className="font-bold text-sm text-[#111111] mt-1 mb-2">
                          {contenidoKit.triptico.cuerpoInterior.tituloSeccion}
                        </h4>
                        <p className="text-[11px] text-[#555555] mb-4 leading-relaxed">
                          {contenidoKit.triptico.cuerpoInterior.descripcion}
                        </p>

                        <div className="space-y-3">
                          {contenidoKit.triptico.cuerpoInterior.areasFormativas.map((area, i) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-black/5">
                              <div className="font-bold text-xs text-[#0f094f]">{area.nombre}</div>
                              <div className="text-[10px] text-[#555555] mt-0.5">{area.descripcion}</div>
                              <div className="text-[9px] font-semibold text-[#29008e] mt-1 font-mono">
                                {area.tecnologias}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-black/5 text-[10px] text-[#888888]">
                        Residencias profesionales con valor curricular oficial
                      </div>
                    </div>

                    {/* CUERPO 3: REVERSO & CONTACTO */}
                    <div className="p-6 bg-white flex flex-col justify-between min-h-[460px]">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest text-emerald-800 font-bold">
                          Cuerpo 3 · Contacto & QR
                        </span>
                        <h4 className="font-bold text-sm text-[#111111] mt-1 mb-2">
                          Requisitos de Admisión
                        </h4>
                        <ul className="space-y-1.5 text-[11px] text-[#555555] mb-4">
                          {contenidoKit.triptico.reversoContacto.requisitos.map((req, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#29008e] font-bold">•</span>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Testimonio */}
                        {contenidoKit.triptico.reversoContacto.testimonios.length > 0 && (
                          <div className="bg-[#0f094f]/5 p-3 rounded-xl border border-[#0f094f]/10 mb-4">
                            <p className="text-[10px] italic text-[#111111]">
                              {contenidoKit.triptico.reversoContacto.testimonios[0].cita}
                            </p>
                            <div className="text-[9px] font-bold text-[#0f094f] mt-1">
                              — {contenidoKit.triptico.reversoContacto.testimonios[0].alumno} (
                              {contenidoKit.triptico.reversoContacto.testimonios[0].carrera})
                            </div>
                          </div>
                        )}
                      </div>

                      {/* QR de Postulación */}
                      <div className="text-center pt-3 border-t border-black/5 flex flex-col items-center">
                        <GeneradorQrVectorial
                          oportunidadId={activeDeal.id}
                          nombreEvento={contenidoKit.nombreEvento}
                          nombreInstitucion={company.name}
                          tamano={100}
                          mostrarBotonesDescarga={false}
                          mostrarEnlace={false}
                          etiquetaInstruccion=""
                        />
                        <div className="text-[9px] text-[#555555] mt-1 font-semibold">
                          {contenidoKit.triptico.reversoContacto.datosContacto.coordinacion}
                        </div>
                        <div className="text-[9px] text-[#29008e]">
                          {contenidoKit.triptico.reversoContacto.datosContacto.correo}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* PESTAÑA 2: INSUMOS FÍSICOS Y CHECKLIST LOGÍSTICO               */}
          {/* ============================================================== */}
          {pestanaActiva === 'insumos_logisticos' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
                <div>
                  <h3 className="font-bold text-base text-[#111111] flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#0f094f]" />
                    Checklist de Insumos Físicos & Logística de Stand
                  </h3>
                  <p className="text-xs text-[#555555] mt-0.5">
                    Kit verificado para el evento "{activeDeal.title}" en {company.name}.
                  </p>
                </div>

                <span className="text-xs font-bold px-3 py-1 bg-[#0f094f]/10 text-[#0f094f] rounded-full self-start sm:self-auto">
                  Tipo: {activeDeal.eventType.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Stand y Mampara */}
                <div className="card-light p-5 rounded-2xl border border-black/5 space-y-3">
                  <div className="font-bold text-xs text-[#0f094f] uppercase tracking-wider flex items-center gap-2">
                    <Layout className="w-4 h-4 text-[#0f094f]" />
                    1. Stand, Mampara & Mobiliario
                  </div>
                  <div className="space-y-2">
                    {contenidoKit.insumosLogistica.standYMampara.map((item, idx) => {
                      const idKey = `stand_${idx}`;
                      const isChecked = !!checklistCompletados[idKey];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleChecklist(idKey)}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-black/5 cursor-pointer text-xs transition-colors"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#29008e] shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-[#888888] shrink-0 mt-0.5" />
                          )}
                          <span className={isChecked ? 'line-through text-[#888888]' : 'text-[#111111] font-medium'}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Impresos y Papelería */}
                <div className="card-light p-5 rounded-2xl border border-black/5 space-y-3">
                  <div className="font-bold text-xs text-[#29008e] uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#29008e]" />
                    2. Impresos & Material Físico
                  </div>
                  <div className="space-y-2">
                    {contenidoKit.insumosLogistica.impresosYPapeleria.map((item, idx) => {
                      const idKey = `impresos_${idx}`;
                      const isChecked = !!checklistCompletados[idKey];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleChecklist(idKey)}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-black/5 cursor-pointer text-xs transition-colors"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#29008e] shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-[#888888] shrink-0 mt-0.5" />
                          )}
                          <span className={isChecked ? 'line-through text-[#888888]' : 'text-[#111111] font-medium'}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Tecnología y Soporte */}
                <div className="card-light p-5 rounded-2xl border border-black/5 space-y-3">
                  <div className="font-bold text-xs text-[#640354] uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#640354]" />
                    3. Tecnología, Conectividad & Audio
                  </div>
                  <div className="space-y-2">
                    {contenidoKit.insumosLogistica.tecnologiaYSoporte.map((item, idx) => {
                      const idKey = `tec_${idx}`;
                      const isChecked = !!checklistCompletados[idKey];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleChecklist(idKey)}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-black/5 cursor-pointer text-xs transition-colors"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#29008e] shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-[#888888] shrink-0 mt-0.5" />
                          )}
                          <span className={isChecked ? 'line-through text-[#888888]' : 'text-[#111111] font-medium'}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Reconocimientos y Merchandising */}
                <div className="card-light p-5 rounded-2xl border border-black/5 space-y-3">
                  <div className="font-bold text-xs text-amber-700 uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-600" />
                    4. Reconocimientos & Merchandising
                  </div>
                  <div className="space-y-2">
                    {contenidoKit.insumosLogistica.reconocimientosYMerchandising.map((item, idx) => {
                      const idKey = `rec_${idx}`;
                      const isChecked = !!checklistCompletados[idKey];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleChecklist(idKey)}
                          className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-black/5 cursor-pointer text-xs transition-colors"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#29008e] shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-[#888888] shrink-0 mt-0.5" />
                          )}
                          <span className={isChecked ? 'line-through text-[#888888]' : 'text-[#111111] font-medium'}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PESTAÑA 3: EDITOR RÁPIDO EN VIVO                               */}
          {/* ============================================================== */}
          {pestanaActiva === 'editor_rapido' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
                <div>
                  <h3 className="font-bold text-base text-[#111111] flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-[#640354]" />
                    Editor Rápido de Textos Publicitarios
                  </h3>
                  <p className="text-xs text-[#555555] mt-0.5">
                    Modifica en pantalla los copys, fechas y patrocinadores antes de imprimir o exportar.
                  </p>
                </div>

                <button
                  onClick={handleGenerateAIContent}
                  className="btn-secondary-light px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#29008e]" />
                  Restablecer a Propuesta IA
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Título Principal */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111] uppercase tracking-wider block">
                    Título Principal del Evento
                  </label>
                  <input
                    type="text"
                    value={contenidoKit.cartelA4.tituloPrincipal}
                    onChange={(e) =>
                      setContenidoKit({
                        ...contenidoKit,
                        nombreEvento: e.target.value,
                        cartelA4: { ...contenidoKit.cartelA4, tituloPrincipal: e.target.value }
                      })
                    }
                    className="input-develop w-full text-xs font-medium"
                  />
                </div>

                {/* Subtítulo */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111] uppercase tracking-wider block">
                    Subtítulo / Eje Temático
                  </label>
                  <input
                    type="text"
                    value={contenidoKit.cartelA4.subtitulo}
                    onChange={(e) =>
                      setContenidoKit({
                        ...contenidoKit,
                        cartelA4: { ...contenidoKit.cartelA4, subtitulo: e.target.value }
                      })
                    }
                    className="input-develop w-full text-xs font-medium"
                  />
                </div>

                {/* Fecha y Lugar */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111] uppercase tracking-wider block">
                    Fecha, Horario y Lugar Específico
                  </label>
                  <input
                    type="text"
                    value={contenidoKit.cartelA4.fechaHoraLugar}
                    onChange={(e) =>
                      setContenidoKit({
                        ...contenidoKit,
                        fechaEvento: e.target.value,
                        cartelA4: { ...contenidoKit.cartelA4, fechaHoraLugar: e.target.value }
                      })
                    }
                    className="input-develop w-full text-xs font-medium"
                  />
                </div>

                {/* Marcas Aliadas */}
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111] uppercase tracking-wider block">
                    Marcas Aliadas / Sponsors (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={contenidoKit.marcasAliadas.join(', ')}
                    onChange={(e) => {
                      const arrayMarcas = e.target.value.split(',').map((m) => m.trim()).filter(Boolean);
                      setContenidoKit({
                        ...contenidoKit,
                        marcasAliadas: arrayMarcas,
                        cartelA4: { ...contenidoKit.cartelA4, marcasAliadas: arrayMarcas }
                      });
                    }}
                    className="input-develop w-full text-xs font-medium"
                  />
                </div>

                {/* Llamado a la Acción (CTA) */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="font-bold text-[#111111] uppercase tracking-wider block">
                    Instrucción del Llamado a la Acción (CTA junto al QR)
                  </label>
                  <input
                    type="text"
                    value={contenidoKit.cartelA4.llamadoAccion}
                    onChange={(e) =>
                      setContenidoKit({
                        ...contenidoKit,
                        cartelA4: { ...contenidoKit.cartelA4, llamadoAccion: e.target.value }
                      })
                    }
                    className="input-develop w-full text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* PESTAÑA 4: GUION DEL PONENTE / MC CON CRONÓMETRO               */}
          {/* ============================================================== */}
          {pestanaActiva === 'guion_cronometro' && (
            <div className="space-y-6">
              {/* Barra Superior con Cronómetro Integrado */}
              <div className="card-light p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#0f094f]/10 shadow-xs">
                <div>
                  <h3 className="font-bold text-base text-[#111111] flex items-center gap-2">
                    <Presentation className="w-5 h-5 text-[#0f094f]" />
                    Guion Estructurado del Ponente / Maestro de Ceremonias
                  </h3>
                  <p className="text-xs text-[#555555] mt-0.5">
                    Estructura probada con tiempos para maximizar la conversión y el interés estudiantil.
                  </p>
                </div>

                {/* Cronómetro Interactivo */}
                <div className="flex items-center gap-3 bg-[#F8F8FC] px-4 py-2 rounded-xl border border-black/5">
                  <Clock className="w-4 h-4 text-[#29008e]" />
                  <span className="font-mono font-black text-base text-[#111111]">
                    {formatearTiempoCronometro(cronometroSegundos)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCronometroActivo(!cronometroActivo)}
                      className={`p-1.5 rounded-lg text-white font-bold text-xs ${
                        cronometroActivo ? 'bg-amber-600' : 'bg-emerald-600'
                      }`}
                      title={cronometroActivo ? 'Pausar cronómetro' : 'Iniciar cronómetro'}
                    >
                      {cronometroActivo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => {
                        setCronometroActivo(false);
                        setCronometroSegundos(0);
                      }}
                      className="p-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-[#555555]"
                      title="Reiniciar cronómetro"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenido del Guion según tipo de evento */}
              {activeDeal.eventType === 'conferencia_taller' && (
                <div className="space-y-4">
                  {contenidoKit.guionPonente.map((seccion, i) => (
                    <div key={i} className="card-light p-5 rounded-2xl border border-black/5 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-black/5">
                        <span className="font-bold text-sm text-[#0f094f]">{seccion.fase}</span>
                        <span className="text-xs font-bold px-2.5 py-0.5 bg-[#29008e]/10 text-[#29008e] rounded-full">
                          ~{seccion.minutosSugeridos} minutos
                        </span>
                      </div>

                      <div className="text-xs text-[#555555]">
                        <strong className="text-[#111111]">Objetivo de la fase:</strong> {seccion.objetivo}
                      </div>

                      <div className="bg-[#F8F8FC] p-3.5 rounded-xl border border-black/5 text-xs space-y-1.5">
                        <strong className="text-[#0f094f] block">Diálogo Sugerido:</strong>
                        <p className="italic text-[#222222] leading-relaxed">{seccion.dialogoSugerido}</p>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-[11px] uppercase font-bold text-[#888888] tracking-wider">
                          Puntos Clave a Remarcar:
                        </strong>
                        <ul className="space-y-1 text-xs text-[#444444]">
                          {seccion.puntosClave.map((punto, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-1.5">
                              <span className="text-[#29008e] font-bold">•</span>
                              <span>{punto}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* En caso de Hackathon: Retos y Rúbricas */}
              {activeDeal.eventType === 'hackathon' && (
                <div className="space-y-6">
                  {/* Retos Técnicos */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-[#111111] flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      3 Retos Técnicos Formulados con Marcas Aliadas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {contenidoKit.retosHackathon?.map((reto) => (
                        <div key={reto.numero} className="card-light p-4 rounded-2xl border border-black/5 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0f094f] text-white rounded">
                              RETO #{reto.numero}
                            </span>
                            <span className="font-bold text-[#29008e]">{reto.marcaPatrocinadora}</span>
                          </div>
                          <div className="font-extrabold text-sm text-[#111111]">{reto.tituloReto}</div>
                          <p className="text-[#555555] text-[11px] leading-relaxed">{reto.problematica}</p>
                          <div className="pt-2 border-t border-black/5 text-[10px] text-[#29008e] font-bold">
                            Criterio Clave: {reto.criterioClave}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tabla de Rúbricas */}
                  <div className="card-light p-5 rounded-2xl border border-black/5 space-y-3">
                    <h4 className="font-bold text-sm text-[#111111] flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-[#29008e]" />
                      Rúbrica Oficial de Evaluación Técnica
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#F8F8FC] text-[#555555] uppercase text-[10px]">
                          <tr>
                            <th className="p-2.5 rounded-l-lg">Criterio de Evaluación</th>
                            <th className="p-2.5">Ponderación</th>
                            <th className="p-2.5 rounded-r-lg">Descripción Técnica</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {contenidoKit.rubricasHackathon?.map((rubrica, rIdx) => (
                            <tr key={rIdx} className="hover:bg-black/5">
                              <td className="p-2.5 font-bold text-[#111111]">{rubrica.criterio}</td>
                              <td className="p-2.5 font-black text-[#29008e]">{rubrica.porcentaje}%</td>
                              <td className="p-2.5 text-[#555555]">{rubrica.descripcion}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* En caso de Feria de Empleo: Copys Multicanal */}
              {activeDeal.eventType === 'feria_trabajo' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-[#111111] flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-[#29008e]" />
                    Copys Multicanal Listos para Redes Sociales
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Instagram */}
                    <div className="card-light p-4 rounded-2xl border border-black/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#0f094f]">Instagram Stories (9:16)</strong>
                        <button
                          onClick={() => handleCopiarTexto(contenidoKit.copysRedes.instagramStories, 'insta')}
                          className="text-[11px] text-[#29008e] font-bold flex items-center gap-1 hover:underline"
                        >
                          {textoCopiadoKey === 'insta' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copiar
                        </button>
                      </div>
                      <p className="text-[11px] text-[#555555] bg-[#F8F8FC] p-3 rounded-xl border border-black/5 font-mono">
                        {contenidoKit.copysRedes.instagramStories}
                      </p>
                    </div>

                    {/* TikTok */}
                    <div className="card-light p-4 rounded-2xl border border-black/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#0f094f]">TikTok (Hook Rápido)</strong>
                        <button
                          onClick={() => handleCopiarTexto(contenidoKit.copysRedes.tikTok, 'tiktok')}
                          className="text-[11px] text-[#29008e] font-bold flex items-center gap-1 hover:underline"
                        >
                          {textoCopiadoKey === 'tiktok' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copiar
                        </button>
                      </div>
                      <p className="text-[11px] text-[#555555] bg-[#F8F8FC] p-3 rounded-xl border border-black/5 font-mono">
                        {contenidoKit.copysRedes.tikTok}
                      </p>
                    </div>

                    {/* Meta / WhatsApp */}
                    <div className="card-light p-4 rounded-2xl border border-black/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#0f094f]">WhatsApp Grupos & Meta</strong>
                        <button
                          onClick={() => handleCopiarTexto(contenidoKit.copysRedes.metaFacebookWhatsapp, 'meta')}
                          className="text-[11px] text-[#29008e] font-bold flex items-center gap-1 hover:underline"
                        >
                          {textoCopiadoKey === 'meta' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copiar
                        </button>
                      </div>
                      <p className="text-[11px] text-[#555555] bg-[#F8F8FC] p-3 rounded-xl border border-black/5 font-mono whitespace-pre-line">
                        {contenidoKit.copysRedes.metaFacebookWhatsapp}
                      </p>
                    </div>

                    {/* LinkedIn */}
                    <div className="card-light p-4 rounded-2xl border border-black/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#0f094f]">LinkedIn Institucional</strong>
                        <button
                          onClick={() => handleCopiarTexto(contenidoKit.copysRedes.linkedIn, 'linkedin')}
                          className="text-[11px] text-[#29008e] font-bold flex items-center gap-1 hover:underline"
                        >
                          {textoCopiadoKey === 'linkedin' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          Copiar
                        </button>
                      </div>
                      <p className="text-[11px] text-[#555555] bg-[#F8F8FC] p-3 rounded-xl border border-black/5 font-mono whitespace-pre-line">
                        {contenidoKit.copysRedes.linkedIn}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* PESTAÑA 5: ZONA QR EN VIVO & STAND                             */}
          {/* ============================================================== */}
          {pestanaActiva === 'qr_en_vivo' && (
            <div className="space-y-7">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Columna Izquierda: QR Gigante para proyección */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0f094f]/5 to-[#29008e]/5 rounded-3xl border border-[#0f094f]/10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f094f] text-white text-[10px] font-bold uppercase mb-4 shadow-xs">
                    <QrCode className="w-3.5 h-3.5 text-[#a78bfa]" />
                    Modo Proyección & Mampara Oficial
                  </div>

                  <GeneradorQrVectorial
                    oportunidadId={activeDeal.id}
                    nombreEvento={contenidoKit.nombreEvento}
                    nombreInstitucion={company.name}
                    tamano={260}
                    mostrarBotonesDescarga={true}
                    mostrarEnlace={true}
                    etiquetaInstruccion="Apunta la cámara de tu teléfono móvil para abrir el formulario oficial de registro en Stand"
                  />
                </div>

                {/* Columna Derecha: Contador en Vivo y Simulador en Stand */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Tarjeta de Métricas en Vivo */}
                  <div className="card-light p-5 rounded-2xl border border-black/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#888888] tracking-wider">
                        Alumnos Registrados en Stand:
                      </div>
                      <div className="text-3xl font-black text-[#0f094f] mt-1">
                        {activeDeal.registeredLeadsCount || 0}{' '}
                        <span className="text-xs font-semibold text-[#555555]">leads captados</span>
                      </div>
                    </div>

                    <a
                      href={`/?vista=registro-alumno-qr&dealId=${activeDeal.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary-develop px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#a78bfa]" />
                      Abrir Formulario Móvil
                    </a>
                  </div>

                  {/* Simulador Rápido de Registro */}
                  <div className="card-light p-5 rounded-2xl border border-black/5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-black/5">
                      <h4 className="font-bold text-xs text-[#111111] uppercase tracking-wider">
                        Simulador de Captura Rápida en Stand
                      </h4>
                      <span className="text-[10px] text-[#888888]">Prueba local</span>
                    </div>

                    {registrationSuccess ? (
                      <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>¡Alumno registrado exitosamente en la oportunidad del pipeline!</span>
                      </div>
                    ) : (
                      <form onSubmit={handleTestStudentSubmit} className="space-y-3 text-xs">
                        <div>
                          <label className="font-semibold text-[#555555] block mb-1">Nombre Completo:</label>
                          <input
                            type="text"
                            required
                            value={testStudentName}
                            onChange={(e) => setTestStudentName(e.target.value)}
                            placeholder="Ej. Rodrigo Mendoza Soto"
                            className="input-develop w-full text-xs"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-[#555555] block mb-1">Correo Institucional:</label>
                            <input
                              type="email"
                              required
                              value={testStudentEmail}
                              onChange={(e) => setTestStudentEmail(e.target.value)}
                              placeholder="alumno@universidad.edu.mx"
                              className="input-develop w-full text-xs"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-[#555555] block mb-1">Carrera:</label>
                            <input
                              type="text"
                              required
                              value={testStudentCareer}
                              onChange={(e) => setTestStudentCareer(e.target.value)}
                              className="input-develop w-full text-xs"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn-primary-develop w-full py-2.5 text-xs font-bold rounded-xl mt-2"
                        >
                          Simular Escaneo y Registro (+1 Lead)
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
