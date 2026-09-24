import React, { useState } from 'react';
import { Company, Contact, Deal, Activity } from '../../types';
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap, 
  Users, 
  Award, 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  FileText,
  Navigation,
  X,
  Sparkles,
  Layers
} from 'lucide-react';

interface CompaniesListProps {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
  onNavigateToRoutePlanner?: () => void;
  selectedCompanyId?: string | null;
  onCloseCompanyDetail?: () => void;
  onOpenCompanyDetail?: (id: string) => void;
}

export const CompaniesList: React.FC<CompaniesListProps> = ({
  companies,
  contacts,
  deals,
  activities,
  onAddActivity,
  onNavigateToRoutePlanner,
  selectedCompanyId,
  onCloseCompanyDetail,
  onOpenCompanyDetail
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('todos');
  const [activeModalCompanyId, setActiveModalCompanyId] = useState<string | null>(selectedCompanyId || null);

  // Estados para nuevo log de actividad
  const [activityType, setActivityType] = useState<'call' | 'meeting' | 'email' | 'note' | 'task'>('call');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');

  // Sincronizar prop externa con estado local
  React.useEffect(() => {
    if (selectedCompanyId) {
      setActiveModalCompanyId(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.directorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'todos' || c.state === selectedState;
    return matchesSearch && matchesState;
  });

  const activeCompany = companies.find((c) => c.id === activeModalCompanyId);
  const companyContacts = contacts.filter((ct) => ct.companyId === activeModalCompanyId);
  const companyDeals = deals.filter((d) => d.companyId === activeModalCompanyId);
  const companyActivities = activities.filter((a) => a.companyId === activeModalCompanyId);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalCompanyId || !activityTitle.trim()) return;

    onAddActivity({
      companyId: activeModalCompanyId,
      type: activityType,
      title: activityTitle,
      description: activityDesc,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      completed: true,
      author: 'Carlos Mendoza'
    });

    setActivityTitle('');
    setActivityDesc('');
  };

  const closeModal = () => {
    setActiveModalCompanyId(null);
    if (onCloseCompanyDetail) onCloseCompanyDetail();
  };

  return (
    <div className="space-y-7">
      {/* HEADER EDITORIAL DEL DIRECTORIO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-black/5">
        <div>
          <div className="text-[11px] font-bold text-[#29008e] uppercase tracking-[0.22em] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]"></span>
            Directorio Institucional 360°
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#111111] tracking-tight mt-1">
            Universidades & Sedes Aliadas
          </h1>
          <p className="text-sm text-[#555555] mt-1 max-w-2xl">
            Expediente centralizado de rectores, vinculación académica, acuerdos marco y matrícula estudiantil.
          </p>
        </div>

        <div className="text-xs text-[#888888] font-medium">
          Total: <strong className="text-[#0f094f] font-bold">{companies.length} instituciones</strong> en red
        </div>
      </div>

      {/* CONTROLES DE FILTROS DEVELOP */}
      <div className="card-light p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por universidad, municipio o rector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-develop w-full pl-10 pr-4 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-[#555555] shrink-0">Región:</span>
          {['todos', 'CDMX', 'Estado de México'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`text-xs px-3.5 py-2 rounded-xl font-medium shrink-0 whitespace-nowrap transition-all ${
                selectedState === st
                  ? 'btn-primary-develop'
                  : 'btn-secondary-light'
              }`}
            >
              {st === 'todos' ? 'Todas las Regiones' : st}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE ESCUELAS CON CARDS CLARAS DEVELOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.map((school) => {
          const schoolDeals = deals.filter((d) => d.companyId === school.id);

          return (
            <div
              key={school.id}
              className="card-light card-light-hover p-4 sm:p-6 flex flex-col justify-between text-left group rounded-[24px]"
            >
              <div>
                {/* Header de Tarjeta */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                    school.state === 'CDMX' 
                      ? 'bg-[#0f094f]/10 text-[#0f094f] border border-[#0f094f]/15' 
                      : 'bg-[#29008e]/10 text-[#29008e] border border-[#29008e]/15'
                  }`}>
                    {school.state}
                  </span>

                  <div className="flex items-center gap-1 bg-[#640354]/10 text-[#640354] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#640354]/20">
                    <Award className="w-3.5 h-3.5 text-[#640354]" />
                    Score {school.leadScore}
                  </div>
                </div>

                <h3 className="font-bold text-[#111111] text-base group-hover:text-[#0f094f] transition-colors leading-snug">
                  {school.name}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-[#555555] mt-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-[#29008e]" />
                  <span className="truncate">{school.municipality}, {school.state}</span>
                </div>

                {/* Métricas de la Universidad */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-[#F8F8FC] rounded-xl text-[11px] text-[#555555] border border-black/5">
                  <div>
                    <span className="text-[#888888] block text-[10px] font-semibold uppercase tracking-wider">Matrícula</span>
                    <span className="font-extrabold text-[#111111] flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-[#29008e]" />
                      {school.studentCount.toLocaleString('es-MX')} alumnos
                    </span>
                  </div>
                  <div>
                    <span className="text-[#888888] block text-[10px] font-semibold uppercase tracking-wider">Colegiatura</span>
                    <span className="font-extrabold text-[#111111] block mt-0.5">
                      ${school.monthlyTuition.toLocaleString('es-MX')}/mes
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-xs space-y-1.5 text-[#555555]">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#0f094f]" />
                    <span className="font-semibold text-[#111111]">{school.directorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#555555]">
                    <Phone className="w-4 h-4 text-[#888888]" />
                    <span>{school.phone}</span>
                  </div>
                </div>

                {/* Chips de Modalidad y Marcas */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {school.preferredModality && (
                    <span className="chip-skill text-[10px] px-2 py-0.5">
                      {school.preferredModality === 'modalidad_a_programa' ? 'Mod. A: Programa' : 'Mod. B: Alojado'}
                    </span>
                  )}
                  {school.alliedBrands && school.alliedBrands.map((brand) => (
                    <span
                      key={brand}
                      className="text-[10px] px-2 py-0.5 bg-[#29008e]/5 text-[#29008e] rounded-md font-semibold border border-[#29008e]/15"
                    >
                      {brand}
                    </span>
                  ))}
                  {school.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 bg-black/5 text-[#555555] rounded-md font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer con Botón Ver Ficha 360 */}
              <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between">
                <div className="text-[11px] text-[#888888]">
                  {schoolDeals.length > 0 ? (
                    <span className="font-semibold text-[#0f094f]">
                      {schoolDeals.length} convenio(s) activo(s)
                    </span>
                  ) : (
                    <span>Sin convenios activos</span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setActiveModalCompanyId(school.id);
                    if (onOpenCompanyDetail) onOpenCompanyDetail(school.id);
                  }}
                  className="btn-primary-develop text-xs px-3.5 py-1.5 font-bold"
                >
                  Ver Ficha 360°
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 360° EXPEDIENTE DE CLIENTE CON IDENTIDAD DEVELOP */}
      {activeCompany && (
        <div className="fixed inset-0 z-50 bg-[#07052e]/60 backdrop-blur-xs flex items-center justify-center p-3 lg:p-6">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[28px] shadow-develop-modal border border-black/10 flex flex-col overflow-hidden animate-fadeIn">
            {/* Header Dark Premium del Expediente */}
            <div className="p-4 sm:p-6 premium-dark-surface text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 relative border-b border-white/10">
              <div className="relative z-10 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center font-bold text-xl border border-white/20 shadow-develop-glow/30 shrink-0">
                  <Building2 className="w-6 h-6 text-[#a78bfa]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 pill-dark font-bold uppercase tracking-wider">
                      Expediente 360°
                    </span>
                    <span className="text-xs text-[#f472b6] font-bold">
                      ★ Score: {activeCompany.leadScore}/100
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mt-0.5">{activeCompany.name}</h2>
                  <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#a78bfa]" />
                    {activeCompany.address} ({activeCompany.municipality}, {activeCompany.state})
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-2 sm:gap-2.5 shrink-0">
                {onNavigateToRoutePlanner && (
                  <button
                    onClick={() => {
                      closeModal();
                      onNavigateToRoutePlanner();
                    }}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 btn-primary-dark text-xs font-bold"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#29008e]" />
                    Trazar en Ruta
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Modal: 2 Columnas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-black/5">
              {/* Columna Izquierda: Datos Institucionales y Convenios */}
              <div className="lg:col-span-4 p-4 sm:p-6 space-y-6 bg-[#F8F8FC]">
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-[#888888] tracking-widest mb-2.5">
                    Información Institucional
                  </h4>
                  <div className="card-light p-4 space-y-3 text-xs rounded-2xl">
                    <div>
                      <span className="text-[#888888] block text-[10px] font-semibold uppercase">Rector / Titular</span>
                      <span className="font-bold text-[#111111]">{activeCompany.directorName}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px] font-semibold uppercase">Conmutador</span>
                      <a href={`tel:${activeCompany.phone}`} className="font-semibold text-[#0f094f] hover:underline">
                        {activeCompany.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px] font-semibold uppercase">Correo de Contacto</span>
                      <a href={`mailto:${activeCompany.email}`} className="font-semibold text-[#29008e] hover:underline">
                        {activeCompany.email}
                      </a>
                    </div>
                    <div className="pt-2 border-t border-black/5 flex justify-between">
                      <div>
                        <span className="text-[#888888] block text-[10px] font-semibold uppercase">Matrícula</span>
                        <span className="font-bold text-[#111111]">{activeCompany.studentCount.toLocaleString('es-MX')} alumnos</span>
                      </div>
                      <div>
                        <span className="text-[#888888] block text-[10px] font-semibold uppercase">Colegiatura</span>
                        <span className="font-bold text-[#111111]">${activeCompany.monthlyTuition.toLocaleString('es-MX')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Convenios / Oportunidades en Pipeline */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-[10px] font-bold uppercase text-[#888888] tracking-widest">
                      Iniciativas Activas ({companyDeals.length})
                    </h4>
                  </div>
                  <div className="space-y-2.5">
                    {companyDeals.map((d) => (
                      <div key={d.id} className="card-light p-3.5 text-xs space-y-1 rounded-2xl">
                        <div className="font-bold text-[#111111]">{d.title}</div>
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-[#0f094f]">
                            ${d.amount.toLocaleString('es-MX')} MXN
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-[#0f094f]/10 text-[#0f094f] rounded-full font-bold">
                            {d.stage}
                          </span>
                        </div>
                      </div>
                    ))}
                    {companyDeals.length === 0 && (
                      <div className="text-xs text-[#888888] card-light p-4 text-center rounded-2xl">
                        No hay iniciativas registradas aún.
                      </div>
                    )}
                  </div>
                </div>

                {/* Contactos Clave */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-[#888888] tracking-widest mb-2.5">
                    Contactos Clave ({companyContacts.length})
                  </h4>
                  <div className="space-y-2.5">
                    {companyContacts.map((contact) => (
                      <div key={contact.id} className="card-light p-3 text-xs flex items-center gap-3 rounded-2xl">
                        <img
                          src={contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={contact.name}
                          className="w-10 h-10 rounded-xl object-cover border border-black/10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[#111111] truncate">{contact.name}</div>
                          <div className="text-[11px] text-[#555555] truncate">{contact.role}</div>
                          <div className="text-[10px] text-[#29008e] truncate font-medium">{contact.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Timeline de Actividades y Registro Inmediato */}
              <div className="lg:col-span-8 p-4 sm:p-6 space-y-6 flex flex-col bg-white">
                {/* Formulario Rápido de Registro de Interacción */}
                <div className="card-light p-5 space-y-3.5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-[#29008e]" />
                      Registrar Nueva Interacción con la Universidad
                    </span>
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {(['call', 'meeting', 'email', 'note', 'task'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setActivityType(t)}
                          className={`text-xs px-3 py-1 rounded-lg font-semibold capitalize shrink-0 whitespace-nowrap transition-all ${
                            activityType === t
                              ? 'btn-primary-develop shadow-xs'
                              : 'bg-black/5 text-[#555555] hover:bg-black/10'
                          }`}
                        >
                          {t === 'call' ? 'Llamada' : t === 'meeting' ? 'Reunión' : t === 'email' ? 'Email' : t === 'note' ? 'Nota' : 'Tarea'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
                    <input
                      type="text"
                      required
                      placeholder={
                        activityType === 'call'
                          ? 'Ej: Llamada con Rectoría sobre firma de convenio dual...'
                          : activityType === 'meeting'
                          ? 'Ej: Reunión presencial para mostrar kit de hackathon...'
                          : 'Asunto o resumen breve...'
                      }
                      value={activityTitle}
                      onChange={(e) => setActivityTitle(e.target.value)}
                      className="input-develop w-full"
                    />
                    <textarea
                      rows={2}
                      placeholder="Detalles institucionales, compromisos acordados, siguientes pasos..."
                      value={activityDesc}
                      onChange={(e) => setActivityDesc(e.target.value)}
                      className="input-develop w-full"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="btn-primary-develop px-5 py-2 font-bold shadow-xs"
                      >
                        Guardar en Expediente
                      </button>
                    </div>
                  </form>
                </div>

                {/* Timeline Cronológico de Interacciones */}
                <div className="space-y-3.5 flex-1">
                  <h4 className="text-[10px] font-bold uppercase text-[#888888] tracking-widest">
                    Línea de Tiempo & Registro Histórico
                  </h4>

                  <div className="space-y-3">
                    {companyActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 bg-white rounded-2xl border border-black/5 shadow-xs flex items-start gap-3.5"
                      >
                        <div className={`p-2.5 rounded-xl text-white shrink-0 ${
                          act.type === 'call' ? 'bg-[#0f094f]' :
                          act.type === 'meeting' ? 'bg-[#29008e]' :
                          act.type === 'email' ? 'bg-[#640354]' :
                          act.type === 'task' ? 'bg-[#6d28d9]' : 'bg-[#555555]'
                        }`}>
                          {act.type === 'call' && <Phone className="w-4 h-4" />}
                          {act.type === 'meeting' && <Calendar className="w-4 h-4" />}
                          {act.type === 'email' && <Mail className="w-4 h-4" />}
                          {act.type === 'task' && <CheckCircle className="w-4 h-4" />}
                          {act.type === 'note' && <FileText className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0 text-xs">
                          <div className="flex items-start sm:items-center justify-between gap-2">
                            <span className="font-bold text-[#111111] truncate">{act.title}</span>
                            <span className="text-[10px] text-[#888888] font-mono shrink-0">{act.date}</span>
                          </div>
                          <p className="text-[#555555] mt-1 leading-relaxed">{act.description}</p>
                          <div className="text-[10px] text-[#888888] mt-2 flex items-center gap-1.5">
                            <span>Registrado por:</span>
                            <strong className="text-[#0f094f] font-semibold">{act.author}</strong>
                          </div>
                        </div>
                      </div>
                    ))}

                    {companyActivities.length === 0 && (
                      <div className="text-center py-10 text-[#888888] text-xs card-light rounded-2xl">
                        No hay actividades registradas recientemente en este expediente.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
