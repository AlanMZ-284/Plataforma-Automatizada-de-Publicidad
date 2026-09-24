import React, { useState } from 'react';
import { Campaign, CollateralItem, CollateralType, Company } from '../../types';
import { 
  Megaphone, 
  Sparkles, 
  Printer, 
  Layout, 
  Smartphone, 
  FileText, 
  Image as ImageIcon, 
  Palette, 
  Check, 
  Plus, 
  DollarSign, 
  Target, 
  Edit3, 
  GraduationCap,
  X
} from 'lucide-react';

interface CampaignAndCollateralGeneratorProps {
  campaigns: Campaign[];
  companies: Company[];
  onAddCampaign: (campaign: Campaign) => void;
}

const COLOR_PALETTES = [
  { name: 'Develop Blue & Glow', theme: '#0f094f', secondary: '#a78bfa' },
  { name: 'Develop Violet Tech', theme: '#29008e', secondary: '#f472b6' },
  { name: 'Develop Plum Elegance', theme: '#640354', secondary: '#f472b6' },
  { name: 'Develop Hero Deep', theme: '#07052e', secondary: '#a78bfa' },
];

export const CampaignAndCollateralGenerator: React.FC<CampaignAndCollateralGeneratorProps> = ({
  campaigns,
  companies,
  onAddCampaign
}) => {
  const [activeCampaignId, setActiveCampaignId] = useState<string>(campaigns[0]?.id || '');
  const [activeTab, setActiveTab] = useState<CollateralType>('folleto');
  
  // Asistente nueva campaña
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newProgramName, setNewProgramName] = useState('Develop Talent Program');
  const [newCompanyId, setNewCompanyId] = useState(companies[0]?.id || '');
  const [newObjective, setNewObjective] = useState('Aceptación de Alumnos para Estadías & Residencias');
  const [newBudget, setNewBudget] = useState('140000');

  // Campaña actual
  const currentCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];
  const currentSchool = companies.find((s) => s.id === currentCampaign?.companyId);

  // Material seleccionado
  const currentCollateral = currentCampaign?.collaterals.find((c) => c.type === activeTab);

  // Estados editables en tiempo real para el material activo
  const [headline, setHeadline] = useState<string>(currentCollateral?.headline || 'Convocatoria Oficial Estadías 2026');
  const [subheadline, setSubheadline] = useState<string>(currentCollateral?.subheadline || 'Develop abre recepción de alumnos universitarios.');
  const [ctaText, setCtaText] = useState<string>(currentCollateral?.cta || 'Postula tu perfil universitario');
  const [themeColor, setThemeColor] = useState<string>(currentCollateral?.themeColor || '#0f094f');
  const [secondaryColor, setSecondaryColor] = useState<string>(currentCollateral?.secondaryColor || '#a78bfa');
  const [bulletPoint1, setBulletPoint1] = useState<string>(currentCollateral?.bulletPoints[0] || 'Acreditación curricular de estadías y residencias');
  const [bulletPoint2, setBulletPoint2] = useState<string>(currentCollateral?.bulletPoints[1] || 'Mentoría con líderes de ingeniería y proyectos reales');
  const [bulletPoint3, setBulletPoint3] = useState<string>(currentCollateral?.bulletPoints[2] || 'Bolsa de contratación directa al graduarte');

  // Sincronizar cuando cambia la campaña o la pestaña
  React.useEffect(() => {
    if (currentCollateral) {
      setHeadline(currentCollateral.headline);
      setSubheadline(currentCollateral.subheadline);
      setCtaText(currentCollateral.cta);
      setThemeColor(currentCollateral.themeColor);
      setSecondaryColor(currentCollateral.secondaryColor);
      setBulletPoint1(currentCollateral.bulletPoints[0] || '');
      setBulletPoint2(currentCollateral.bulletPoints[1] || '');
      setBulletPoint3(currentCollateral.bulletPoints[2] || '');
    }
  }, [activeCampaignId, activeTab]);

  // Simulación de Generación de Copys con IA para Develop
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleAIGenerateCopies = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      const universityName = currentSchool?.name || 'tu universidad';
      if (activeTab === 'historia_social') {
        setHeadline('¿Buscas dónde liberar tu residencia profesional?');
        setSubheadline(`Develop tiene plazas abiertas para alumnos de ${universityName}.`);
        setCtaText('¡Desliza y asegura tu lugar!');
        setBulletPoint1('Modalidad híbrida compatible con tus materias');
        setBulletPoint2('Proyectos reales en desarrollo, IA y cloud');
        setBulletPoint3('Contratación inmediata a los mejores talentos');
      } else if (activeTab === 'cartel') {
        setHeadline('Develop: Convocatoria Residencias & Modalidad Dual');
        setSubheadline(`Alianza estratégica entre Develop y ${universityName} para la inserción laboral.`);
        setCtaText('Escanea el QR de registro o contacta a vinculación');
        setBulletPoint1('Acreditación curricular oficial garantizada');
        setBulletPoint2('Talleres técnicos especializados y certificaciones');
        setBulletPoint3('Proyectos de titulación avalados por la industria');
      } else if (activeTab === 'banner_web') {
        setHeadline('Estadías Profesionales en Develop Ecosystem');
        setSubheadline(`Convenio activo con ${universityName}. Adquiere experiencia antes de egresar.`);
        setCtaText('Postularme Ahora');
      } else {
        setHeadline('Impulsa tu carrera tecnológica con Develop');
        setSubheadline(`Programa integral de aceptación de alumnos de ${universityName} para estadías y modalidad dual.`);
        setCtaText('Agenda tu entrevista de admisión al programa');
        setBulletPoint1('Experiencia práctica en proyectos de alta tecnología');
        setBulletPoint2('Mentoría uno a uno y retroalimentación quincenal');
        setBulletPoint3('Acceso prioritario a la bolsa de trabajo Develop');
      }
      setIsGeneratingAI(false);
    }, 600);
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;

    const school = companies.find((s) => s.id === newCompanyId);
    const universityName = school?.name || 'Universidad Asociada';

    const autoGeneratedCollaterals: CollateralItem[] = [
      {
        id: `col-folleto-${Date.now()}`,
        campaignId: `camp-${Date.now()}`,
        type: 'folleto',
        title: `Folleto ${newProgramName}: Estadías y Residencias`,
        headline: `${newProgramName}: Convocatoria de Alumnos`,
        subheadline: `Develop y ${universityName} abren la recepción de postulaciones para estadías profesionales y modalidad dual.`,
        bulletPoints: [
          'Acreditación curricular oficial de estadías y residencias',
          'Proyectos reales de tecnología, desarrollo e inteligencia artificial',
          'Posibilidad de contratación directa al concluir'
        ],
        cta: 'Postula tu perfil universitario hoy mismo',
        themeColor: '#0f094f',
        secondaryColor: '#a78bfa',
        institutionName: `${newProgramName} • Develop`,
        phoneContact: '55 5343 0000',
        website: 'develop.com/talento',
        badgeText: 'Aceptación de Alumnos Universitarios'
      },
      {
        id: `col-story-${Date.now()}`,
        campaignId: `camp-${Date.now()}`,
        type: 'historia_social',
        title: 'Plantilla de Historia (9:16 Convocatoria)',
        headline: '¿Listo para tu estadía o residencia profesional?',
        subheadline: `Únete al programa de talento de Develop y adquiere experiencia de primer nivel.`,
        bulletPoints: [
          'Horarios flexibles',
          'Mentoría con expertos senior',
          'Certificado oficial de residencia'
        ],
        cta: 'Desliza para registrar tu CV',
        themeColor: '#29008e',
        secondaryColor: '#f472b6',
        institutionName: `${newProgramName} | Develop`,
        phoneContact: '55 5343 0000',
        website: 'develop.com/talento',
        badgeText: '¡Plazas Limitadas!'
      },
      {
        id: `col-cartel-${Date.now()}`,
        campaignId: `camp-${Date.now()}`,
        type: 'cartel',
        title: 'Cartel Universitario para Mamparas de Facultad',
        headline: `${newProgramName}: Residencias & Modalidad Dual`,
        subheadline: `Convocatoria abierta para estudiantes de semestres terminales en ${universityName}.`,
        bulletPoints: [
          'Áreas: Desarrollo de Software, IA, Cloud y Ciberseguridad',
          'Convenio institucional avalado por vinculación',
          'Proyectos de alto impacto con valor curricular'
        ],
        cta: 'Escanea el código QR para postularte',
        themeColor: '#0f094f',
        secondaryColor: '#a78bfa',
        institutionName: `${newProgramName} • Develop`,
        phoneContact: '55 5343 0000',
        website: 'develop.com/convocatoria',
        badgeText: 'Convocatoria Abierta'
      },
      {
        id: `col-banner-${Date.now()}`,
        campaignId: `camp-${Date.now()}`,
        type: 'banner_web',
        title: 'Banner Intranet & Bolsa Universitaria (16:9)',
        headline: `Realiza tu residencia en ${newProgramName}`,
        subheadline: `Develop abre espacios exclusivos para alumnos de ${universityName}.`,
        bulletPoints: ['Modalidad Dual', 'Estadías Curriculares'],
        cta: 'Ver Convocatoria',
        themeColor: '#07052e',
        secondaryColor: '#f472b6',
        institutionName: `${newProgramName} por Develop`,
        phoneContact: '55 5343 0000',
        website: 'develop.com',
        badgeText: 'Ciclo 2026'
      }
    ];

    const newCampaign: Campaign = {
      id: `camp-${Date.now()}`,
      name: newCampName,
      companyId: newCompanyId,
      objective: newObjective,
      budgetTotal: parseFloat(newBudget) || 120000,
      budgetSpent: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
      targetAudience: `Estudiantes universitarios en ${universityName} y zona metropolitana`,
      status: 'activa',
      eventType: 'hackathon',
      projectModality: 'modalidad_a_programa',
      alliedBrands: ['AWS', 'Microsoft'],
      metrics: {
        impressions: 0,
        clicks: 0,
        ctr: 0,
        leadsGenerated: 0,
        roi: '0.0x'
      },
      collaterals: autoGeneratedCollaterals
    };

    onAddCampaign(newCampaign);
    setActiveCampaignId(newCampaign.id);
    setIsCreatingCampaign(false);
    setNewCampName('');
  };

  return (
    <div className="space-y-7">
      {/* HEADER HERO ESTÁTICO DEVELOP */}
      <div className="internal-hero-surface rounded-[28px] p-7 lg:p-8 shadow-develop-modal border border-white/10 text-white relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 pill-dark text-xs font-bold uppercase tracking-widest text-[#a78bfa]">
              <Megaphone className="w-3.5 h-3.5" />
              Develop Enterprise · Campañas & Suite Publicitaria
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Generador de Campañas & <span className="gradient-text">Piezas Publicitarias</span>
            </h1>
            <p className="text-white/70 text-xs lg:text-sm leading-relaxed">
              Configura campañas de difusión institucional y el sistema compilará automáticamente las piezas en todos los formatos requeridos: 
              <strong> folletos trípticos, historias 9:16, carteles de facultad y banners de intranet</strong>.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingCampaign(true)}
            className="btn-primary-dark inline-flex items-center gap-2 px-5 py-3 text-xs font-bold shadow-develop-glow shrink-0 self-start lg:self-auto"
          >
            <Plus className="w-4 h-4 text-[#29008e]" />
            Nueva Campaña
          </button>
        </div>
      </div>

      {/* BARRA DE SELECCIÓN DE CAMPAÑA ACTIVA */}
      <div className="card-light p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase text-[#888888] tracking-wider">
            Campaña Activa:
          </span>
          <select
            value={activeCampaignId}
            onChange={(e) => setActiveCampaignId(e.target.value)}
            className="input-develop text-xs font-bold text-[#111111]"
          >
            {campaigns.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {camp.name} ({camp.status})
              </option>
            ))}
          </select>
        </div>

        {currentCampaign && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#555555]">
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#29008e]" />
              <span className="truncate max-w-[280px]">{currentCampaign.objective}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#0f094f]" />
              <span className="font-bold text-[#111111]">
                ${currentCampaign.budgetTotal.toLocaleString('es-MX')} MXN
              </span>
            </div>
            <span className="chip-skill text-[10px] px-2.5 py-0.5 uppercase">
              {currentCampaign.status}
            </span>
          </div>
        )}
      </div>

      {/* PESTAÑAS DE FORMATO DE MATERIAL PUBLICITARIO */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('folleto')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'folleto'
                ? 'btn-primary-develop'
                : 'btn-secondary-light'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Folleto de Estadías
          </button>

          <button
            onClick={() => setActiveTab('historia_social')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'historia_social'
                ? 'btn-primary-develop'
                : 'btn-secondary-light'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            2. Historia 9:16 (Móvil)
          </button>

          <button
            onClick={() => setActiveTab('cartel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'cartel'
                ? 'btn-primary-develop'
                : 'btn-secondary-light'
            }`}
          >
            <Layout className="w-4 h-4" />
            3. Cartel A4 (Mamparas)
          </button>

          <button
            onClick={() => setActiveTab('banner_web')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'banner_web'
                ? 'btn-primary-develop'
                : 'btn-secondary-light'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            4. Banner Intranet (16:9)
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAIGenerateCopies}
            disabled={isGeneratingAI}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#0f094f]/5 text-[#0f094f] hover:bg-[#0f094f]/10 border border-[#0f094f]/15 rounded-xl text-xs font-bold transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#29008e] ${isGeneratingAI ? 'animate-spin' : ''}`} />
            {isGeneratingAI ? 'Redactando con IA...' : 'Adaptar Copys con IA'}
          </button>

          <button
            onClick={() => window.print()}
            className="btn-secondary-light flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* CANALES DE DIFUSIÓN */}
      <div className="card-light p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#111111]">Canales de Difusión Conectados:</span>
          {['Meta / Instagram', 'LinkedIn Talent', 'TikTok Campus', 'Intranet Institucional'].map((channel) => (
            <span key={channel} className="px-2.5 py-1 bg-black/5 text-[#555555] font-semibold rounded-lg text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#29008e]"></span>
              {channel}
            </span>
          ))}
        </div>
        <div className="text-[11px] text-[#888888] font-medium">
          Secuencias sincronizadas con el CRM
        </div>
      </div>

      {/* GRID EDITOR VS PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Editor de Contenido (4 Columnas) */}
        <div className="lg:col-span-4 card-light p-6 rounded-[24px] space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h3 className="font-bold text-[#111111] flex items-center gap-2 text-sm">
              <Edit3 className="w-4 h-4 text-[#0f094f]" />
              Personalizar Material
            </h3>
            <span className="text-[10px] text-[#888888] uppercase font-bold tracking-wider">
              Edición en Vivo
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#111111]">Titular Principal de Convocatoria</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="input-develop w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#111111]">Subtítulo Descriptivo</label>
            <textarea
              rows={2}
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              className="input-develop w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#111111]">Llamada a la Acción (Botón CTA)</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="input-develop w-full"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#111111]">Beneficios para Alumnos / Institución</label>
            <input
              type="text"
              placeholder="Beneficio 1"
              value={bulletPoint1}
              onChange={(e) => setBulletPoint1(e.target.value)}
              className="input-develop w-full mb-1.5"
            />
            <input
              type="text"
              placeholder="Beneficio 2"
              value={bulletPoint2}
              onChange={(e) => setBulletPoint2(e.target.value)}
              className="input-develop w-full mb-1.5"
            />
            <input
              type="text"
              placeholder="Beneficio 3"
              value={bulletPoint3}
              onChange={(e) => setBulletPoint3(e.target.value)}
              className="input-develop w-full"
            />
          </div>

          {/* Paleta de Color Institucional Develop */}
          <div className="space-y-2 pt-3 border-t border-black/5">
            <label className="font-bold text-[#111111] flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#29008e]" />
              Paleta Cromática Develop
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COLOR_PALETTES.map((pal) => (
                <button
                  key={pal.name}
                  onClick={() => {
                    setThemeColor(pal.theme);
                    setSecondaryColor(pal.secondary);
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                    themeColor === pal.theme
                      ? 'border-[#0f094f] bg-[#0f094f]/5 font-bold'
                      : 'border-black/5 hover:border-black/15 bg-white'
                  }`}
                >
                  <div className="flex -space-x-1 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: pal.theme }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white"
                      style={{ backgroundColor: pal.secondary }}
                    />
                  </div>
                  <span className="text-[10px] truncate text-[#111111]">{pal.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Previsualizador Gráfico del Material (8 Columnas) */}
        <div className="lg:col-span-8 bg-[#F8F8FC] rounded-[28px] border border-black/10 p-6 sm:p-8 flex items-center justify-center min-h-[550px] overflow-x-auto shadow-inner">
          {/* FORMATO 1: FOLLETO TRÍPTICO DE ESTADÍAS Y RESIDENCIAS */}
          {activeTab === 'folleto' && (
            <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-develop-modal border border-black/10 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-black/5">
              {/* Portada del Folleto */}
              <div
                className="p-7 md:w-5/12 text-white flex flex-col justify-between"
                style={{ backgroundColor: themeColor }}
              >
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-7 h-7 rounded-lg bg-white text-[#07052e] font-black text-xs flex items-center justify-center">
                      D
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                      Develop Talent
                    </span>
                  </div>

                  <span
                    className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2.5 text-[#07052e]"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Estadías & Residencias
                  </span>
                  <h3 className="text-xl font-extrabold leading-tight text-white">
                    {headline}
                  </h3>
                  <p className="text-xs text-white/80 mt-2 leading-relaxed">
                    {subheadline}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/20 text-xs space-y-1">
                  <div className="font-bold text-sm text-white">Alianza con: {currentSchool?.name}</div>
                  <div className="text-white/80 text-[11px]">Validación curricular para alumnos</div>
                  <div className="text-white/80 text-[11px]">develop.com/talento</div>
                </div>
              </div>

              {/* Contenido Interior del Folleto */}
              <div className="p-7 md:w-7/12 flex flex-col justify-between bg-white text-left space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase text-[#888888] tracking-wider mb-3">
                    Beneficios del Programa Develop
                  </h4>
                  <div className="space-y-3">
                    {[bulletPoint1, bulletPoint2, bulletPoint3].filter(Boolean).map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-[#555555]">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[#07052e] text-[10px] font-bold shrink-0 mt-0.5"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          ✓
                        </div>
                        <span className="font-medium leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F8F8FC] p-4 rounded-2xl border border-black/5 space-y-3">
                  <div className="text-xs font-semibold text-[#555555]">
                    Postulaciones y registro de aspirantes:
                  </div>
                  <button
                    className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-transform active:scale-95"
                    style={{ backgroundColor: themeColor }}
                  >
                    {ctaText}
                  </button>
                  <div className="text-[10px] text-center text-[#888888]">
                    Coordinación de Vinculación Develop • talento@develop.com
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORMATO 2: HISTORIA SOCIAL 9:16 */}
          {activeTab === 'historia_social' && (
            <div
              className="w-[280px] h-[520px] rounded-[36px] p-5 text-white shadow-develop-modal relative flex flex-col justify-between overflow-hidden border-8 border-[#07052e]"
              style={{
                background: `linear-gradient(180deg, ${themeColor} 0%, #07052e 100%)`
              }}
            >
              <div className="space-y-2 relative z-10">
                <div className="flex gap-1">
                  <div className="h-1 flex-1 bg-white/70 rounded-full"></div>
                  <div className="h-1 flex-1 bg-white/30 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white text-[#07052e] font-black flex items-center justify-center text-[10px]">
                      D
                    </div>
                    <div>
                      <span className="font-bold text-[11px] block leading-tight">Develop</span>
                      <span className="text-[9px] text-white/70">Talent Program</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#a78bfa] font-semibold">Convocatoria</span>
                </div>
              </div>

              <div className="space-y-3 text-center my-auto relative z-10">
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-[#07052e] shadow-md"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Estadías & Residencias 2026
                </span>
                <h2 className="text-xl font-black leading-tight tracking-tight text-white">
                  {headline}
                </h2>
                <p className="text-xs text-white/80 leading-relaxed px-2">
                  {subheadline}
                </p>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-left space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#a78bfa] shrink-0" />
                    <span>{bulletPoint1}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#a78bfa] shrink-0" />
                    <span>{bulletPoint2}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 relative z-10 text-center">
                <button
                  className="w-full py-2.5 px-4 rounded-xl text-[#07052e] font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <span>{ctaText}</span>
                  <span>👆</span>
                </button>
                <div className="text-[10px] text-white/60">
                  Desliza hacia arriba para aplicar
                </div>
              </div>
            </div>
          )}

          {/* FORMATO 3: CARTEL A4 PARA MAMPARAS DE FACULTADES */}
          {activeTab === 'cartel' && (
            <div className="w-full max-w-md bg-white rounded-[24px] shadow-develop-modal border-2 border-black/10 p-7 flex flex-col justify-between text-left space-y-5">
              <div className="border-b-2 border-[#0f094f] pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#0f094f] text-white font-black text-xs flex items-center justify-center">
                      D
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-[#0f094f]">
                      DEVELOP TALENT
                    </span>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded text-[10px] font-black text-white uppercase"
                    style={{ backgroundColor: themeColor }}
                  >
                    Convocatoria Oficial
                  </span>
                </div>
                <h2 className="text-2xl font-black text-[#111111] leading-tight mt-2">
                  {headline}
                </h2>
                <div className="text-xs font-semibold text-[#555555] mt-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-[#0f094f]" />
                  <span>Para alumnos de: {currentSchool?.name}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-[#555555] leading-relaxed">
                  {subheadline}
                </p>

                <div className="bg-[#F8F8FC] p-4 rounded-2xl border border-black/5 space-y-2">
                  <div className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                    Ventajas para tu Carrera Profesional:
                  </div>
                  <ul className="text-xs space-y-1.5 text-[#555555]">
                    <li className="flex items-center gap-2 font-medium">
                      <span className="text-[#0f094f] font-bold">•</span> {bulletPoint1}
                    </li>
                    <li className="flex items-center gap-2 font-medium">
                      <span className="text-[#0f094f] font-bold">•</span> {bulletPoint2}
                    </li>
                    <li className="flex items-center gap-2 font-medium">
                      <span className="text-[#0f094f] font-bold">•</span> {bulletPoint3}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-[#0f094f] flex items-center justify-between">
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-[#111111]">{ctaText}</div>
                  <div className="text-[11px] text-[#555555]">Develop Enterprise Ecosystem</div>
                  <div className="text-[11px] text-[#29008e] font-medium">develop.com/talento</div>
                </div>

                <div className="w-16 h-16 bg-[#0f094f] text-white rounded-xl flex flex-col items-center justify-center text-[10px] font-mono shrink-0 p-1 text-center shadow-sm">
                  <div className="text-xs">📱 [QR]</div>
                  <div className="text-[8px] mt-0.5">REGISTRO</div>
                </div>
              </div>
            </div>
          )}

          {/* FORMATO 4: BANNER DIGITAL INTRANET */}
          {activeTab === 'banner_web' && (
            <div
              className="w-full max-w-xl h-64 rounded-[24px] p-7 text-white shadow-develop-modal flex flex-col justify-between relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${themeColor} 0%, #07052e 100%)`
              }}
            >
              <div className="flex items-start justify-between relative z-10">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#07052e]"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Develop Talent Program
                </span>
                <span className="text-xs text-white/70 font-semibold">{currentSchool?.name}</span>
              </div>

              <div className="relative z-10 space-y-1.5 max-w-md">
                <h3 className="text-xl font-black leading-tight text-white">
                  {headline}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2">
                  {subheadline}
                </p>
              </div>

              <div className="flex items-center justify-between relative z-10 pt-2 border-t border-white/15">
                <div className="text-[11px] text-white/80">
                  {bulletPoint1}
                </div>
                <button
                  className="px-4 py-2 rounded-xl text-[#07052e] font-bold text-xs shadow-md transition-transform active:scale-95"
                  style={{ backgroundColor: secondaryColor }}
                >
                  {ctaText}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREAR NUEVA CAMPAÑA */}
      {isCreatingCampaign && (
        <div className="fixed inset-0 z-50 bg-[#07052e]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[28px] shadow-develop-modal border border-black/10 overflow-hidden animate-fadeIn">
            <div className="p-6 premium-dark-surface text-white flex items-center justify-between border-b border-white/10 relative">
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] block">
                  Marketing & Difusión Institucional
                </span>
                <h3 className="font-bold text-lg text-white mt-0.5">Configurar Nueva Campaña</h3>
                <p className="text-xs text-white/70">
                  Generará automáticamente todo el paquete de piezas publicitarias
                </p>
              </div>
              <button
                onClick={() => setIsCreatingCampaign(false)}
                className="relative z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaignSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#111111]">Programa Institucional</label>
                <select
                  value={newProgramName}
                  onChange={(e) => setNewProgramName(e.target.value)}
                  className="input-develop w-full"
                >
                  <option value="Develop Talent Program">Develop Talent Program (Estadías, Residencias & Dual)</option>
                  <option value="Develop Innovation Labs">Develop Innovation Labs</option>
                  <option value="Develop Career Hub">Develop Career Hub</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111111]">Nombre de la Campaña</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Convocatoria Residencias Develop - ITTLA"
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  className="input-develop w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111111]">Universidad / Sede Destinataria</label>
                <select
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(e.target.value)}
                  className="input-develop w-full"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.state} - {c.municipality})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111111]">Objetivo de Vinculación / Captación</label>
                <select
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  className="input-develop w-full"
                >
                  <option value="Aceptación de Alumnos para Estadías & Residencias">
                    Aceptación de Alumnos para Estadías & Residencias
                  </option>
                  <option value="Firma de Convenio Marco de Modalidad Dual">
                    Firma de Convenio Marco de Modalidad Dual
                  </option>
                  <option value="Reclutamiento Anticipado de Egresados y Bolsa de Trabajo">
                    Reclutamiento Anticipado de Egresados y Bolsa de Trabajo
                  </option>
                  <option value="Patrocinio de Eventos Universitarios y Hackathones">
                    Patrocinio de Eventos Universitarios y Hackathones
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111111]">Presupuesto Asignado ($ MXN)</label>
                <input
                  type="number"
                  required
                  min="20000"
                  step="5000"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="input-develop w-full"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsCreatingCampaign(false)}
                  className="btn-secondary-light px-4 py-2 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary-develop px-5 py-2 text-xs font-bold"
                >
                  Crear y Generar Piezas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
