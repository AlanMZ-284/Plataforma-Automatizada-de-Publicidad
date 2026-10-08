/**
 * Formulario Público de Captura de Alumnos vía Código QR (Cumplimiento LFPDPPP México).
 * Diseñado bajo enfoque Mobile-First estricto para operar en dispositivos móviles en stands
 * universitarios, ferias de empleo, hackathons y conferencias de Develop.
 * 
 * Reglas: 100% en español, colores oficiales Develop (#0f094f, #640354, #29008e, #F8F8FC).
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Mail,
  User,
  Phone,
  Calendar,
  X,
  Lock,
  ArrowRight,
  QrCode
} from 'lucide-react';
import { registrarAlumnoQr } from '../../services/servicioCrm';

interface PropiedadesFormularioRegistroAlumnoQr {
  oportunidadId: string;
  universidadId: string;
  nombreUniversidad?: string;
  tituloEvento?: string;
  carrerasSugeridas?: string[];
  alRegistrarExitoso?: (alumno: {
    nombre_completo: string;
    correo_electronico: string;
    carrera: string;
  }) => void;
  alCerrarVista?: () => void;
  esModal?: boolean;
}

const CARRERAS_COMUNES = [
  'Ingeniería en Sistemas Computacionales',
  'Ingeniería en Software',
  'Ingeniería en Computación',
  'Ingeniería en Tecnologías de la Información',
  'Ingeniería Mecatrónica',
  'Licenciatura en Ciencias de la Computación',
  'Licenciatura en Informática',
  'Ingeniería en Inteligencia Artificial y Datos',
  'Ingeniería Industrial',
  'Otra carrera afín a tecnología'
];

export const FormularioRegistroAlumnoQr: React.FC<PropiedadesFormularioRegistroAlumnoQr> = ({
  oportunidadId,
  universidadId,
  nombreUniversidad = 'Universidad Aliada Develop',
  tituloEvento = 'Feria de Talento & Vinculación Tech',
  carrerasSugeridas,
  alRegistrarExitoso,
  alCerrarVista,
  esModal = false
}) => {
  const listaCarreras = React.useMemo(() => {
    if (carrerasSugeridas && carrerasSugeridas.length > 0) {
      const unicas = Array.from(new Set(carrerasSugeridas));
      return [...unicas, 'Otra carrera afín a tecnología'];
    }
    return CARRERAS_COMUNES;
  }, [carrerasSugeridas]);

  // Estados del formulario
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [telefonoWhatsApp, setTelefonoWhatsApp] = useState('');
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(() => {
    if (carrerasSugeridas && carrerasSugeridas.length > 0) {
      return carrerasSugeridas[0];
    }
    return CARRERAS_COMUNES[0];
  });
  const [otraCarreraTexto, setOtraCarreraTexto] = useState('');
  const [semestreActual, setSemestreActual] = useState('6');
  const [avisoPrivacidadAceptado, setAvisoPrivacidadAceptado] = useState(false);

  // Estados de control de interfaz
  const [modalAvisoAbierto, setModalAvisoAbierto] = useState(false);
  const [estaEnviando, setEstaEnviando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [folioRegistro, setFolioRegistro] = useState('');

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    // Validaciones
    if (!nombreCompleto.trim()) {
      setErrorValidacion('Por favor ingresa tu nombre completo.');
      return;
    }

    if (!correoElectronico.trim() || !correoElectronico.includes('@')) {
      setErrorValidacion('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!avisoPrivacidadAceptado) {
      setErrorValidacion(
        'Es obligatorio aceptar el Aviso de Privacidad para poder tramitar tu vinculación profesional.'
      );
      return;
    }

    const carreraFinal =
      carreraSeleccionada === 'Otra carrera afín a tecnología' && otraCarreraTexto.trim()
        ? otraCarreraTexto.trim()
        : carreraSeleccionada;

    setEstaEnviando(true);

    try {
      await registrarAlumnoQr({
        oportunidad_id: oportunidadId,
        universidad_id: universidadId,
        nombre_completo: nombreCompleto.trim(),
        correo_electronico: correoElectronico.trim().toLowerCase(),
        telefono: telefonoWhatsApp.trim() || undefined,
        carrera: carreraFinal,
        semestre: parseInt(semestreActual, 10) || undefined,
        aviso_privacidad_aceptado: true
      });

      setFolioRegistro(`PAP-${Date.now().toString().slice(-6)}`);
      setRegistroExitoso(true);
      if (alRegistrarExitoso) {
        alRegistrarExitoso({
          nombre_completo: nombreCompleto.trim(),
          correo_electronico: correoElectronico.trim().toLowerCase(),
          carrera: carreraFinal
        });
      }
    } catch (error) {
      console.error('Error al registrar estudiante:', error);
      setErrorValidacion('Ocurrió un error al procesar el registro. Intenta nuevamente.');
    } finally {
      setEstaEnviando(false);
    }
  };

  const reiniciarFormulario = () => {
    setNombreCompleto('');
    setCorreoElectronico('');
    setTelefonoWhatsApp('');
    setOtraCarreraTexto('');
    setAvisoPrivacidadAceptado(false);
    setErrorValidacion(null);
    setRegistroExitoso(false);
  };

  const contenidoTarjeta = (
    <div className={`w-full max-w-lg bg-white rounded-[26px] shadow-develop-modal border border-black/10 overflow-hidden flex flex-col relative animate-fadeIn ${esModal ? 'max-h-[90vh] overflow-y-auto' : ''}`}>
      
      {/* ENCABEZADO DARK PREMIUM DEVELOP */}
      <div className="premium-dark-surface p-6 text-white relative border-b border-white/10 shrink-0">
        
        {/* Botón cerrar si se visualiza dentro del CRM como simulación o modal */}
        {alCerrarVista && (
          <button
            type="button"
            onClick={alCerrarVista}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/90 hover:text-white transition-colors cursor-pointer shadow-sm"
            title="Cerrar formulario"
          >
            <X className="w-4 h-4" />
          </button>
        )}

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#29008e] to-[#640354] p-[1.5px] shadow-develop-glow/40 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#07052e] flex items-center justify-center text-white border border-white/20">
                <QrCode className="w-5 h-5 text-[#a78bfa]" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78bfa]">
                  Develop Talent Program
                </span>
                <span className="w-1 h-1 rounded-full bg-[#f472b6]"></span>
                <span className="text-[9px] text-white/60">México</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {nombreUniversidad}
              </h1>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 relative z-10 flex items-center justify-between text-xs text-white/80">
            <span className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-[#f472b6] shrink-0" />
              <strong className="text-white truncate">{tituloEvento}</strong>
            </span>
            <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-[#29008e]/60 border border-[#a78bfa]/30 font-semibold text-[#a78bfa]">
              Stand Oficial
            </span>
          </div>
        </div>

        {/* PANTALLA DE ÉXITO O FORMULARIO */}
        <div className="p-6 sm:p-7 flex-1 flex flex-col justify-center">
          {registroExitoso ? (
            /* VISTA DE CONFIRMACIÓN EXITOSA */
            <div className="text-center py-6 space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-develop-glow">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ¡Registro Confirmado!
                </span>
                <h2 className="text-xl font-bold text-[#111111] mt-3">
                  ¡Bienvenido a Develop, {nombreCompleto.split(' ')[0]}!
                </h2>
                <p className="text-xs text-[#555555] mt-2 leading-relaxed max-w-sm mx-auto">
                  Tu perfil ha quedado vinculado al convenio de <strong>{nombreUniversidad}</strong>.
                  Revisaremos tu postulación y te contactaremos en{' '}
                  <strong className="text-[#0f094f]">{correoElectronico}</strong> para informarte sobre
                  residencias, bootcamps de certificación y vacantes activas.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F8FC] border border-black/5 text-left text-xs space-y-1.5 text-[#555555]">
                <div className="flex items-center gap-2 font-semibold text-[#111111]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Protección de Datos Personales Garantizada</span>
                </div>
                <p className="text-[11px] text-[#888888]">
                  Folio electrónico: <strong>{folioRegistro || 'PAP-OFICIAL'}</strong>. Cumplimiento
                  con el Aviso de Privacidad de Develop bajo la LFPDPPP.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={reiniciarFormulario}
                  className="btn-secondary-light text-xs px-5 py-2.5 rounded-xl font-bold text-[#29008e] border border-[#29008e]/20 hover:bg-[#29008e]/5 transition-all w-full"
                >
                  Registrar a otro alumno en este stand
                </button>
              </div>
            </div>
          ) : (
            /* FORMULARIO DE CAPTURA EN VIVO */
            <form onSubmit={manejarEnvio} className="space-y-4">
              
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
                  Registro para Estancias & Capacitación Tech
                </h2>
                <p className="text-xs text-[#555555] mt-0.5">
                  Completa tus datos para postularte a las iniciativas de Develop y marcas aliadas.
                </p>
              </div>

              {/* Error si existe */}
              {errorValidacion && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorValidacion}</span>
                </div>
              )}

              {/* Nombre Completo */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Ramírez Mendoza"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    className="input-develop input-develop-con-icono w-full pr-3 text-xs"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="alumno@universidad.edu.mx o personal"
                    value={correoElectronico}
                    onChange={(e) => setCorreoElectronico(e.target.value)}
                    className="input-develop input-develop-con-icono w-full pr-3 text-xs"
                  />
                </div>
              </div>

              {/* Teléfono WhatsApp */}
              <div>
                <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-1">
                  Teléfono Móvil / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="55 1234 5678"
                    value={telefonoWhatsApp}
                    onChange={(e) => setTelefonoWhatsApp(e.target.value)}
                    className="input-develop input-develop-con-icono w-full pr-3 text-xs"
                  />
                </div>
              </div>

              {/* Carrera y Semestre */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Carrera Universitaria *
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={carreraSeleccionada}
                      onChange={(e) => setCarreraSeleccionada(e.target.value)}
                      className="input-develop input-develop-con-icono w-full pr-3 text-xs font-medium cursor-pointer"
                    >
                      {listaCarreras.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Semestre
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={semestreActual}
                      onChange={(e) => setSemestreActual(e.target.value)}
                      className="input-develop input-develop-con-icono w-full pr-3 text-xs font-medium cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                        <option key={num} value={num.toString()}>
                          {num}° Semestre
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Campo para otra carrera si seleccionó 'Otra' */}
              {carreraSeleccionada === 'Otra carrera afín a tecnología' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wider mb-1">
                    Escribe el nombre de tu carrera:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Licenciatura en Telecomunicaciones"
                    value={otraCarreraTexto}
                    onChange={(e) => setOtraCarreraTexto(e.target.value)}
                    className="input-develop w-full text-xs"
                  />
                </div>
              )}

              {/* Casilla de Aviso de Privacidad (Cumplimiento LFPDPPP) */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F8F8FC] border border-black/5 hover:border-[#29008e]/30 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={avisoPrivacidadAceptado}
                    onChange={(e) => setAvisoPrivacidadAceptado(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded text-[#29008e] focus:ring-[#29008e] border-gray-300"
                  />
                  <span className="text-[11px] text-[#555555] leading-relaxed">
                    He leído y acepto el{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setModalAvisoAbierto(true);
                      }}
                      className="text-[#29008e] font-bold underline hover:text-[#640354]"
                    >
                      Aviso de Privacidad
                    </button>{' '}
                    para fines de vinculación académica, estancias y capacitación profesional (LFPDPPP México).
                  </span>
                </label>
              </div>

              {/* Botón de Enviar */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={estaEnviando}
                  className="btn-primary-develop w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-develop-glow transition-all"
                >
                  {estaEnviando ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Registrando estudiante...</span>
                    </>
                  ) : (
                    <>
                      <span>Completar Registro en Stand</span>
                      <ArrowRight className="w-4 h-4 text-[#a78bfa]" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <span className="text-[10px] text-[#888888] flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-[#29008e]" />
                  Transmisión segura y cifrada por Supabase & Develop
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    );

    return (
      <>
        {esModal ? (
          contenidoTarjeta
        ) : (
          <div className="min-h-screen bg-[#F8F8FC] flex flex-col justify-center items-center py-4 px-3 sm:px-6">
            {contenidoTarjeta}
          </div>
        )}

        {/* MODAL SIMPLIFICADO DE AVISO DE PRIVACIDAD LFPDPPP */}
        {modalAvisoAbierto && (
          <div className="fixed inset-0 z-[60] bg-[#07052e]/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[24px] shadow-develop-modal border border-black/10 flex flex-col max-h-[85vh] overflow-hidden animate-fadeIn">
              
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#07052e] to-[#0f094f] text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#a78bfa]" />
                  <h3 className="font-bold text-sm text-white">
                    Aviso de Privacidad Simplificado (LFPDPPP)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAvisoAbierto(false)}
                  className="w-7 h-7 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto text-xs text-[#555555] space-y-3 leading-relaxed">
                <p>
                  En estricto cumplimiento con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> de los Estados Unidos Mexicanos, <strong>Develop Talent Ecosystem</strong> informa:
                </p>

                <div className="p-3 bg-[#F8F8FC] rounded-xl border border-black/5 space-y-1.5">
                  <strong className="text-[#111111] block">1. Finalidades Principales del Tratamiento:</strong>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    <li>Vinculación con programas de residencias y estancias profesionales.</li>
                    <li>Inscripción en convocatorias de becas, hackathons y bootcamps tecnológicos.</li>
                    <li>Envío de invitaciones a capacitaciones de marcas aliadas (AWS, Microsoft, Google Cloud, Cisco, Intel, Oracle).</li>
                  </ul>
                </div>

                <div className="p-3 bg-[#F8F8FC] rounded-xl border border-black/5 space-y-1.5">
                  <strong className="text-[#111111] block">2. Derechos ARCO:</strong>
                  <p className="text-[11px]">
                    Usted tiene derecho en cualquier momento a conocer qué datos personales tenemos, para qué los utilizamos y las condiciones de uso (Acceso); solicitar la corrección de su información (Rectificación); que la eliminemos de nuestros registros (Cancelación); así como oponerse al uso de los mismos para fines específicos (Oposición).
                  </p>
                </div>

                <div className="p-3 bg-[#F8F8FC] rounded-xl border border-black/5 space-y-1.5">
                  <strong className="text-[#111111] block">3. Transferencia de Datos:</strong>
                  <p className="text-[11px]">
                    Sus datos personales únicamente podrán ser compartidos con la institución universitaria donde cursa sus estudios ({nombreUniversidad}) para validar su matrícula y estatus académico.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-black/10 bg-white flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalAvisoAbierto(false)}
                  className="btn-primary-develop text-xs px-5 py-2 rounded-xl font-bold"
                >
                  Entendido y de Acuerdo
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };
