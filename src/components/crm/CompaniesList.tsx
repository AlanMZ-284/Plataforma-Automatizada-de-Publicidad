import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
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
  Star,
  Clock,
  MessageCircle,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { ModalImportarExcel } from './ModalImportarExcel';
import { transformarUniversidadACompania } from '../../utils/lectorExcelUniversidades';
import { Universidad, ProspectoAlumno } from '../../types/base_datos';
import {
  insertarUniversidadesEnBD,
  guardarContactoUniversidadEnBD,
  actualizarUniversidadEnBD,
  obtenerAlumnosPorUniversidad
} from '../../services/servicioCrm';

interface CompaniesListProps {
  companies: Company[];
  contacts: Contact[];
  deals: Deal[];
  activities: Activity[];
  onAddActivity: (activity: Omit<Activity, 'id'>) => void;
  onToggleActivity?: (activityId: string) => void;
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
  onToggleActivity,
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
  const [activityMode, setActivityMode] = useState<'minuta' | 'compromiso'>('minuta');
  const [activityDate, setActivityDate] = useState<string>(() => new Date().toISOString().substring(0, 10));
  const [filtroTimeline, setFiltroTimeline] = useState<'todas' | 'pendientes' | 'completadas'>('todas');

  // Sincronizar prop externa con estado local
  React.useEffect(() => {
    if (selectedCompanyId) {
      setActiveModalCompanyId(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  // Estados reactivos para la consulta de talento estudiantil captado (QR)
  const [alumnosCaptados, setAlumnosCaptados] = useState<ProspectoAlumno[]>([]);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [pestanaExpediente, setPestanaExpediente] = useState<'actividades' | 'alumnos'>('actividades');
  const [busquedaAlumnos, setBusquedaAlumnos] = useState('');

  // Efecto para cargar alumnos al abrir o alternar el Expediente 360°
  useEffect(() => {
    let activo = true;

    if (activeModalCompanyId) {
      setCargandoAlumnos(true);
      obtenerAlumnosPorUniversidad(activeModalCompanyId)
        .then((resultado) => {
          if (activo) {
            setAlumnosCaptados(resultado || []);
          }
        })
        .catch((error) => {
          console.error('Error al consultar alumnos para la institución:', error);
          if (activo) {
            setAlumnosCaptados([]);
          }
        })
        .finally(() => {
          if (activo) {
            setCargandoAlumnos(false);
          }
        });
    } else {
      setAlumnosCaptados([]);
      setPestanaExpediente('actividades');
      setBusquedaAlumnos('');
    }

    return () => {
      activo = false;
    };
  }, [activeModalCompanyId]);

  // Filtro reactivo de alumnos captados por nombre, carrera o correo
  const alumnosFiltrados = useMemo(() => {
    if (!busquedaAlumnos.trim()) return alumnosCaptados;
    const termino = busquedaAlumnos.toLowerCase();
    return alumnosCaptados.filter(
      (a) =>
        (a.nombre_completo && a.nombre_completo.toLowerCase().includes(termino)) ||
        (a.carrera_texto && a.carrera_texto.toLowerCase().includes(termino)) ||
        (a.correo_electronico && a.correo_electronico.toLowerCase().includes(termino)) ||
        (a.telefono && a.telefono.includes(termino))
    );
  }, [alumnosCaptados, busquedaAlumnos]);

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
  const pendientesCount = companyActivities.filter((a) => !a.completed).length;
  const completadasCount = companyActivities.filter((a) => a.completed).length;
  const actividadesFiltradas = companyActivities.filter((a) => {
    if (filtroTimeline === 'pendientes') return !a.completed;
    if (filtroTimeline === 'completadas') return a.completed;
    return true;
  });

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

    const esCompromisoFuturo = activityMode === 'compromiso';

    onAddActivity({
      companyId: activeModalCompanyId,
      type: activityType,
      title: activityTitle.trim(),
      description: activityDesc.trim(),
      date: activityDate || new Date().toISOString().substring(0, 10),
      completed: !esCompromisoFuturo,
      author: 'Carlos Mendoza'
    });

    setActivityTitle('');
    setActivityDesc('');
    setActivityDate(new Date().toISOString().substring(0, 10));
  };

  const closeModal = () => {
    setActiveModalCompanyId(null);
    if (onCloseCompanyDetail) onCloseCompanyDetail();
  };

  return (
    <div className="space-y-7">
      {/* HEADER EDITORIAL DEL DIRECTORIO */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-black/5">
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

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-xs px-3 py-1.5 bg-[#0f094f]/5 rounded-xl border border-[#0f094f]/10 text-[#555555] font-medium shrink-0">
            Total: <strong className="text-[#0f094f] font-bold">{companiasLocales.length}</strong> instituciones en red
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setModalRegistroManualAbierto(true)}
              className="btn-secondary-light text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 border border-black/10 hover:border-[#29008e]/30 transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4 text-[#29008e]" />
              <span>Nueva Universidad</span>
            </button>

            <button
              type="button"
              onClick={() => setModalImportarAbierto(true)}
              className="btn-primary-develop text-xs px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 shadow-develop-glow transition-all shrink-0"
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
        <div className="relative flex items-center flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por universidad, municipio o rector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-develop input-develop-con-icono w-full pr-4 text-xs"
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

              {/* Columna Derecha: Timeline de Actividades y Talento Estudiantil */}
              <div className="lg:col-span-8 p-4 sm:p-6 space-y-5 flex flex-col bg-white">
                {/* Selector de Pestañas del Expediente 360° */}
                <div className="flex items-center gap-2 border-b border-black/5 pb-3">
                  <button
                    type="button"
                    onClick={() => setPestanaExpediente('actividades')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      pestanaExpediente === 'actividades'
                        ? 'btn-primary-develop shadow-xs'
                        : 'bg-[#F8F8FC] hover:bg-black/5 text-[#555555] border border-black/5'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Bitácora & Interacciones</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pestanaExpediente === 'actividades'
                        ? 'bg-white/20 text-white'
                        : 'bg-black/5 text-[#555555]'
                    }`}>
                      {companyActivities.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPestanaExpediente('alumnos')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      pestanaExpediente === 'alumnos'
                        ? 'btn-primary-develop shadow-xs'
                        : 'bg-[#F8F8FC] hover:bg-black/5 text-[#555555] border border-black/5'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Talento Estudiantil Captado</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      pestanaExpediente === 'alumnos'
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {alumnosCaptados.length}
                    </span>
                  </button>
                </div>

                {/* PESTAÑA 1: BITÁCORA & INTERACCIONES */}
                {pestanaExpediente === 'actividades' && (
                  <div className="space-y-6">
                    {/* Formulario Rápido de Registro de Interacción */}
                    <div className="card-light p-5 space-y-4 rounded-2xl">
                      {/* Selector de Modo Temporal */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-black/5 rounded-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setActivityMode('minuta');
                            if (activityType === 'task') setActivityType('call');
                          }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            activityMode === 'minuta'
                              ? 'bg-white text-[#0f094f] shadow-xs border border-black/5'
                              : 'text-[#666666] hover:text-[#111111]'
                          }`}
                        >
                          <CheckCircle2 className={`w-4 h-4 ${activityMode === 'minuta' ? 'text-emerald-600' : 'text-[#888888]'}`} />
                          <span>Minuta Histórica (Lo que ya ocurrió)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActivityMode('compromiso');
                            if (activityType === 'email' || activityType === 'note') setActivityType('meeting');
                          }}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            activityMode === 'compromiso'
                              ? 'bg-white text-[#640354] shadow-xs border border-black/5'
                              : 'text-[#666666] hover:text-[#111111]'
                          }`}
                        >
                          <Clock className={`w-4 h-4 ${activityMode === 'compromiso' ? 'text-amber-500' : 'text-[#888888]'}`} />
                          <span>Compromiso / Cita Futura (Pendiente)</span>
                        </button>
                      </div>

                      {/* Selector de Tipo de Actividad adaptativo */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                          <Plus className="w-4 h-4 text-[#29008e]" />
                          {activityMode === 'minuta' ? 'Registrar Minuta Institucional' : 'Programar Compromiso o Cita'}
                        </span>
                        <div className="flex items-center gap-1 overflow-x-auto">
                          {activityMode === 'minuta' ? (
                            ([
                              { id: 'call', label: 'Llamada' },
                              { id: 'meeting', label: 'Reunión' },
                              { id: 'email', label: 'Email' },
                              { id: 'note', label: 'Nota' }
                            ] as const).map(({ id, label }) => (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setActivityType(id)}
                                className={`text-xs px-3 py-1 rounded-lg font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                                  activityType === id
                                    ? 'btn-primary-develop shadow-xs'
                                    : 'bg-black/5 text-[#555555] hover:bg-black/10'
                                }`}
                              >
                                {label}
                              </button>
                            ))
                          ) : (
                            ([
                              { id: 'call', label: 'Llamada Programada' },
                              { id: 'meeting', label: 'Cita Presencial' },
                              { id: 'task', label: 'Tarea de Seguimiento' }
                            ] as const).map(({ id, label }) => (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setActivityType(id)}
                                className={`text-xs px-3 py-1 rounded-lg font-semibold shrink-0 whitespace-nowrap transition-all cursor-pointer ${
                                  activityType === id
                                    ? 'btn-primary-develop shadow-xs'
                                    : 'bg-black/5 text-[#555555] hover:bg-black/10'
                                }`}
                              >
                                {label}
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      <form onSubmit={handleCreateActivity} className="space-y-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              required
                              placeholder={
                                activityMode === 'minuta'
                                  ? activityType === 'call'
                                    ? 'Ej: Llamada con Rectoría sobre firma de convenio dual...'
                                    : activityType === 'meeting'
                                    ? 'Ej: Reunión presencial para mostrar kit de hackathon...'
                                    : activityType === 'email'
                                    ? 'Ej: Envío de propuesta formal por correo institucional...'
                                    : 'Ej: Nota sobre requerimientos de rectoría...'
                                  : activityType === 'call'
                                  ? 'Ej: Llamada de seguimiento para confirmar fecha de visita...'
                                  : activityType === 'meeting'
                                  ? 'Ej: Cita presencial con Director de Vinculación...'
                                  : 'Ej: Tarea: Enviar cotización y kit comercial a rectoría...'
                              }
                              value={activityTitle}
                              onChange={(e) => setActivityTitle(e.target.value)}
                              className="input-develop w-full"
                            />
                          </div>
                          <div>
                            <input
                              type="date"
                              required
                              value={activityDate}
                              onChange={(e) => setActivityDate(e.target.value)}
                              className="input-develop w-full font-semibold text-[#0f094f]"
                              title={activityMode === 'minuta' ? 'Fecha de realización' : 'Fecha programada'}
                            />
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          placeholder={
                            activityMode === 'minuta'
                              ? 'Acuerdos alcanzados, minutas institucionales, puntos tratados...'
                              : 'Objetivo del compromiso, temas a tratar, requerimientos para la cita...'
                          }
                          value={activityDesc}
                          onChange={(e) => setActivityDesc(e.target.value)}
                          className="input-develop w-full"
                        />

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="btn-primary-develop px-5 py-2 font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            {activityMode === 'minuta' ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Guardar Minuta Realizada</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-4 h-4" />
                                <span>Programar Compromiso Futuro</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Timeline Cronológico de Interacciones */}
                    <div className="space-y-3.5 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="text-[10px] font-bold uppercase text-[#888888] tracking-widest">
                          Línea de Tiempo & Registro Histórico
                        </h4>
                        <div className="inline-flex items-center p-1 rounded-xl bg-black/5 gap-1 shrink-0 overflow-x-auto">
                          <button
                            type="button"
                            onClick={() => setFiltroTimeline('todas')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              filtroTimeline === 'todas'
                                ? 'bg-white text-[#0f094f] shadow-xs'
                                : 'text-[#666666] hover:text-[#111111]'
                            }`}
                          >
                            Todas ({companyActivities.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setFiltroTimeline('pendientes')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              filtroTimeline === 'pendientes'
                                ? 'bg-amber-100 text-amber-900 shadow-xs'
                                : 'text-[#666666] hover:text-[#111111]'
                            }`}
                          >
                            Pendientes ({pendientesCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setFiltroTimeline('completadas')}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                              filtroTimeline === 'completadas'
                                ? 'bg-emerald-100 text-emerald-900 shadow-xs'
                                : 'text-[#666666] hover:text-[#111111]'
                            }`}
                          >
                            Historial Realizado ({completadasCount})
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {actividadesFiltradas.map((act) => (
                          <div
                            key={act.id}
                            className={`p-4 bg-white rounded-2xl border transition-all shadow-xs flex items-start gap-3.5 ${
                              act.completed ? 'border-black/5' : 'border-amber-200/80 bg-amber-50/20'
                            }`}
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
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                  <span className="font-bold text-[#111111] truncate">{act.title}</span>
                                  <span className="text-[10px] font-semibold uppercase text-[#555555] bg-black/5 px-2 py-0.5 rounded-md shrink-0">
                                    {act.type === 'call' ? 'Llamada' :
                                     act.type === 'meeting' ? 'Reunión' :
                                     act.type === 'email' ? 'Email' :
                                     act.type === 'task' ? 'Tarea' : 'Nota'}
                                  </span>
                                  {act.completed ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shrink-0">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Realizada</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shrink-0">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      <span>Pendiente</span>
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-[#888888] font-mono shrink-0">{act.date}</span>
                              </div>

                              {act.description && (
                                <p className="text-[#555555] mt-1.5 leading-relaxed">{act.description}</p>
                              )}

                              <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between gap-2 text-[10px]">
                                <div className="text-[#888888] flex items-center gap-1.5">
                                  <span>Registrado por:</span>
                                  <strong className="text-[#0f094f] font-semibold">{act.author}</strong>
                                </div>

                                <div>
                                  {act.completed ? (
                                    onToggleActivity && (
                                      <button
                                        type="button"
                                        onClick={() => onToggleActivity(act.id)}
                                        className="text-[#888888] hover:text-[#111111] font-semibold underline cursor-pointer transition-colors"
                                        title="Reabrir compromiso como pendiente"
                                      >
                                        Reabrir
                                      </button>
                                    )
                                  ) : (
                                    onToggleActivity && (
                                      <button
                                        type="button"
                                        onClick={() => onToggleActivity(act.id)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 rounded-xl shadow-xs transition-all cursor-pointer"
                                        title="Marcar compromiso como realizado"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Marcar como Realizada</span>
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {actividadesFiltradas.length === 0 && (
                          <div className="text-center py-10 text-[#888888] text-xs card-light rounded-2xl">
                            {filtroTimeline === 'pendientes'
                              ? 'No hay compromisos pendientes para este campus.'
                              : filtroTimeline === 'completadas'
                              ? 'No hay actividades realizadas registradas en este expediente.'
                              : 'No hay actividades registradas recientemente en este expediente.'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* PESTAÑA 2: TALENTO ESTUDIANTIL CAPTADO (QR) */}
                {pestanaExpediente === 'alumnos' && (
                  <div className="space-y-4 flex-1">
                    {/* Barra de búsqueda por nombre, carrera o correo */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex items-center flex-1">
                        <Search className="w-3.5 h-3.5 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre, carrera o correo..."
                          value={busquedaAlumnos}
                          onChange={(e) => setBusquedaAlumnos(e.target.value)}
                          className="input-develop input-develop-con-icono w-full text-xs"
                        />
                      </div>
                      {busquedaAlumnos && (
                        <button
                          type="button"
                          onClick={() => setBusquedaAlumnos('')}
                          className="px-3 py-2 text-xs font-semibold text-[#555555] hover:text-[#111111] bg-black/5 rounded-xl transition-colors"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>

                    {/* Estado de carga */}
                    {cargandoAlumnos ? (
                      <div className="flex flex-col items-center justify-center py-16 space-y-3">
                        <Loader2 className="w-8 h-8 text-[#29008e] animate-spin" />
                        <span className="text-xs text-[#555555] font-medium">
                          Consultando alumnos registrados en PostgreSQL...
                        </span>
                      </div>
                    ) : alumnosCaptados.length === 0 ? (
                      /* Estado vacío cuando la universidad no tiene alumnos registrados */
                      <div className="card-light p-8 text-center rounded-2xl space-y-3 border border-black/5">
                        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0f094f]/5 text-[#0f094f] flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-[#29008e]" />
                        </div>
                        <div className="max-w-md mx-auto">
                          <h5 className="font-bold text-sm text-[#111111]">Sin Prospectos Estudiantiles Captados</h5>
                          <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                            Aún no hay prospectos captados vía QR para esta institución. Puedes compartir el código QR en el stand del campus durante las activaciones para registrar talento en tiempo real.
                          </p>
                        </div>
                      </div>
                    ) : alumnosFiltrados.length === 0 ? (
                      /* Estado vacío cuando el filtro no coincide */
                      <div className="card-light p-8 text-center rounded-2xl border border-black/5">
                        <p className="text-xs text-[#888888]">
                          No se encontraron alumnos que coincidan con "{busquedaAlumnos}".
                        </p>
                      </div>
                    ) : (
                      /* Cuadrícula de tarjetas de alumnos */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {alumnosFiltrados.map((alumno) => {
                          const badge = (() => {
                            switch (alumno.estatus) {
                              case 'contactado':
                                return { etiqueta: 'Contactado', clases: 'bg-blue-50 text-blue-700 border-blue-200' };
                              case 'interesado':
                                return { etiqueta: 'Interesado', clases: 'bg-purple-50 text-purple-700 border-purple-200' };
                              case 'inscrito':
                                return { etiqueta: 'Inscrito', clases: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
                              case 'descartado':
                                return { etiqueta: 'Descartado', clases: 'bg-black/5 text-[#555555] border-black/10' };
                              case 'registrado':
                              default:
                                return { etiqueta: 'Registrado QR', clases: 'bg-[#640354]/10 text-[#640354] border-[#640354]/20' };
                            }
                          })();

                          const soloNumeros = alumno.telefono ? alumno.telefono.replace(/\D/g, '') : '';
                          const telLimpio = soloNumeros.startsWith('52') && soloNumeros.length >= 12
                            ? soloNumeros.substring(2)
                            : soloNumeros;
                          const primerNombre = alumno.nombre_completo.split(' ')[0] || alumno.nombre_completo;
                          const urlWhatsapp = alumno.telefono
                            ? `https://wa.me/52${telLimpio}?text=Hola%20${encodeURIComponent(primerNombre)}%2C%20te%20contactamos%20de%20Develop...`
                            : null;

                          return (
                            <div
                              key={alumno.id}
                              className="card-light p-4 rounded-2xl flex flex-col justify-between border border-black/5 hover:border-[#29008e]/30 transition-all shadow-xs"
                            >
                              <div className="space-y-2.5">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h5 className="font-bold text-xs text-[#111111] truncate" title={alumno.nombre_completo}>
                                      {alumno.nombre_completo}
                                    </h5>
                                    <div
                                      className="text-[11px] text-[#555555] flex items-center gap-1 mt-0.5 truncate"
                                      title={alumno.carrera_texto || 'Carrera sin registrar'}
                                    >
                                      <GraduationCap className="w-3.5 h-3.5 text-[#29008e] shrink-0" />
                                      <span className="truncate">{alumno.carrera_texto || 'Carrera sin registrar'}</span>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${badge.clases}`}>
                                    {badge.etiqueta}
                                  </span>
                                </div>

                                <div className="pt-2 border-t border-black/5 space-y-1.5 text-[11px] text-[#555555]">
                                  {alumno.semestre_actual && (
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3 h-3 text-[#888888] shrink-0" />
                                      <span>Semestre: <strong>{alumno.semestre_actual}°</strong></span>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1.5 truncate">
                                    <Mail className="w-3 h-3 text-[#888888] shrink-0" />
                                    <a
                                      href={`mailto:${alumno.correo_electronico}`}
                                      className="text-[#0f094f] hover:text-[#29008e] hover:underline truncate font-medium"
                                    >
                                      {alumno.correo_electronico}
                                    </a>
                                  </div>

                                  {alumno.telefono && (
                                    <div className="flex items-center gap-1.5">
                                      <Phone className="w-3 h-3 text-[#888888] shrink-0" />
                                      <a
                                        href={`tel:${alumno.telefono}`}
                                        className="text-[#0f094f] hover:text-[#29008e] hover:underline font-medium"
                                      >
                                        {alumno.telefono}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {urlWhatsapp && (
                                <div className="mt-3 pt-2.5 border-t border-black/5 flex justify-end">
                                  <a
                                    href={urlWhatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WhatsApp</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
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
