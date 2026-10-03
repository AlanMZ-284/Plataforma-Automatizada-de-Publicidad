import React, { useState } from 'react';
import { Company, Contact, Deal, Activity, CompanyType, ProjectModality } from '../../types';
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
  Plus, 
  CheckCircle, 
  FileText, 
  Navigation, 
  X, 
  FileSpreadsheet, 
  Database, 
  Sparkles, 
  UploadCloud,
  UserPlus,
  RefreshCw,
  Loader2,
  Edit3,
  Star
} from 'lucide-react';
import { ModalImportarExcel } from './ModalImportarExcel';
import { transformarUniversidadACompania } from '../../utils/lectorExcelUniversidades';
import { Universidad } from '../../types/base_datos';
import {
  insertarUniversidadesEnBD,
  guardarContactoUniversidadEnBD,
  actualizarUniversidadEnBD
} from '../../services/servicioCrm';

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
  onImportCompanies?: (newCompanies: Company[]) => void;
  onCargarSemilla?: () => void;
  onAddContact?: (newContact: Contact) => void;
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
  onOpenCompanyDetail,
  onImportCompanies,
  onCargarSemilla,
  onAddContact
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('todos');
  const [activeModalCompanyId, setActiveModalCompanyId] = useState<string | null>(selectedCompanyId || null);

  // Instituciones locales reactivas sincronizadas con la propiedad externa
  const [companiasLocales, setCompaniasLocales] = useState<Company[]>(companies);
  React.useEffect(() => {
    setCompaniasLocales(companies);
  }, [companies]);

  // Contactos locales reactivos sincronizados con la propiedad externa
  const [contactosLocales, setContactosLocales] = useState<Contact[]>(contacts);
  React.useEffect(() => {
    setContactosLocales(contacts);
  }, [contacts]);

  // Estados para importación inteligente de Excel / CSV
  const [modalImportarAbierto, setModalImportarAbierto] = useState(false);
  const [mensajeExitoImportacion, setMensajeExitoImportacion] = useState<string | null>(null);

  // Estados para registro manual de universidad
  const [modalRegistroManualAbierto, setModalRegistroManualAbierto] = useState(false);
  const [guardandoNuevaUniversidad, setGuardandoNuevaUniversidad] = useState(false);
  const [formUnivNombre, setFormUnivNombre] = useState('');
  const [formUnivTipo, setFormUnivTipo] = useState<CompanyType>('universidad');
  const [formUnivEstado, setFormUnivEstado] = useState<'CDMX' | 'Estado de México'>('CDMX');
  const [formUnivMunicipio, setFormUnivMunicipio] = useState('');
  const [formUnivDireccion, setFormUnivDireccion] = useState('');
  const [formUnivModalidad, setFormUnivModalidad] = useState<ProjectModality>('modalidad_a_programa');
  const [formUnivTelefono, setFormUnivTelefono] = useState('');
  const [formUnivEmail, setFormUnivEmail] = useState('');
  const [formUnivDirector, setFormUnivDirector] = useState('');
  const [formUnivMatricula, setFormUnivMatricula] = useState('');
  const [formUnivColegiatura, setFormUnivColegiatura] = useState('');

  // Estados para edición de universidad en el Directorio 360
  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [formEditNombre, setFormEditNombre] = useState('');
  const [formEditDirector, setFormEditDirector] = useState('');
  const [formEditTelefono, setFormEditTelefono] = useState('');
  const [formEditEmail, setFormEditEmail] = useState('');
  const [formEditMatricula, setFormEditMatricula] = useState('');
  const [formEditColegiatura, setFormEditColegiatura] = useState('');
  const [formEditModalidad, setFormEditModalidad] = useState<ProjectModality>('modalidad_a_programa');
  const [formEditEstado, setFormEditEstado] = useState<'CDMX' | 'Estado de México'>('CDMX');
  const [formEditMunicipio, setFormEditMunicipio] = useState('');
  const [formEditDireccion, setFormEditDireccion] = useState('');
  const [formEditTipo, setFormEditTipo] = useState<CompanyType>('universidad');

  // Estados para registro manual de contacto institucional
  const [formularioNuevoContactoAbierto, setFormularioNuevoContactoAbierto] = useState(false);
  const [guardandoNuevoContacto, setGuardandoNuevoContacto] = useState(false);
  const [formContactoNombre, setFormContactoNombre] = useState('');
  const [formContactoCargo, setFormContactoCargo] = useState('');
  const [formContactoCorreo, setFormContactoCorreo] = useState('');
  const [formContactoTelefono, setFormContactoTelefono] = useState('');

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

  const abrirModalEdicion = (empresa: Company) => {
    setFormEditNombre(empresa.name);
    setFormEditDirector(empresa.directorName === 'Sin titular registrado' ? '' : empresa.directorName);
    setFormEditTelefono(empresa.phone === 'Sin teléfono registrado' ? '' : empresa.phone);
    setFormEditEmail(empresa.email === 'Sin correo registrado' ? '' : empresa.email);
    setFormEditMatricula(empresa.studentCount > 0 ? String(empresa.studentCount) : '');
    setFormEditColegiatura(empresa.monthlyTuition > 0 ? String(empresa.monthlyTuition) : '');
    setFormEditModalidad(empresa.preferredModality || 'modalidad_a_programa');
    setFormEditEstado(empresa.state || 'CDMX');
    setFormEditMunicipio(empresa.municipality || '');
    setFormEditDireccion(empresa.address || '');
    setFormEditTipo(empresa.type || 'universidad');
    setModalEdicionAbierto(true);
  };

  const manejarGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany || !formEditNombre.trim()) return;

    setGuardandoEdicion(true);
    try {
      const matriculaNum = formEditMatricula.trim() ? Number(formEditMatricula) : 0;
      const colegiaturaNum = formEditColegiatura.trim() ? Number(formEditColegiatura) : 0;

      const datosActualizados = {
        nombre: formEditNombre.trim(),
        director_nombre: formEditDirector.trim() || null,
        telefono: formEditTelefono.trim() || null,
        correo_electronico: formEditEmail.trim() || null,
        matricula_estudiantes: isNaN(matriculaNum) ? 0 : matriculaNum,
        colegiatura_mensual: isNaN(colegiaturaNum) ? 0 : colegiaturaNum,
        modalidad_preferida: formEditModalidad,
        estado: formEditEstado,
        municipio: formEditMunicipio.trim() || activeCompany.municipality,
        direccion: formEditDireccion.trim() || activeCompany.address,
        tipo: formEditTipo
      };

      const res = await actualizarUniversidadEnBD(activeCompany.id, datosActualizados);

      if (res.exito) {
        const companiaModificada: Company = {
          ...activeCompany,
          name: datosActualizados.nombre,
          directorName: datosActualizados.director_nombre || 'Sin titular registrado',
          phone: datosActualizados.telefono || 'Sin teléfono registrado',
          email: datosActualizados.correo_electronico || 'Sin correo registrado',
          studentCount: datosActualizados.matricula_estudiantes,
          monthlyTuition: datosActualizados.colegiatura_mensual,
          preferredModality: datosActualizados.modalidad_preferida,
          state: datosActualizados.estado,
          municipality: datosActualizados.municipio,
          address: datosActualizados.direccion,
          type: datosActualizados.tipo
        };

        setCompaniasLocales((prev) =>
          prev.map((c) => (c.id === activeCompany.id ? companiaModificada : c))
        );

        setMensajeExitoImportacion('¡Información institucional actualizada exitosamente!');
        setModalEdicionAbierto(false);
        setTimeout(() => setMensajeExitoImportacion(null), 6000);
      } else {
        alert(`Error al actualizar en la base de datos: ${res.error || 'Verifica la conexión con PostgreSQL'}`);
      }
    } catch (err: any) {
      console.error('Error al guardar edición de universidad:', err);
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const manejarImportacionUniversidades = (universidadesImportadas: Universidad[]) => {
    const companiasTransformadas = universidadesImportadas.map(transformarUniversidadACompania);
    setCompaniasLocales((prev) => [...companiasTransformadas, ...prev]);
    if (onImportCompanies) {
      onImportCompanies(companiasTransformadas);
    }
    setMensajeExitoImportacion(`¡Se importaron exitosamente ${companiasTransformadas.length} instituciones a la cartera comercial!`);
    setTimeout(() => {
      setMensajeExitoImportacion(null);
    }, 6000);
  };

  const filteredCompanies = companiasLocales.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.directorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'todos' || c.state === selectedState;
    return matchesSearch && matchesState;
  });

  const activeCompany = companiasLocales.find((c) => c.id === activeModalCompanyId);
  const companyContacts = contactosLocales.filter((ct) => ct.companyId === activeModalCompanyId);
  const companyDeals = deals.filter((d) => d.companyId === activeModalCompanyId);
  const companyActivities = activities.filter((a) => a.companyId === activeModalCompanyId);

  // Registro manual de una nueva institución educativa en Supabase
  const manejarCrearUniversidadManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUnivNombre.trim()) return;

    setGuardandoNuevaUniversidad(true);
    try {
      const matriculaNum = formUnivMatricula.trim() ? Number(formUnivMatricula) : 0;
      const colegiaturaNum = formUnivColegiatura.trim() ? Number(formUnivColegiatura) : 0;

      const nuevaEscuelaData = {
        nombre: formUnivNombre.trim(),
        tipo: formUnivTipo,
        estado: formUnivEstado,
        municipio: formUnivMunicipio.trim() || (formUnivEstado === 'CDMX' ? 'Cuauhtémoc' : 'Naucalpan de Juárez'),
        direccion: formUnivDireccion.trim() || `${formUnivMunicipio || 'Centro'}, ${formUnivEstado}`,
        modalidad_preferida: formUnivModalidad,
        telefono: formUnivTelefono.trim() || null,
        correo_electronico: formUnivEmail.trim() || null,
        director_nombre: formUnivDirector.trim() || null,
        matricula_estudiantes: isNaN(matriculaNum) ? 0 : matriculaNum,
        colegiatura_mensual: isNaN(colegiaturaNum) ? 0 : colegiaturaNum,
        puntuacion_prioridad: 0,
        estatus: 'prospecto',
        etiquetas: ['Registro Manual'],
        marcas_aliadas: ['Develop Academy'],
        datos_adicionales: { origen: 'registro_manual_directorio' }
      };

      const res = await insertarUniversidadesEnBD([nuevaEscuelaData]);
      if (res.exito && res.universidades.length > 0) {
        setCompaniasLocales((prev) => [...res.universidades, ...prev]);
        if (onImportCompanies) {
          onImportCompanies(res.universidades);
        }
        setMensajeExitoImportacion(`¡Se registró exitosamente "${formUnivNombre}" en la base de datos!`);
        setModalRegistroManualAbierto(false);
        // Reset campos
        setFormUnivNombre('');
        setFormUnivMunicipio('');
        setFormUnivDireccion('');
        setFormUnivTelefono('');
        setFormUnivEmail('');
        setFormUnivDirector('');
        setFormUnivMatricula('');
        setFormUnivColegiatura('');
        setTimeout(() => setMensajeExitoImportacion(null), 6000);
      }
    } catch (error) {
      console.error('Error registrando universidad manual:', error);
    } finally {
      setGuardandoNuevaUniversidad(false);
    }
  };

  // Registro manual de contacto institucional dentro del expediente 360
  const manejarCrearContactoManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalCompanyId || !formContactoNombre.trim() || !formContactoCorreo.trim()) return;

    setGuardandoNuevoContacto(true);
    try {
      const res = await guardarContactoUniversidadEnBD({
        universidad_id: activeModalCompanyId,
        nombre_completo: formContactoNombre.trim(),
        cargo_puesto: formContactoCargo.trim() || 'Coordinador(a) de Vinculación',
        correo_electronico: formContactoCorreo.trim(),
        telefono: formContactoTelefono.trim() || undefined,
        es_contacto_principal: companyContacts.length === 0
      });

      if (res.exito && res.contactoFrontend) {
        setContactosLocales((prev) => [res.contactoFrontend!, ...prev]);
        if (onAddContact) {
          onAddContact(res.contactoFrontend);
        }
        onAddActivity({
          companyId: activeModalCompanyId,
          type: 'task',
          title: `Nuevo Contacto Registrado: ${formContactoNombre}`,
          description: `${formContactoCargo || 'Contacto'} añadido al directorio del plantel. Correo: ${formContactoCorreo}.`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          completed: true,
          author: 'Carlos Mendoza'
        });

        setFormularioNuevoContactoAbierto(false);
        setFormContactoNombre('');
        setFormContactoCargo('');
        setFormContactoCorreo('');
        setFormContactoTelefono('');
      }
    } catch (error) {
      console.error('Error guardando contacto en expediente:', error);
    } finally {
      setGuardandoNuevoContacto(false);
    }
  };

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

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-xs text-[#888888] font-medium">
            Total: <strong className="text-[#0f094f] font-bold">{companiasLocales.length} instituciones</strong> en red
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setModalRegistroManualAbierto(true)}
              className="btn-secondary-light text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 border border-black/10 hover:border-[#29008e]/30 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#29008e]" />
              <span>Nueva Universidad</span>
            </button>

            <button
              type="button"
              onClick={() => setModalImportarAbierto(true)}
              className="btn-primary-develop text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-develop-glow transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#a78bfa]" />
              <span>Importar Excel / CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* BANNER DE NOTIFICACIÓN DE IMPORTACIÓN EXITOSA */}
      {mensajeExitoImportacion && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{mensajeExitoImportacion}</span>
          </div>
          <button
            onClick={() => setMensajeExitoImportacion(null)}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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

      {/* VISTA VACÍA O GRID DE ESCUELAS CON CARDS CLARAS DEVELOP */}
      {companiasLocales.length === 0 ? (
        <div className="card-light p-8 sm:p-12 text-center rounded-[32px] border border-black/10 bg-white shadow-xs max-w-3xl mx-auto my-6 animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0f094f]/10 via-[#29008e]/10 to-[#640354]/10 text-[#0f094f] flex items-center justify-center mx-auto mb-6 border border-[#29008e]/20 shadow-develop-glow/20">
            <Building2 className="w-10 h-10 text-[#29008e]" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0f094f]/5 text-[#0f094f] border border-[#0f094f]/10 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#a78bfa] animate-ping"></span>
            Modo Base de Datos Limpia
          </span>

          <h3 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight mt-1">
            Cartera de Universidades Vacía: No hay instituciones registradas en la base de datos
          </h3>

          <p className="text-sm text-[#555555] max-w-xl mx-auto mt-2 leading-relaxed">
            La base de datos oficial se encuentra en un estado limpio. Puedes comenzar la ingesta masiva de planteles mediante archivos <strong>Excel (.xlsx, .xls)</strong> o <strong>CSV</strong>, o restaurar el catálogo representativo de 12 instituciones de prueba.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => setModalImportarAbierto(true)}
              className="btn-primary-develop inline-flex items-center gap-2.5 px-6 py-3 text-xs font-bold w-full sm:w-auto justify-center shadow-develop-box"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#a78bfa]" />
              <span>Importar Excel / CSV</span>
            </button>

            {onCargarSemilla && (
              <button
                onClick={onCargarSemilla}
                className="btn-secondary-light inline-flex items-center gap-2.5 px-6 py-3 text-xs font-bold w-full sm:w-auto justify-center border border-black/10 hover:border-[#29008e]/30"
              >
                <Database className="w-4 h-4 text-[#29008e]" />
                <span>Cargar Escuelas de Prueba</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="card-light p-10 text-center rounded-[28px] border border-black/10 bg-white max-w-xl mx-auto my-8">
          <Search className="w-10 h-10 text-[#888888] mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-bold text-[#111111]">Sin coincidencias de búsqueda</h4>
          <p className="text-xs text-[#555555] mt-1">
            No se encontraron instituciones que coincidan con &quot;{searchTerm}&quot; o la región seleccionada.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedState('todos');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold btn-secondary-light"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
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
                        {school.studentCount > 0 ? `${school.studentCount.toLocaleString('es-MX')} alumnos` : 'Sin registrar'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#888888] block text-[10px] font-semibold uppercase tracking-wider">Colegiatura</span>
                      {school.monthlyTuition && school.monthlyTuition > 0 ? (
                        <span className="font-extrabold text-[#111111] block mt-0.5">
                          ${school.monthlyTuition.toLocaleString('es-MX')}/mes
                        </span>
                      ) : (
                        <span className="inline-block text-[10px] font-bold text-[#29008e] bg-[#29008e]/10 px-2 py-0.5 rounded-md mt-0.5">
                          Pública / Sin colegiatura
                        </span>
                      )}
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
      )}

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
                    <span className="text-xs text-[#f472b6] font-bold flex items-center gap-1"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /><span>Score: {activeCompany.leadScore}/100</span></span>
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mt-0.5">{activeCompany.name}</h2>
                  <p className="text-xs text-white/70 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#a78bfa]" />
                    {activeCompany.address} ({activeCompany.municipality}, {activeCompany.state})
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-2 sm:gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => abrirModalEdicion(activeCompany)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#a78bfa]" />
                  <span>Editar Datos</span>
                </button>

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
                    <div className="pt-2 border-t border-black/5 flex justify-between items-center">
                      <div>
                        <span className="text-[#888888] block text-[10px] font-semibold uppercase">Matrícula</span>
                        <span className="font-bold text-[#111111]">
                          {activeCompany.studentCount > 0 ? `${activeCompany.studentCount.toLocaleString('es-MX')} alumnos` : 'Sin registrar'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#888888] block text-[10px] font-semibold uppercase">Colegiatura</span>
                        {activeCompany.monthlyTuition && activeCompany.monthlyTuition > 0 ? (
                          <span className="font-bold text-[#111111]">${activeCompany.monthlyTuition.toLocaleString('es-MX')}/mes</span>
                        ) : (
                          <span className="inline-block text-[10px] font-bold text-[#29008e] bg-[#29008e]/10 px-2 py-0.5 rounded-md">
                            Pública / Sin colegiatura
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadatos Excel (JSONB) - Columnas Libres */}
                {activeCompany.datos_adicionales && Object.keys(activeCompany.datos_adicionales).length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-[#29008e]" />
                        <h4 className="text-[10px] font-bold uppercase text-[#888888] tracking-widest">
                          Metadatos Excel (JSONB)
                        </h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#29008e]/10 text-[#29008e]">
                        {Object.keys(activeCompany.datos_adicionales).length} {Object.keys(activeCompany.datos_adicionales).length === 1 ? 'campo' : 'campos'}
                      </span>
                    </div>

                    <div className="card-light p-4 space-y-2.5 text-xs rounded-2xl bg-white border border-black/5 divide-y divide-black/5">
                      {Object.entries(activeCompany.datos_adicionales).map(([clave, valor], idx) => {
                        const valorFormateado =
                          valor === null || valor === undefined || valor === ''
                            ? '—'
                            : typeof valor === 'object'
                            ? JSON.stringify(valor)
                            : String(valor);

                        return (
                          <div key={clave} className={idx > 0 ? 'pt-2' : ''}>
                            <span className="text-[#888888] block text-[10px] font-semibold uppercase tracking-wider">
                              {clave.replace(/_/g, ' ')}
                            </span>
                            <span className="font-bold text-[#111111] block mt-0.5 break-words">
                              {valorFormateado}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-[10px] font-bold uppercase text-[#888888] tracking-widest">
                      Contactos Clave ({companyContacts.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setFormularioNuevoContactoAbierto(!formularioNuevoContactoAbierto)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#29008e] hover:text-[#0f094f] px-2 py-0.5 rounded-lg bg-[#29008e]/5 hover:bg-[#29008e]/10 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{formularioNuevoContactoAbierto ? 'Cancelar' : 'Agregar Contacto'}</span>
                    </button>
                  </div>

                  {/* Formulario Inline para nuevo contacto */}
                  {formularioNuevoContactoAbierto && (
                    <form onSubmit={manejarCrearContactoManual} className="card-light p-3.5 mb-3 rounded-2xl border border-[#29008e]/20 space-y-2.5 bg-[#f8f8fc]/80 shadow-xs animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#0f094f] flex items-center gap-1.5">
                          <UserPlus className="w-3.5 h-3.5 text-[#29008e]" />
                          Nuevo Contacto en BD
                        </span>
                        <span className="text-[9px] text-[#29008e] font-semibold bg-[#29008e]/10 px-1.5 py-0.5 rounded">
                          PostgreSQL
                        </span>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="Nombre y Apellidos *"
                          value={formContactoNombre}
                          onChange={(e) => setFormContactoNombre(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#29008e]"
                        />
                        <input
                          type="text"
                          placeholder="Cargo / Puesto (ej: Dir. de Vinculación)"
                          value={formContactoCargo}
                          onChange={(e) => setFormContactoCargo(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#29008e]"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="email"
                            required
                            placeholder="Correo electrónico *"
                            value={formContactoCorreo}
                            onChange={(e) => setFormContactoCorreo(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#29008e]"
                          />
                          <input
                            type="tel"
                            placeholder="Teléfono (opcional)"
                            value={formContactoTelefono}
                            onChange={(e) => setFormContactoTelefono(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-xl border border-black/10 bg-white focus:outline-none focus:border-[#29008e]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setFormularioNuevoContactoAbierto(false)}
                          className="text-xs px-2.5 py-1 text-[#555555] hover:text-[#111111]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={guardandoNuevoContacto}
                          className="btn-primary-develop text-xs px-3 py-1 rounded-lg inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {guardandoNuevoContacto ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Guardando...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Guardar Contacto</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-2.5">
                    {companyContacts.map((contact) => (
                      <div key={contact.id} className="card-light p-3 text-xs flex items-center gap-3 rounded-2xl">
                        <img
                          src={contact.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={contact.name}
                          className="w-10 h-10 rounded-xl object-cover border border-black/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[#111111] truncate">{contact.name}</div>
                          <div className="text-[11px] text-[#555555] truncate">{contact.role}</div>
                          <div className="text-[10px] text-[#29008e] truncate font-medium">{contact.email}</div>
                          {contact.phone && (
                            <div className="text-[10px] text-[#888888] truncate flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {companyContacts.length === 0 && !formularioNuevoContactoAbierto && (
                      <div className="text-xs text-[#888888] card-light p-4 text-center rounded-2xl">
                        No hay contactos registrados aún. Haz clic en "Agregar Contacto" para registrar uno.
                      </div>
                    )}
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

      {/* MODAL DE INGESTA INTELIGENTE DE EXCEL / CSV */}
      <ModalImportarExcel
        estaAbierto={modalImportarAbierto}
        alCerrar={() => setModalImportarAbierto(false)}
        alConfirmarImportacion={manejarImportacionUniversidades}
      />

      {/* MODAL DE REGISTRO MANUAL DE NUEVA UNIVERSIDAD (POSTGRESQL) */}
      {modalRegistroManualAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#07052e]/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-develop-modal border border-white/20 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-gradient-to-r from-[#07052e] via-[#0f094f] to-[#12063b] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#640354] flex items-center justify-center shadow-develop-box border border-white/15">
                  <Building2 className="w-5 h-5 text-[#a78bfa]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
                      Directorio 360° PAP
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] text-white/60">PostgreSQL Oficial</span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Registrar Nueva Institución Educativa
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalRegistroManualAbierto(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario de Registro */}
            <form onSubmit={manejarCrearUniversidadManual} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#111111] flex items-center gap-1">
                  <span>Nombre de la Institución</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Universidad Autónoma Metropolitana - Unidad Azcapotzalco"
                  value={formUnivNombre}
                  onChange={(e) => setFormUnivNombre(e.target.value)}
                  className="input-develop w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-[#29008e] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Tipo de Plantel</label>
                  <select
                    value={formUnivTipo}
                    onChange={(e) => setFormUnivTipo(e.target.value as CompanyType)}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs bg-white cursor-pointer"
                  >
                    <option value="universidad">Universidad</option>
                    <option value="instituto">Instituto Tecnológico / Superior</option>
                    <option value="colegio">Colegio / Centro de Estudios</option>
                    <option value="preparatoria">Preparatoria / Bachillerato</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Modalidad Preferida PAP</label>
                  <select
                    value={formUnivModalidad}
                    onChange={(e) => setFormUnivModalidad(e.target.value as ProjectModality)}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs bg-white cursor-pointer"
                  >
                    <option value="modalidad_a_programa">Modalidad A (Programa / Conferencia)</option>
                    <option value="modalidad_b_completa">Modalidad B (Feria Completa / Stand)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Entidad Federativa (Estado)</label>
                  <select
                    value={formUnivEstado}
                    onChange={(e) => setFormUnivEstado(e.target.value as 'CDMX' | 'Estado de México')}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs bg-white cursor-pointer"
                  >
                    <option value="CDMX">Ciudad de México (CDMX)</option>
                    <option value="Estado de México">Estado de México (Edomex)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Alcaldía / Municipio</label>
                  <input
                    type="text"
                    placeholder="ej. Benito Juárez, Coyoacán, Naucalpan"
                    value={formUnivMunicipio}
                    onChange={(e) => setFormUnivMunicipio(e.target.value)}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111111]">Dirección Completa / Campus</label>
                <input
                  type="text"
                  placeholder="ej. Av. San Pablo 180, Col. Reynosa Tamaulipas, C.P. 02200"
                  value={formUnivDireccion}
                  onChange={(e) => setFormUnivDireccion(e.target.value)}
                  className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Director(a) / Rector(a)</label>
                  <input
                    type="text"
                    placeholder="ej. Dra. María López"
                    value={formUnivDirector}
                    onChange={(e) => setFormUnivDirector(e.target.value)}
                    className="input-develop w-full px-3 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Correo Institucional</label>
                  <input
                    type="email"
                    placeholder="ej. contacto@universidad.edu.mx"
                    value={formUnivEmail}
                    onChange={(e) => setFormUnivEmail(e.target.value)}
                    className="input-develop w-full px-3 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    placeholder="ej. 55 5318 9000"
                    value={formUnivTelefono}
                    onChange={(e) => setFormUnivTelefono(e.target.value)}
                    className="input-develop w-full px-3 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Matrícula de Estudiantes</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="ej. 3500 o dejar en blanco"
                    value={formUnivMatricula}
                    onChange={(e) => setFormUnivMatricula(e.target.value)}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Colegiatura Mensual (MXN)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 si es pública o dejar en blanco"
                    value={formUnivColegiatura}
                    onChange={(e) => setFormUnivColegiatura(e.target.value)}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <div className="text-[11px] text-[#888888] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#29008e]" />
                  <span>Se sincronizará en la tabla <code className="text-[#0f094f] font-mono">universidades</code></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalRegistroManualAbierto(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#555555] hover:bg-black/5 transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={guardandoNuevaUniversidad}
                    className="btn-primary-develop px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-develop-glow transition-all disabled:opacity-50"
                  >
                    {guardandoNuevaUniversidad ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando en PostgreSQL...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Guardar Universidad</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN DE UNIVERSIDAD (SUPABASE POSTGRESQL) */}
      {modalEdicionAbierto && activeCompany && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-[#07052e]/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-[24px] shadow-develop-modal border border-white/20 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-black/10 flex items-center justify-between bg-gradient-to-r from-[#07052e] via-[#0f094f] to-[#12063b] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#29008e] to-[#640354] flex items-center justify-center shadow-develop-box border border-white/15">
                  <Edit3 className="w-5 h-5 text-[#a78bfa]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
                      Directorio 360° PAP
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] text-white/60">Actualización en PostgreSQL</span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Editar Institución Educativa
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalEdicionAbierto(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario de Edición */}
            <form onSubmit={manejarGuardarEdicion} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-[#111111] flex items-center gap-1">
                  <span>Nombre de la Institución</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formEditNombre}
                  onChange={(e) => setFormEditNombre(e.target.value)}
                  className="input-develop w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-[#29008e] text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Tipo de Plantel</label>
                  <select
                    value={formEditTipo}
                    onChange={(e) => setFormEditTipo(e.target.value as CompanyType)}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs bg-white cursor-pointer"
                  >
                    <option value="universidad">Universidad</option>
                    <option value="instituto">Instituto Tecnológico / Superior</option>
                    <option value="colegio">Colegio / Centro de Estudios</option>
                    <option value="preparatoria">Preparatoria / Bachillerato</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Modalidad Preferida PAP</label>
                  <select
                    value={formEditModalidad}
                    onChange={(e) => setFormEditModalidad(e.target.value as ProjectModality)}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs bg-white cursor-pointer"
                  >
                    <option value="modalidad_a_programa">Modalidad A (Programa / Conferencia)</option>
                    <option value="modalidad_b_completa">Modalidad B (Feria Completa / Escuela)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Entidad Federativa (Estado)</label>
                  <select
                    value={formEditEstado}
                    onChange={(e) => setFormEditEstado(e.target.value as 'CDMX' | 'Estado de México')}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs bg-white cursor-pointer"
                  >
                    <option value="CDMX">Ciudad de México (CDMX)</option>
                    <option value="Estado de México">Estado de México (Edomex)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Alcaldía / Municipio</label>
                  <input
                    type="text"
                    value={formEditMunicipio}
                    onChange={(e) => setFormEditMunicipio(e.target.value)}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#111111]">Dirección Completa / Campus</label>
                <input
                  type="text"
                  value={formEditDireccion}
                  onChange={(e) => setFormEditDireccion(e.target.value)}
                  className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Director(a) / Rector(a)</label>
                  <input
                    type="text"
                    placeholder="ej. Dra. María López"
                    value={formEditDirector}
                    onChange={(e) => setFormEditDirector(e.target.value)}
                    className="input-develop w-full px-3 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Correo Institucional</label>
                  <input
                    type="email"
                    placeholder="contacto@universidad.edu.mx"
                    value={formEditEmail}
                    onChange={(e) => setFormEditEmail(e.target.value)}
                    className="input-develop w-full px-3 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Teléfono Institucional</label>
                  <input
                    type="tel"
                    placeholder="55 5318 9000"
                    value={formEditTelefono}
                    onChange={(e) => setFormEditTelefono(e.target.value)}
                    className="input-develop w-full px-3 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Matrícula de Estudiantes</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="ej. 3500 o dejar en blanco"
                    value={formEditMatricula}
                    onChange={(e) => setFormEditMatricula(e.target.value)}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#111111]">Colegiatura Mensual (MXN)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 si es pública o dejar en blanco"
                    value={formEditColegiatura}
                    onChange={(e) => setFormEditColegiatura(e.target.value)}
                    className="input-develop w-full px-3.5 py-2 rounded-xl border border-black/10 text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <div className="text-[11px] text-[#888888] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#29008e]" />
                  <span>Se actualizará en la tabla <code className="text-[#0f094f] font-mono">universidades</code></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalEdicionAbierto(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#555555] hover:bg-black/5 transition-all"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={guardandoEdicion}
                    className="btn-primary-develop px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-develop-glow transition-all disabled:opacity-50"
                  >
                    {guardandoEdicion ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Guardando en PostgreSQL...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
