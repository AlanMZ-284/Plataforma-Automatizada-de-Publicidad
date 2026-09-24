import React, { useState } from 'react';
import { Company, PluriProgram, ProjectModality } from '../../types';
import { 
  FileText, 
  Printer, 
  Send, 
  CheckCircle, 
  Building2, 
  Briefcase,
  Layers,
  Flag,
  Award,
  Package,
  QrCode,
  Sparkles
} from 'lucide-react';

interface CommercialKitViewProps {
  companies: Company[];
  onLogProposalSent?: (companyId: string, amount: number, packageName: string) => void;
}

// Configuración de Kits por Tipo de Evento alineada con el modelo Develop
const EVENT_KITS_CONFIG = [
  {
    id: 'kit-feria',
    eventType: 'Feria de Empleabilidad & Talento',
    name: 'Kit Feria de Empleabilidad & Vinculación',
    tagline: 'Presencia física con stand modular, folletos de residencias y registro QR de aspirantes',
    basePrice: 45000,
    deliverables: [
      'Estructura de Stand modular con branding oficial de Develop',
      'Roll-up Banners retráctiles (85x200cm) con convocatoria de residencias profesionales',
      'Lote de 500 folletos trípticos editoriales para estudiantes de semestres terminales',
      'Formulario digital con código QR para captura directa de leads al CRM de Develop',
      'Catálogo de áreas de desarrollo participantes (Cloud, IA, Fullstack, Automatización)'
    ],
    itemsList: ['Stand Físico', '2 Roll-up Banners', '500 Folletos Trípticos', 'QR Captura Leads', 'Áreas Participantes']
  },
  {
    id: 'kit-hackathon',
    eventType: 'Hackathon Tecnológico Universitario',
    name: 'Kit Hackathon de Innovación & Retos Técnicos',
    tagline: 'Desafíos de desarrollo de software con mentores senior y marcas aliadas patrocinadoras',
    basePrice: 95000,
    deliverables: [
      'Definición de 3 Retos Técnicos formulados por marcas aliadas tecnológicas',
      'Bolsa de premios y reconocimientos oficiales para los equipos ganadores',
      'Acompañamiento de 4 mentores senior de Develop y marcas patrocinadoras',
      'Kit de bienvenida para 150 participantes (stickers, credenciales, playeras, libretas)',
      'Branding compartido de marcas aliadas (AWS, Microsoft, Google Cloud, Cisco)'
    ],
    itemsList: ['3 Retos Técnicos', 'Premios Oficiales', '4 Mentores Senior', 'Kit Bienvenida (150)', 'Branding Marcas Aliadas']
  },
  {
    id: 'kit-conferencia',
    eventType: 'Conferencia Magistral / Taller',
    name: 'Kit Conferencia Magistral & Taller de Empleabilidad',
    tagline: 'Charla técnica de alto impacto para auditorios universitarios y facultades',
    basePrice: 30000,
    deliverables: [
      'Deck de diapositivas en alta resolución sobre IA, Modalidad Dual y Carrera Profesional',
      'Guion del ponente especializado adaptado a los planes de estudio de la facultad',
      'Piezas gráficas para difusión previa en canales institucionales de la universidad',
      'Material digital de seguimiento descargable para los estudiantes asistentes',
      'Reporte de asistencia e interés en residencias entregado a la dirección de carrera'
    ],
    itemsList: ['Presentación HD', 'Guion del Ponente', 'Kit Difusión Redes', 'Material Seguimiento', 'Reporte Asistencia']
  }
];

export const CommercialKitView: React.FC<CommercialKitViewProps> = ({
  companies,
  onLogProposalSent
}) => {
  const [selectedProgram] = useState<PluriProgram>('Develop Talent Program');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(companies[0]?.id || '');
  const [selectedKitId, setSelectedKitId] = useState<string>('kit-feria');
  const [selectedModality, setSelectedModality] = useState<ProjectModality>('modalidad_a_programa');
  const [selectedBrand, setSelectedBrand] = useState<string>('AWS');
  const [proposalSentSuccess, setProposalSentSuccess] = useState<boolean>(false);

  const selectedSchool = companies.find((s) => s.id === selectedSchoolId) || companies[0];
  const selectedKit = EVENT_KITS_CONFIG.find((k) => k.id === selectedKitId) || EVENT_KITS_CONFIG[0];

  const handleSendProposal = () => {
    if (onLogProposalSent) {
      onLogProposalSent(
        selectedSchool.id,
        selectedKit.basePrice,
        `${selectedKit.name} (${selectedModality === 'modalidad_a_programa' ? 'Mod. A' : 'Mod. B'}) - ${selectedBrand}`
      );
    }
    setProposalSentSuccess(true);
    setTimeout(() => {
      setProposalSentSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-7">
      {/* HEADER HERO ESTÁTICO DEVELOP */}
      <div className="internal-hero-surface rounded-[28px] p-7 lg:p-8 shadow-develop-modal border border-white/10 text-white relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 pill-dark text-xs font-bold uppercase tracking-widest text-[#a78bfa]">
              <Package className="w-3.5 h-3.5" />
              Develop Enterprise · Propuestas & Vinculación Institucional
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Kit Comercial & <span className="gradient-text">Propuesta de Vinculación</span>
            </h1>
            <p className="text-white/70 text-xs lg:text-sm leading-relaxed">
              Configura el paquete de materiales físicos, digitales y logística para cada actividad: 
              <strong> Ferias de empleo, Hackathons de innovación y Conferencias magistrales</strong>, con convenios de patrocinio tecnológico y modalidades A/B.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="btn-outline-dark inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </button>
            <button
              onClick={handleSendProposal}
              className="btn-primary-dark inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold shadow-develop-glow"
            >
              <Send className="w-4 h-4 text-[#29008e]" />
              Enviar a Vinculación
            </button>
          </div>
        </div>
      </div>

      {proposalSentSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            ¡Kit comercial y propuesta oficial enviados a <strong>{selectedSchool.directorName}</strong> ({selectedSchool.email})! La oportunidad ha sido actualizada en el pipeline de ventas.
          </span>
        </div>
      )}

      {/* CONTROLES DE CONFIGURACIÓN DEL KIT COMERCIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Selector de Opciones (4 Columnas) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card-light p-6 rounded-[24px] space-y-5 text-xs">
            <h3 className="font-bold text-[#111111] flex items-center gap-2 text-base pb-3 border-b border-black/5">
              <Briefcase className="w-4 h-4 text-[#0f094f]" />
              Configuración de Paquete
            </h3>

            {/* Selector de Universidad Destino */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#111111] uppercase tracking-wider text-[11px] block">
                Universidad / Sede Destino
              </label>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="input-develop w-full text-xs font-medium text-[#111111]"
              >
                {companies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Tipo de Kit / Evento */}
            <div className="space-y-2">
              <label className="font-bold text-[#111111] uppercase tracking-wider text-[11px] block">
                Formato de Evento & Kit
              </label>
              <div className="space-y-2">
                {EVENT_KITS_CONFIG.map((kit) => (
                  <div
                    key={kit.id}
                    onClick={() => setSelectedKitId(kit.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      selectedKitId === kit.id
                        ? 'bg-white border-[#29008e] shadow-develop-card ring-1 ring-[#29008e]'
                        : 'bg-white/60 border-black/5 hover:border-black/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111111] text-xs">{kit.name}</span>
                      <span className="text-[11px] font-black text-[#0f094f]">
                        ${kit.basePrice.toLocaleString('es-MX')}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#555555] mt-1 leading-snug">{kit.tagline}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selector de Modalidad de Proyecto */}
            <div className="space-y-2 pt-3 border-t border-black/5">
              <label className="font-bold text-[#111111] flex items-center justify-between uppercase tracking-wider text-[11px]">
                <span>Modalidad</span>
                <span className="text-[#0f094f] font-bold">
                  {selectedModality === 'modalidad_a_programa' ? 'Modalidad A' : 'Modalidad B'}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedModality('modalidad_a_programa')}
                  className={`p-2.5 rounded-xl font-bold transition-all border text-left text-xs ${
                    selectedModality === 'modalidad_a_programa'
                      ? 'btn-primary-develop'
                      : 'btn-secondary-light'
                  }`}
                >
                  <div>Mod. A (Programa)</div>
                  <span className="text-[10px] font-normal opacity-80 block mt-0.5">Estudiante ↔ Develop</span>
                </button>

                <button
                  onClick={() => setSelectedModality('modalidad_b_escuela')}
                  className={`p-2.5 rounded-xl font-bold transition-all border text-left text-xs ${
                    selectedModality === 'modalidad_b_escuela'
                      ? 'btn-primary-develop'
                      : 'btn-secondary-light'
                  }`}
                >
                  <div>Mod. B (Alojado)</div>
                  <span className="text-[10px] font-normal opacity-80 block mt-0.5">Sede Universitaria</span>
                </button>
              </div>
            </div>

            {/* Selector de Marca Aliada Sponsor */}
            <div className="space-y-2 pt-3 border-t border-black/5">
              <label className="font-bold text-[#111111] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Flag className="w-3.5 h-3.5 text-[#29008e]" />
                Sponsor Tecnológico Aliado
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['AWS', 'Microsoft', 'Google Cloud', 'Cisco'].map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      selectedBrand === brand
                        ? 'bg-[#0f094f]/10 border-[#0f094f] text-[#0f094f] font-bold'
                        : 'btn-secondary-light'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Vista Previa Editorial de la Propuesta Formal (8 Columnas) */}
        <div className="lg:col-span-8 bg-white rounded-[28px] border border-black/10 shadow-develop-modal p-8 sm:p-10 text-left space-y-6 print:m-0 print:p-0 print:border-none print:shadow-none">
          {/* Membrete Oficial Develop */}
          <div className="flex items-start justify-between border-b-2 border-[#0f094f] pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0f094f] via-[#29008e] to-[#640354] text-white flex items-center justify-center font-black text-lg shadow-develop-box">
                D
              </div>
              <div>
                <div className="font-black text-xl text-[#0f094f] tracking-tight">
                  Develop Enterprise Ecosystem
                </div>
                <p className="text-xs text-[#555555] font-medium">
                  Dirección de Vinculación Universitaria • Alianza Estratégica con <strong>{selectedBrand}</strong>
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-[#111111] uppercase tracking-wider">Propuesta Institucional</div>
              <div className="text-[#888888] font-mono mt-0.5">DEV-{selectedKitId.toUpperCase()}-{Date.now().toString().slice(-5)}</div>
              <div className="text-[#555555] mt-0.5">{new Date().toLocaleDateString('es-MX')}</div>
            </div>
          </div>

          {/* Ficha de la Universidad y Modalidad */}
          <div className="grid grid-cols-2 gap-4 bg-[#F8F8FC] p-5 rounded-2xl border border-black/5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#888888] tracking-wider block">Institución Destino:</span>
              <div className="font-bold text-[#111111] text-sm mt-1">{selectedSchool.name}</div>
              <div className="text-[#555555] font-medium mt-0.5">Titular: {selectedSchool.directorName}</div>
              <div className="text-[#888888] text-[11px]">{selectedSchool.address}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#888888] tracking-wider block">Acuerdo & Sponsor:</span>
              <div className="font-semibold text-[#111111] mt-1">
                {selectedModality === 'modalidad_a_programa' 
                  ? 'Modalidad A: Programa de Formación e Inserción Develop' 
                  : 'Modalidad B: Proyecto Alojado en la Universidad'}
              </div>
              <div className="text-[#555555] mt-0.5">Patrocinio Tecnológico: <strong>{selectedBrand}</strong></div>
              <div className="text-[#888888] text-[11px]">{selectedSchool.municipality}, {selectedSchool.state}</div>
            </div>
          </div>

          {/* Desglose del Kit de Materiales */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold uppercase text-[#111111] tracking-wider text-xs flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0f094f]" />
                Entregables y Componentes del Paquete ({selectedKit.eventType})
              </h4>
              <span className="chip-skill text-[10px] px-2.5 py-0.5">
                Kit Oficial Develop
              </span>
            </div>
            <p className="text-[#555555] leading-relaxed">
              El siguiente paquete de elementos físicos, digitales y acompañamiento técnico será coordinado por Develop y desplegado en las instalaciones de <strong>{selectedSchool.name}</strong> para la realización de la actividad:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {selectedKit.deliverables.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-[#F8F8FC] p-3 rounded-xl border border-black/5">
                  <CheckCircle className="w-4 h-4 text-[#0f094f] shrink-0 mt-0.5" />
                  <span className="text-[#111111] font-medium leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla de Inversión y Presupuesto */}
          <div className="border border-black/10 rounded-2xl overflow-hidden text-xs shadow-xs">
            <table className="w-full">
              <thead className="bg-[#0f094f] text-white">
                <tr>
                  <th className="p-3.5 text-left font-bold">Concepto Institucional</th>
                  <th className="p-3.5 text-center font-bold">Tipo Evento</th>
                  <th className="p-3.5 text-center font-bold">Sponsor</th>
                  <th className="p-3.5 text-right font-bold">Presupuesto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                <tr>
                  <td className="p-4 font-semibold text-[#111111]">
                    {selectedKit.name}
                    <span className="block text-[11px] text-[#888888] font-normal mt-0.5">
                      Incluye montaje de infraestructura, producción de piezas y software de registro QR
                    </span>
                  </td>
                  <td className="p-4 text-center font-medium text-[#555555]">
                    {selectedKit.eventType.split('/')[0]}
                  </td>
                  <td className="p-4 text-center font-bold text-[#29008e]">
                    {selectedBrand}
                  </td>
                  <td className="p-4 text-right font-black text-[#111111] text-sm">
                    ${selectedKit.basePrice.toLocaleString('es-MX')} MXN
                  </td>
                </tr>

                <tr className="bg-[#F8F8FC] font-black text-sm">
                  <td colSpan={3} className="p-4 text-right text-[#111111]">
                    PRESUPUESTO TOTAL ACORDADO:
                  </td>
                  <td className="p-4 text-right text-[#0f094f] text-base">
                    ${selectedKit.basePrice.toLocaleString('es-MX')} MXN
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Condiciones y Firmas */}
          <div className="pt-4 border-t border-black/10 grid grid-cols-2 gap-8 text-xs text-[#555555]">
            <div>
              <div className="font-bold text-[#111111] mb-1.5">Términos de Ejecución:</div>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Entrega y montaje de materiales 24 horas antes del inicio del evento.</li>
                <li>Los datos recabados en los formularios QR se sincronizan directo al CRM de Develop.</li>
                <li>Acompañamiento de mentores y logística presencial garantizado por Develop.</li>
              </ul>
            </div>

            <div className="text-center pt-8 border-t border-black/15">
              <div className="font-bold text-[#111111] text-xs">Lic. Carlos Mendoza</div>
              <div className="text-[11px] text-[#555555]">Dirección de Vinculación & Alianzas · Develop</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
