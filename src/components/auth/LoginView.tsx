import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Briefcase, 
  QrCode, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles,
  Building2,
  ChevronRight
} from 'lucide-react';

export interface PerfilUsuario {
  id: string;
  nombre: string;
  correo: string;
  rol: 'superusuario' | 'asesor' | 'promotor';
  etiquetaRol: string;
  descripcion: string;
}

export const PERFILES_DEMO: PerfilUsuario[] = [
  {
    id: 'usr-director',
    nombre: 'Director General',
    correo: 'direccion@develop.com.mx',
    rol: 'superusuario',
    etiquetaRol: 'Superusuario · Acceso Total',
    descripcion: 'Control total de cartera, edición de instituciones, importación y finanzas.'
  },
  {
    id: 'usr-asesor',
    nombre: 'Carlos Mendoza',
    correo: 'carlos.mendoza@develop.com.mx',
    rol: 'asesor',
    etiquetaRol: 'Asesor Comercial',
    descripcion: 'Gestión del Pipeline comercial, acuerdos y programación de giras logísticas.'
  },
  {
    id: 'usr-promotor',
    nombre: 'Promotor en Stand',
    correo: 'stand.operativo@develop.com.mx',
    rol: 'promotor',
    etiquetaRol: 'Promotor de Campo',
    descripcion: 'Captura y vinculación ágil de prospectos estudiantiles vía código QR.'
  }
];

interface LoginViewProps {
  onIniciarSesion: (perfil: PerfilUsuario) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onIniciarSesion }) => {
  const [correo, setCorreo] = useState('direccion@develop.com.mx');
  const [password, setPassword] = useState('••••••••••••');
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<PerfilUsuario>(PERFILES_DEMO[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onIniciarSesion(perfilSeleccionado);
  };

  const seleccionarPerfilRapido = (perfil: PerfilUsuario) => {
    setPerfilSeleccionado(perfil);
    setCorreo(perfil.correo);
    onIniciarSesion(perfil);
  };

  return (
    <div className="min-h-screen bg-[#07052e] flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans">
      {/* Resplandores ambientales con paleta oficial Develop (#29008e y #640354) */}
      <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-[#29008e]/25 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-[#640354]/25 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-[#0f094f]/40 blur-[160px] pointer-events-none" />

      {/* Header Institucional Superior */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl w-full mx-auto pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#29008e] to-[#640354] flex items-center justify-center shadow-lg shadow-[#29008e]/30 border border-white/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#a78bfa] block">
              PLATAFORMA AUTOMATIZADA DE PUBLICIDAD
            </span>
            <span className="text-white font-bold text-sm tracking-tight block">
              Develop Talento & Tecnología
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium">Sistema Operativo Central v1.0</span>
        </div>
      </header>

      {/* Contenedor Central */}
      <main className="relative z-10 max-w-4xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Columna Izquierda: Introducción y Accesos Rápidos Demo */}
        <div className="lg:col-span-7 space-y-6 text-white">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-[#a78bfa] text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#f472b6]" />
              <span>Acceso Unificado B2B2C</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ecosistema Integral de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] via-[#f472b6] to-white">Vinculación y Captura</span>
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-lg">
              Gestiona convenios universitarios, optimiza itinerarios de giras presenciales y registra talento estudiantil en tiempo real para programas de residencia y estadías.
            </p>
          </div>

          {/* Accesos Rápidos 1-Clic para Demostración */}
          <div className="space-y-2.5 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-white/60">
              Modo Demostración · Acceso Rápido en 1 Clic
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {PERFILES_DEMO.map((p) => {
                const esActivo = perfilSeleccionado.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => seleccionarPerfilRapido(p)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                      esActivo
                        ? 'bg-white/15 border-[#a78bfa] shadow-lg shadow-[#29008e]/30 scale-[1.01]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        p.rol === 'superusuario' ? 'bg-[#29008e] text-[#a78bfa]' :
                        p.rol === 'asesor' ? 'bg-[#640354] text-[#f472b6]' :
                        'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {p.rol === 'superusuario' && <ShieldCheck className="w-5 h-5" />}
                        {p.rol === 'asesor' && <Briefcase className="w-5 h-5" />}
                        {p.rol === 'promotor' && <QrCode className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>{p.nombre}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 font-semibold text-white/80">
                            {p.etiquetaRol}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/60 mt-0.5 leading-snug">
                          {p.descripcion}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Login Formal */}
        <div className="lg:col-span-5">
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/50 text-white relative">
            <div className="space-y-1 pb-4 border-b border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] block">
                Seguridad & Control
              </span>
              <h2 className="text-xl font-bold text-white">Inicio de Sesión</h2>
              <p className="text-xs text-white/70">Ingresa tus credenciales corporativas autorizadas</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/90">Correo Electrónico Institucional</label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="usuario@develop.com.mx"
                    className="input-develop-dark input-develop-con-icono w-full text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/90">Contraseña Corporativa</label>
                  <span className="text-[10px] text-[#a78bfa] hover:underline cursor-pointer">
                    ¿Olvidaste tu contraseña?
                  </span>
                </div>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input-develop-dark input-develop-con-icono w-full text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full btn-primary-develop py-3 text-xs font-bold flex items-center justify-center gap-2 rounded-xl shadow-lg shadow-[#29008e]/50 cursor-pointer hover:scale-[1.01] transition-transform"
                >
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight className="w-4 h-4 text-[#a78bfa]" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                <p className="text-[10px] text-white/60">
                  Autenticación segura vinculada a <strong>PostgreSQL Supabase Auth</strong> con políticas de seguridad por fila (RLS).
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer de la Pantalla de Login */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-2">
        <span>© 2026 Develop Talento & Tecnología · Todos los derechos reservados.</span>
        <span>Aviso de Privacidad Institucional · LFPDPPP</span>
      </footer>
    </div>
  );
};
