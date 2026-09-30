import React, { useState, useMemo } from 'react';
import { Deal, Company } from '../../types';
import {
  CampanaMarketing,
  PublicacionMarketing,
  RedSocial,
  EstadoPublicacion,
  obtenerCampanasGuardadas,
  guardarCampana,
  actualizarEstadoPublicacion,
  generarCampanaAutomaticaParaOportunidad,
  calcularMetricasSponsors
} from '../../services/servicioMarketing';
import { GeneradorQrVectorial } from '../events-kit/GeneradorQrVectorial';
import {
  Share2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Search,
  Building2,
  Eye,
  X,
  Target,
  BarChart3,
  TrendingUp,
  Layers,
  ChevronRight,
  Plus
} from 'lucide-react';

interface MarketingAutomationModuleProps {
  deals: Deal[];
  companies: Company[];
  onNavigateToDeal?: (dealId: string) => void;
}

export const MarketingAutomationModule: React.FC<MarketingAutomationModuleProps> = ({
  deals,
  companies
}) => {
  const [campanas, setCampanas] = useState<CampanaMarketing[]>(() => obtenerCampanasGuardadas());
  const [filtroRed, setFiltroRed] = useState<string>('todas');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroUniversidadId, setFiltroUniversidadId] = useState<string>('todas');
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  
  // Post seleccionado para vista previa en modal
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState<PublicacionMarketing | null>(null);

  // Selector para disparar manualmente campaña para cualquier oportunidad
  const [dealSeleccionadoParaDisparo, setDealSeleccionadoParaDisparo] = useState<string>(deals[0]?.id || '');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [textoCopiado, setTextoCopiado] = useState<boolean>(false);

  // Subpestaña principal: 'parrilla' | 'patrocinadores'
  const [seccionActiva, setSeccionActiva] = useState<'parrilla' | 'patrocinadores'>('parrilla');

  // Métrica calculada de patrocinadores en vivo
  const metricasPatrocinadores = useMemo(() => {
    return calcularMetricasSponsors(campanas, deals);
  }, [campanas, deals]);

  // Recopilar todas las publicaciones individuales de todas las campañas
  const todasLasPublicaciones = useMemo(() => {
    const listado: PublicacionMarketing[] = [];
    campanas.forEach((campana) => {
      campana.publicaciones.forEach((pub) => {
        listado.push(pub);
      });
    });
    // Ordenar cronológicamente por fecha programada
    return listado.sort((a, b) => a.fechaProgramada.localeCompare(b.fechaProgramada));
  }, [campanas]);

  // Filtrado de publicaciones
  const publicacionesFiltradas = useMemo(() => {
    return todasLasPublicaciones.filter((pub) => {
      const coincideRed = filtroRed === 'todas' || pub.redSocial === filtroRed;
      const coincideEstado = filtroEstado === 'todos' || pub.estado === filtroEstado;
      const coincideUniversidad = filtroUniversidadId === 'todas' || pub.universidadId === filtroUniversidadId;
      const coincideBusqueda =
        !terminoBusqueda.trim() ||
        pub.titulo.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        pub.universidadNombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        pub.copyTexto.toLowerCase().includes(terminoBusqueda.toLowerCase());

      return coincideRed && coincideEstado && coincideUniversidad && coincideBusqueda;
    });
  }, [todasLasPublicaciones, filtroRed, filtroEstado, filtroUniversidadId, terminoBusqueda]);

  // Cambiar estado de un post (ej. Programado -> Publicado)
  const handleCambiarEstadoPost = (post: PublicacionMarketing, nuevoEstado: EstadoPublicacion) => {
    actualizarEstadoPublicacion(post.id, nuevoEstado);
    setCampanas(obtenerCampanasGuardadas());
    if (publicacionSeleccionada?.id === post.id) {
      setPublicacionSeleccionada({ ...post, estado: nuevoEstado });
    }
  };

  // Disparo manual para generar o actualizar campaña de un deal
  const handleGenerarCampanaManual = () => {
    const trato = deals.find((d) => d.id === dealSeleccionadoParaDisparo);
    if (!trato) return;
    const empresa = companies.find((c) => c.id === trato.companyId) || {
      id: trato.companyId,
      name: 'Universidad Aliada',
      type: 'universidad',
      state: 'CDMX',
      municipality: 'Valle de México',
      address: '',
      lat: 19.43,
      lng: -99.13,
      phone: '',
      email: '',
      directorName: '',
      studentCount: 3000,
      monthlyTuition: 3000,
      leadScore: 80,
      status: 'prospecto',
      tags: []
    };

    const nuevaCampana = generarCampanaAutomaticaParaOportunidad(trato, empresa);
    guardarCampana(nuevaCampana);
    setCampanas(obtenerCampanasGuardadas());

    setMensajeExito(
      `¡Campaña multicanal generada exitosamente para ${empresa.name}! Se programaron 4 piezas para Meta, Instagram, TikTok y LinkedIn.`
    );
    setTimeout(() => setMensajeExito(null), 5000);
  };

  // Copiar copy al portapapeles
  const handleCopiarCopy = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setTextoCopiado(true);
      setTimeout(() => setTextoCopiado(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Renderizar icono/badge de red social
  const renderIconoRed = (red: RedSocial) => {
    switch (red) {
      case 'linkedin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-[#0077b5]/10 text-[#0077b5] border border-[#0077b5]/20">
            LinkedIn B2B
          </span>
        );
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-[#e1306c]/10 text-[#e1306c] border border-[#e1306c]/20">
            Instagram 9:16
          </span>
        );
      case 'tiktok':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-[#000000]/10 text-[#111111] border border-black/20">
            TikTok Video
          </span>
        );
      case 'meta':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-[#1877f2]/10 text-[#1877f2] border border-[#1877f2]/20">
            Meta / WhatsApp
          </span>
        );
    }
  };

  const renderBadgeEstado = (estado: EstadoPublicacion) => {
    switch (estado) {
      case 'publicado':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Publicado
          </span>
        );
      case 'programado':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#29008e] bg-[#29008e]/10 px-2 py-0.5 rounded-full border border-[#29008e]/20">
            <Clock className="w-3 h-3 text-[#29008e]" />
            Programado
          </span>
        );
      case 'pendiente_aprobacion':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Pendiente
          </span>
        );
    }
  };

  return (
    <div className="space-y-7">
      {/* HEADER HERO ESTÁTICO DEVELOP */}
      <div className="internal-hero-surface rounded-[20px] sm:rounded-[28px] p-4 sm:p-7 lg:p-8 shadow-develop-modal border border-white/10 text-white relative">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 pill-dark text-xs font-bold uppercase tracking-widest text-[#a78bfa]">
              <Share2 className="w-3.5 h-3.5" />
              Develop Automation Suite · Marketing Multicanal & Patrocinios
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Automatización de Marketing & <span className="gradient-text">Sponsor Tracking</span>
            </h1>
            <p className="text-white/70 text-xs lg:text-sm leading-relaxed">
              Disparador automático de campañas al agendar fechas de gira: genera parrillas de difusión segmentadas por canal (Meta, Instagram, TikTok, LinkedIn) y monitorea el cumplimiento de exposición de marcas aliadas (AWS, Microsoft, Google Cloud, Cisco).
            </p>
          </div>

          {/* Selector de Disparo Manual de Campaña */}
          <div className="card-glass-dark p-4 rounded-2xl border border-white/20 space-y-3 shrink-0 max-w-sm w-full text-xs">
            <div className="font-bold text-white flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-[#a78bfa]" />
              Disparador Automático de Campaña
            </div>
            <select
              value={dealSeleccionadoParaDisparo}
              onChange={(e) => setDealSeleccionadoParaDisparo(e.target.value)}
              className="w-full bg-[#07052e]/90 text-white text-xs p-2 rounded-xl border border-white/20 focus:outline-none"
            >
              {deals.map((d) => (
                <option key={d.id} value={d.id} className="bg-[#0f094f]">
                  {d.title} ({d.stage})
                </option>
              ))}
            </select>
            <button
              onClick={handleGenerarCampanaManual}
              className="btn-primary-dark w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#29008e]" />
              Disparar Campaña Multicanal
            </button>
          </div>
        </div>
      </div>

      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {/* TABS DE SECCIÓN: PARRILLA vs. PATROCINADORES */}
      <div className="card-light rounded-[28px] overflow-hidden">
        <div className="flex border-b border-black/5 bg-[#F8F8FC] px-4 pt-3 gap-2">
          <button
            onClick={() => setSeccionActiva('parrilla')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
              seccionActiva === 'parrilla'
                ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                : 'border-transparent text-[#555555] hover:text-[#111111]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#0f094f]" />
            Parrilla de Publicaciones Multicanal ({publicacionesFiltradas.length})
          </button>

          <button
            onClick={() => setSeccionActiva('patrocinadores')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-t border-x ${
              seccionActiva === 'patrocinadores'
                ? 'bg-white border-black/5 text-[#0f094f] shadow-xs border-b-2 border-b-white -mb-[1px]'
                : 'border-transparent text-[#555555] hover:text-[#111111]'
            }`}
          >
            <Target className="w-4 h-4 text-[#640354]" />
            Sponsor Tracking & Exposición de Marcas
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-7">
          {/* ============================================================== */}
          {/* SECCIÓN 1: PARRILLA DE CONTENIDOS Y CALENDARIO                 */}
          {/* ============================================================== */}
          {seccionActiva === 'parrilla' && (
            <div className="space-y-6">
              {/* Barra de Filtros Rápidos */}
              <div className="card-light p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  {/* Búsqueda */}
                  <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                    <input
                      type="text"
                      value={terminoBusqueda}
                      onChange={(e) => setTerminoBusqueda(e.target.value)}
                      placeholder="Buscar por copy, campus o tema..."
                      className="input-develop w-full pl-8 text-xs"
                    />
                  </div>

                  {/* Filtro por Red Social */}
                  <select
                    value={filtroRed}
                    onChange={(e) => setFiltroRed(e.target.value)}
                    className="input-develop text-xs font-semibold"
                  >
                    <option value="todas">Todas las Redes</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="meta">Meta / WhatsApp</option>
                  </select>

                  {/* Filtro por Estado */}
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="input-develop text-xs font-semibold"
                  >
                    <option value="todos">Todos los Estados</option>
                    <option value="programado">Programados</option>
                    <option value="publicado">Publicados</option>
                    <option value="pendiente_aprobacion">Pendientes</option>
                  </select>

                  {/* Filtro por Universidad */}
                  <select
                    value={filtroUniversidadId}
                    onChange={(e) => setFiltroUniversidadId(e.target.value)}
                    className="input-develop text-xs font-semibold max-w-[220px]"
                  >
                    <option value="todas">Todas las Universidades</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-[11px] text-[#888888] font-medium">
                  Mostrando <strong>{publicacionesFiltradas.length}</strong> publicaciones
                </div>
              </div>

              {/* Grid de Tarjetas de Publicaciones */}
              {publicacionesFiltradas.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#888888] card-light rounded-2xl">
                  No se encontraron publicaciones con los filtros aplicados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {publicacionesFiltradas.map((post) => (
                    <div
                      key={post.id}
                      className="card-light card-light-hover p-4 sm:p-5 rounded-2xl border border-black/5 flex flex-col justify-between space-y-4"
                    >
                      {/* Cabecera de la Tarjeta */}
                      <div>
                        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-black/5">
                          {renderIconoRed(post.redSocial)}
                          {renderBadgeEstado(post.estado)}
                        </div>

                        {/* Universidad y Fecha */}
                        <div className="mt-3 flex items-center justify-between text-[11px] text-[#888888]">
                          <span className="truncate max-w-[180px] font-bold text-[#0f094f]">
                            {post.universidadNombre}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-[#29008e]" />
                            {post.fechaProgramada} • {post.horaProgramada}
                          </span>
                        </div>

                        {/* Título y Extracto del Copy */}
                        <h4 className="font-extrabold text-sm text-[#111111] mt-2 leading-snug">
                          {post.titulo}
                        </h4>
                        <p className="text-xs text-[#555555] mt-2 line-clamp-3 leading-relaxed">
                          {post.copyTexto}
                        </p>

                        {/* Hashtags */}
                        <div className="mt-3 flex flex-wrap gap-1">
                          {post.hashtags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-[9px] px-1.5 py-0.5 bg-black/5 rounded text-[#555555] font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer con Métricas y Botón de Vista Previa */}
                      <div className="pt-3 border-t border-black/5 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-[#888888]">
                          Proyección: <strong className="text-[#111111]">{(post.impresionesReales || post.impresionesEstimadas).toLocaleString('es-MX')} imp.</strong>
                        </div>

                        <button
                          onClick={() => setPublicacionSeleccionada(post)}
                          className="btn-primary-develop px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#a78bfa]" />
                          Ver Copy & QR
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SECCIÓN 2: SPONSOR TRACKING & MARCAS ALIADAS                    */}
          {/* ============================================================== */}
          {seccionActiva === 'patrocinadores' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-black/5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#111111] flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#0f094f]" />
                    Cumplimiento de Exposición Institucional (Sponsors TI)
                  </h3>
                  <p className="text-xs text-[#555555] mt-0.5">
                    Monitoreo de impresiones pactadas vs. alcanzadas en mamparas, redes y kits de Develop.
                  </p>
                </div>
              </div>

              {/* Grid de Tarjetas de Marcas Patrocinadoras */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {metricasPatrocinadores.map((sponsor) => (
                  <div
                    key={sponsor.marca}
                    className="card-light p-5 rounded-2xl border border-black/5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#111111]">{sponsor.marca}</span>
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: sponsor.colorIdentidad }}
                      />
                    </div>

                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#888888]">Cumplimiento:</div>
                      <div className="text-2xl font-black text-[#0f094f] mt-0.5">
                        {sponsor.porcentajeCumplimiento}%
                      </div>
                      {/* Barra de progreso */}
                      <div className="w-full bg-black/5 rounded-full h-2 mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${sponsor.porcentajeCumplimiento}%`,
                            backgroundColor: sponsor.colorIdentidad
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-black/5 text-xs">
                      <div className="flex justify-between text-[#555555]">
                        <span>Impresiones Logradas:</span>
                        <strong className="text-[#111111]">{sponsor.impresionesLogradas.toLocaleString('es-MX')}</strong>
                      </div>
                      <div className="flex justify-between text-[#555555]">
                        <span>Meta Proyectada:</span>
                        <span>{sponsor.impresionesProyectadas.toLocaleString('es-MX')}</span>
                      </div>
                      <div className="flex justify-between text-[#555555]">
                        <span>Menciones en Kits:</span>
                        <strong className="text-[#29008e]">{sponsor.mencionesEnKits} piezas</strong>
                      </div>
                      <div className="flex justify-between text-[#555555]">
                        <span>Eventos Activos:</span>
                        <strong className="text-[#640354]">{sponsor.eventosActivos} campus</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL DE VISTA PREVIA DEL COPY Y CÓDIGO QR                     */}
      {/* ============================================================== */}
      {publicacionSeleccionada && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-develop-modal border border-black/10 p-6 space-y-5">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                {renderIconoRed(publicacionSeleccionada.redSocial)}
                <span className="font-extrabold text-sm text-[#111111]">
                  Vista Previa de Publicación Multicanal
                </span>
              </div>
              <button
                onClick={() => setPublicacionSeleccionada(null)}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#888888] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos de Programación */}
            <div className="bg-[#F8F8FC] p-4 rounded-2xl border border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#888888] block">Universidad:</span>
                <span className="font-bold text-[#111111]">{publicacionSeleccionada.universidadNombre}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#888888] block">Programación:</span>
                <span className="font-mono text-[#0f094f]">
                  {publicacionSeleccionada.fechaProgramada} a las {publicacionSeleccionada.horaProgramada} hrs
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#888888] block">Estado Actual:</span>
                {renderBadgeEstado(publicacionSeleccionada.estado)}
              </div>
            </div>

            {/* Texto del Copy Redactado */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111111] uppercase tracking-wider">
                  Copy Oficial Adaptado al Tono de la Red:
                </span>
                <button
                  onClick={() => handleCopiarCopy(publicacionSeleccionada.copyTexto)}
                  className="text-[11px] text-[#29008e] font-bold flex items-center gap-1 hover:underline"
                >
                  {textoCopiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {textoCopiado ? '¡Copiado!' : 'Copiar Texto'}
                </button>
              </div>

              <div className="bg-[#F8F8FC] p-4 rounded-2xl border border-black/5 text-xs text-[#222222] whitespace-pre-line leading-relaxed font-sans">
                {publicacionSeleccionada.copyTexto}
              </div>

              {/* Hashtags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {publicacionSeleccionada.hashtags.map((h, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-black/5 text-[#29008e] rounded-md font-mono text-[10px] font-semibold">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Código QR Asociado al Post */}
            <div className="p-4 bg-gradient-to-r from-[#0f094f]/5 to-[#29008e]/5 rounded-2xl border border-[#0f094f]/10 flex flex-col sm:flex-row items-center gap-5">
              <div className="shrink-0 bg-white p-2 rounded-xl shadow-xs border border-black/10">
                <GeneradorQrVectorial
                  oportunidadId={publicacionSeleccionada.dealId}
                  nombreEvento={publicacionSeleccionada.titulo}
                  nombreInstitucion={publicacionSeleccionada.universidadNombre}
                  tamano={120}
                  mostrarBotonesDescarga={false}
                  mostrarEnlace={false}
                  etiquetaInstruccion=""
                />
              </div>

              <div className="text-left space-y-1 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#29008e]">
                  Llamado a la Acción (CTA)
                </div>
                <div className="font-extrabold text-[#111111]">{publicacionSeleccionada.cta}</div>
                <div className="text-[11px] text-[#555555]">
                  Apunta a la landing del formulario móvil para registrar alumnos en tiempo real.
                </div>
              </div>
            </div>

            {/* Acciones de Estado */}
            <div className="pt-3 border-t border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#555555] font-medium">Cambiar estado:</span>
                <button
                  onClick={() => handleCambiarEstadoPost(publicacionSeleccionada, 'publicado')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs"
                >
                  Marcar Publicado
                </button>
                <button
                  onClick={() => handleCambiarEstadoPost(publicacionSeleccionada, 'programado')}
                  className="px-3 py-1.5 bg-[#0f094f] hover:bg-[#29008e] text-white rounded-xl font-bold transition-all shadow-xs"
                >
                  Marcar Programado
                </button>
              </div>

              <button
                onClick={() => setPublicacionSeleccionada(null)}
                className="btn-secondary-light px-4 py-2 font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
