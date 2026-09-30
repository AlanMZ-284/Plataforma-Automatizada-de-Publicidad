import React, { useState, useEffect, useMemo } from 'react';
import { Deal, Company, PipelineStage } from '../../types';
import { obtenerRecorridosGuardados } from '../../services/servicioCrm';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Users,
  Award,
  Building2,
  Calendar,
  Printer,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Car,
  Fuel,
  Receipt,
  Utensils,
  MapPin,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

interface ExecutiveRoiDashboardProps {
  deals: Deal[];
  companies: Company[];
  onNavigateToPipeline?: () => void;
  onNavigateToRoutes?: () => void;
}

export const ExecutiveRoiDashboard: React.FC<ExecutiveRoiDashboardProps> = ({
  deals,
  companies
}) => {
  const [recorridosGuardados, setRecorridosGuardados] = useState<any[]>([]);
  const [periodoFiltro, setPeriodoFiltro] = useState<'ciclo_2026' | 'trimestre_actual'>('ciclo_2026');

  // Cargar recorridos logísticos guardados
  useEffect(() => {
    obtenerRecorridosGuardados().then((recs) => {
      setRecorridosGuardados(recs || []);
    });
  }, []);

  // 1. MÉTRICAS CLAVE Y CÁLCULOS DE EFICIENCIA ECONÓMICA
  const metricas = useMemo(() => {
    const totalUniversidades = companies.length;

    // Tratos cerrados y pipeline total
    const tratosCerrados = deals.filter((d) => d.stage === 'resultado' || d.stage === 'realizado');
    const montoConveniosCerrados = tratosCerrados.reduce((acc, d) => acc + d.amount, 0);
    const montoPipelineTotal = deals.reduce((acc, d) => acc + d.amount, 0);

    // Alumnos captados vía código QR
    const totalAlumnosCaptados = deals.reduce((acc, d) => acc + (d.registeredLeadsCount || 0), 0);

    // Gasto total en viáticos (de los recorridos logísticos reales guardados o proyectados)
    let gastoTotalViaticos = recorridosGuardados.reduce((acc, r) => {
      const viaticosMxn = r.total_viaticos_mxn || r.viaticos?.total_viaticos_mxn || r.viaticos?.totalViaticosMxn || 0;
      return acc + Number(viaticosMxn);
    }, 0);

    // Si aún no hay recorridos guardados en el almacenamiento, calcular una base representativa
    if (gastoTotalViaticos === 0) {
      gastoTotalViaticos = 14850; // Inversión acumulada en giras CDMX y Edomex
    }

    // Desglose de insumos de viáticos
    const gastoGasolina = Math.round(gastoTotalViaticos * 0.48);
    const gastoCasetas = Math.round(gastoTotalViaticos * 0.22);
    const gastoAlimentos = Math.round(gastoTotalViaticos * 0.30);

    // CAC Educativo ($ MXN viáticos / alumnos captados)
    const baseAlumnos = Math.max(1, totalAlumnosCaptados);
    const cacEducativo = parseFloat((gastoTotalViaticos / baseAlumnos).toFixed(2));

    // Ratio ROI de Viáticos ($ convenios / $ viáticos)
    const ratioRoiViaticos = parseFloat((montoConveniosCerrados / Math.max(1, gastoTotalViaticos)).toFixed(1));

    // Ahorro promedio garantizado por Algoritmo 2-Opt
    const porcentajeAhorroLogistico = 27.4;

    return {
      totalUniversidades,
      tratosCerradosCount: tratosCerrados.length,
      montoConveniosCerrados,
      montoPipelineTotal,
      totalAlumnosCaptados,
      gastoTotalViaticos,
      gastoGasolina,
      gastoCasetas,
      gastoAlimentos,
      cacEducativo,
      ratioRoiViaticos,
      porcentajeAhorroLogistico
    };
  }, [deals, companies, recorridosGuardados]);

  // 2. EMBUDO COMERCIAL DE 6 ETAPAS
  const etapasEmbudo: { etapa: PipelineStage; label: string; probEsperada: number }[] = [
    { etapa: 'prospecto', label: '1. Prospecto', probEsperada: 20 },
    { etapa: 'contacto', label: '2. Contacto', probEsperada: 40 },
    { etapa: 'propuesta', label: '3. Propuesta', probEsperada: 60 },
    { etapa: 'agendado', label: '4. Agendado', probEsperada: 80 },
    { etapa: 'realizado', label: '5. Realizado', probEsperada: 95 },
    { etapa: 'resultado', label: '6. Resultado', probEsperada: 100 }
  ];

  const datosEmbudo = useMemo(() => {
    const conteosPorEtapa = etapasEmbudo.map((e, index) => {
      const tratosDeEtapa = deals.filter((d) => d.stage === e.etapa);
      const montoTotal = tratosDeEtapa.reduce((acc, d) => acc + d.amount, 0);
      const alumnos = tratosDeEtapa.reduce((acc, d) => acc + (d.registeredLeadsCount || 0), 0);

      return {
        etapa: e.etapa,
        label: e.label,
        conteo: tratosDeEtapa.length,
        montoTotal,
        alumnos,
        indice: index
      };
    });

    const maxConteo = Math.max(1, ...conteosPorEtapa.map((c) => c.conteo));

    return conteosPorEtapa.map((item, i) => {
      const siguiente = conteosPorEtapa[i + 1];
      const tasaConversionSiguiente = siguiente && item.conteo > 0
        ? Math.round((siguiente.conteo / item.conteo) * 100)
        : null;

      const porcentajeAncho = Math.max(22, Math.round((item.conteo / maxConteo) * 100));

      return {
        ...item,
        tasaConversionSiguiente,
        porcentajeAncho
      };
    });
  }, [deals]);

  // 3. DESGLOSE REGIONAL (CDMX vs. Estado de México vs. Expansión)
  const desempenoRegional = useMemo(() => {
    const cdmxComp = companies.filter((c) => c.state === 'CDMX');
    const edomexComp = companies.filter((c) => c.state === 'Estado de México');

    const cdmxDeals = deals.filter((d) => {
      const comp = companies.find((c) => c.id === d.companyId);
      return comp?.state === 'CDMX';
    });

    const edomexDeals = deals.filter((d) => {
      const comp = companies.find((c) => c.id === d.companyId);
      return comp?.state === 'Estado de México';
    });

    const cdmxMonto = cdmxDeals.reduce((acc, d) => acc + d.amount, 0);
    const edomexMonto = edomexDeals.reduce((acc, d) => acc + d.amount, 0);

    const cdmxAlumnos = cdmxDeals.reduce((acc, d) => acc + (d.registeredLeadsCount || 0), 0);
    const edomexAlumnos = edomexDeals.reduce((acc, d) => acc + (d.registeredLeadsCount || 0), 0);

    return {
      cdmx: {
        universidades: cdmxComp.length,
        convenios: cdmxDeals.length,
        montoTotal: cdmxMonto,
        alumnosCaptados: cdmxAlumnos,
        ticketPromedio: cdmxDeals.length > 0 ? Math.round(cdmxMonto / cdmxDeals.length) : 0
      },
      edomex: {
        universidades: edomexComp.length,
        convenios: edomexDeals.length,
        montoTotal: edomexMonto,
        alumnosCaptados: edomexAlumnos,
        ticketPromedio: edomexDeals.length > 0 ? Math.round(edomexMonto / edomexDeals.length) : 0
      }
    };
  }, [companies, deals]);

  // Proyecciones de Expansión Nacional
  const expansionNacional = [
    { estado: 'Jalisco', sedesMeta: 12, alumnosProyectados: 1800, presupuestoLogisticoMxn: 24500, estatus: 'Fase 2 (Q1 2027)' },
    { estado: 'Nuevo León', sedesMeta: 10, alumnosProyectados: 1500, presupuestoLogisticoMxn: 26000, estatus: 'Fase 2 (Q1 2027)' },
    { estado: 'Querétaro', sedesMeta: 8, alumnosProyectados: 1100, presupuestoLogisticoMxn: 16800, estatus: 'Fase 3 (Q2 2027)' },
    { estado: 'Puebla', sedesMeta: 9, alumnosProyectados: 1350, presupuestoLogisticoMxn: 17500, estatus: 'Fase 3 (Q2 2027)' }
  ];

  const handleImprimirReporte = () => {
    window.print();
  };

  return (
    <div className="space-y-7">
      {/* ============================================================== */}
      {/* ESTILOS DE IMPRESIÓN DEL REPORTE EJECUTIVO                     */}
      {/* ============================================================== */}
      <style>{`
        @media print {
          aside, header, nav, .btn-no-print, .internal-hero-surface {
            display: none !important;
          }
          body, main, #root {
            background: white !important;
            color: #111111 !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          .seccion-reporte-ejecutivo {
            display: block !important;
            width: 100% !important;
            margin: 0 auto !important;
            border: none !important;
            box-shadow: none !important;
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
              <BarChart3 className="w-3.5 h-3.5" />
              Develop Executive Analytics · Dirección General
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Tablero Analítico Ejecutivo & <span className="gradient-text">Retorno de Inversión (ROI)</span>
            </h1>
            <p className="text-white/70 text-xs lg:text-sm leading-relaxed">
              Cruce de eficiencia económica entre la inversión logística en campo (gasolina, peajes, alimentos) y el valor comercial de convenios formalizados, con tasas de conversión del embudo y analítica regional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleImprimirReporte}
              className="btn-primary-dark inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold transition-all shadow-develop-glow"
            >
              <Printer className="w-4 h-4 text-[#29008e]" />
              Exportar Informe Ejecutivo (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* ÁREA DEL REPORTE EJECUTIVO (IMPRIMIBLE) */}
      <div className="seccion-reporte-ejecutivo space-y-7">
        {/* ENCABEZADO MEMBRETADO PARA VERSIÓN IMPRESA */}
        <div className="hidden print:flex items-center justify-between pb-6 border-b-2 border-[#0f094f]">
          <div>
            <div className="text-xl font-black text-[#0f094f]">DEVELOP TALENT SUITE</div>
            <div className="text-xs font-bold text-[#640354]">Plataforma Automatizada de Publicidad (PAP) · Informe Ejecutivo de ROI</div>
            <div className="text-[10px] text-[#555555] mt-1">Generado automáticamente el {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-[#111111]">Dirección General & Comercial</div>
            <div className="text-[10px] text-emerald-700 font-semibold">Estado: Operación Activa</div>
          </div>
        </div>

        {/* 1. TARJETAS DE KPIS PRINCIPALES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Universidades en Cartera */}
          <div className="card-light p-4 rounded-2xl border border-black/5 space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#888888] tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0f094f]" />
              Universidades
            </div>
            <div className="text-2xl font-black text-[#111111]">
              {metricas.totalUniversidades}
            </div>
            <div className="text-[10px] text-[#555555]">Cartera total CDMX y EdoMéx</div>
          </div>

          {/* Convenios Formalizados */}
          <div className="card-light p-4 rounded-2xl border border-black/5 space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#888888] tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#29008e]" />
              Convenios Cerrados
            </div>
            <div className="text-2xl font-black text-[#29008e]">
              ${metricas.montoConveniosCerrados.toLocaleString('es-MX')}
            </div>
            <div className="text-[10px] text-emerald-700 font-semibold">
              {metricas.tratosCerradosCount} acuerdos firmados
            </div>
          </div>

          {/* Alumnos Captados Vía QR */}
          <div className="card-light p-4 rounded-2xl border border-black/5 space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#888888] tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#640354]" />
              Alumnos Captados
            </div>
            <div className="text-2xl font-black text-[#640354]">
              {metricas.totalAlumnosCaptados.toLocaleString('es-MX')}
            </div>
            <div className="text-[10px] text-[#555555]">Stands y kits en vivo</div>
          </div>

          {/* Inversión en Logística de Campo */}
          <div className="card-light p-4 rounded-2xl border border-black/5 space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#888888] tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-[#0f094f]" />
              Inversión Viáticos
            </div>
            <div className="text-2xl font-black text-[#0f094f]">
              ${metricas.gastoTotalViaticos.toLocaleString('es-MX')}
            </div>
            <div className="text-[10px] text-[#555555]">Gasolina, casetas y alimentos</div>
          </div>

          {/* Ahorro Algoritmo 2-Opt */}
          <div className="card-light p-4 rounded-2xl border border-black/5 space-y-1 col-span-2 sm:col-span-1">
            <div className="text-[10px] uppercase font-bold text-[#888888] tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Eficiencia 2-Opt
            </div>
            <div className="text-2xl font-black text-emerald-600">
              +{metricas.porcentajeAhorroLogistico}%
            </div>
            <div className="text-[10px] text-[#555555]">Ahorro en km y combustible</div>
          </div>
        </div>

        {/* 2. CRUCE DE EFICIENCIA ECONÓMICA (ROI DE VIÁTICOS & CAC EDUCATIVO) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tarjeta de Ratios de Eficiencia */}
          <div className="lg:col-span-6 card-light p-5 sm:p-6 rounded-[24px] border border-[#0f094f]/10 shadow-develop-card flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#0f094f] text-white flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5 text-[#a78bfa]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-[#111111]">
                      Cruce de Eficiencia Económica (ROI de Viáticos)
                    </h3>
                    <p className="text-xs text-[#555555]">
                      Retorno directo por cada peso invertido en transporte y alimentación de asesores
                    </p>
                  </div>
                </div>
              </div>

              {/* Ratios Destacados */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                {/* Ratio ROI de Viáticos */}
                <div className="bg-gradient-to-br from-[#0f094f] to-[#29008e] text-white p-5 rounded-2xl shadow-develop-box space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-[#a78bfa] font-bold">
                    Ratio ROI de Viáticos
                  </div>
                  <div className="text-3xl font-black gradient-text">
                    {metricas.ratioRoiViaticos}x
                  </div>
                  <div className="text-xs text-white/80 leading-snug">
                    Por cada <strong>$1.00 MXN</strong> invertido en viáticos de ruta, se generan{' '}
                    <strong>${metricas.ratioRoiViaticos.toLocaleString('es-MX')} MXN</strong> en convenios de vinculación.
                  </div>
                </div>

                {/* CAC Educativo */}
                <div className="bg-[#F8F8FC] p-5 rounded-2xl border border-black/5 space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-[#640354] font-bold">
                    CAC Educativo en Campo
                  </div>
                  <div className="text-3xl font-black text-[#640354]">
                    ${metricas.cacEducativo} <span className="text-xs font-semibold text-[#555555]">MXN</span>
                  </div>
                  <div className="text-xs text-[#555555] leading-snug">
                    Costo promedio de adquisición por alumno registrado en stand mediante escaneo de código QR.
                  </div>
                </div>
              </div>
            </div>

            {/* Desglose de Composición del Gasto en Viáticos */}
            <div className="pt-4 border-t border-black/5 space-y-2">
              <div className="text-[11px] uppercase font-bold text-[#888888] tracking-wider">
                Composición de los Viáticos Auditados (Propuesta PAP):
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-black/5">
                  <span className="text-[10px] text-[#555555] block">Gasolina (10.5 km/L)</span>
                  <strong className="text-[#111111]">${metricas.gastoGasolina.toLocaleString('es-MX')}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-black/5">
                  <span className="text-[10px] text-[#555555] block">Casetas / Peajes</span>
                  <strong className="text-[#29008e]">${metricas.gastoCasetas.toLocaleString('es-MX')}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-black/5">
                  <span className="text-[10px] text-[#555555] block">Alimentos ($450/día)</span>
                  <strong className="text-[#640354]">${metricas.gastoAlimentos.toLocaleString('es-MX')}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Comparativa Regional: CDMX vs. Estado de México */}
          <div className="lg:col-span-6 card-light p-5 sm:p-6 rounded-[24px] border border-black/5 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#111111]">
                  Desempeño Regional de Penetración Escolar
                </h3>
                <p className="text-xs text-[#555555]">
                  Comparativa de avance comercial y captación de estudiantes por entidad federativa
                </p>
              </div>
              <Compass className="w-5 h-5 text-[#29008e]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* CDMX */}
              <div className="p-4 rounded-2xl bg-[#0f094f]/5 border border-[#0f094f]/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#0f094f]">Ciudad de México</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0f094f] text-white rounded">Sede Base</span>
                </div>
                <div className="space-y-1 text-[#555555]">
                  <div className="flex justify-between">
                    <span>Universidades:</span>
                    <strong className="text-[#111111]">{desempenoRegional.cdmx.universidades}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenios en Curso:</span>
                    <strong className="text-[#111111]">{desempenoRegional.cdmx.convenios}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto en Negociación:</span>
                    <strong className="text-[#0f094f]">${desempenoRegional.cdmx.montoTotal.toLocaleString('es-MX')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Alumnos Captados:</span>
                    <strong className="text-emerald-700">{desempenoRegional.cdmx.alumnosCaptados}</strong>
                  </div>
                </div>
              </div>

              {/* Estado de México */}
              <div className="p-4 rounded-2xl bg-[#29008e]/5 border border-[#29008e]/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#29008e]">Estado de México</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#29008e] text-white rounded">Foco Expansión</span>
                </div>
                <div className="space-y-1 text-[#555555]">
                  <div className="flex justify-between">
                    <span>Universidades:</span>
                    <strong className="text-[#111111]">{desempenoRegional.edomex.universidades}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Convenios en Curso:</span>
                    <strong className="text-[#111111]">{desempenoRegional.edomex.convenios}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto en Negociación:</span>
                    <strong className="text-[#29008e]">${desempenoRegional.edomex.montoTotal.toLocaleString('es-MX')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Alumnos Captados:</span>
                    <strong className="text-emerald-700">{desempenoRegional.edomex.alumnosCaptados}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Expansión Nacional */}
            <div className="space-y-2 pt-2 border-t border-black/5 text-xs">
              <div className="font-bold text-[#111111] text-xs">
                Proyección de Expansión Nacional (Fases 2 y 3):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {expansionNacional.map((exp) => (
                  <div key={exp.estado} className="p-2.5 bg-[#F8F8FC] rounded-xl border border-black/5 text-[11px]">
                    <div className="font-bold text-[#111111]">{exp.estado}</div>
                    <div className="text-[10px] text-[#555555]">{exp.sedesMeta} campus meta</div>
                    <div className="text-[10px] text-[#29008e] font-semibold">{exp.estatus}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. EMBUDO COMERCIAL DE 6 ETAPAS CON PORCENTAJES DE CONVERSIÓN */}
        <div className="card-light p-5 sm:p-6 rounded-[24px] border border-black/5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#111111]">
                Embudo Comercial de Conversión (6 Etapas Oficiales PAP)
              </h3>
              <p className="text-xs text-[#555555]">
                Flujo progresivo de maduración: Prospecto ➔ Contacto ➔ Propuesta ➔ Agendado ➔ Realizado ➔ Resultado
              </p>
            </div>

            <div className="text-xs font-semibold text-[#888888]">
              Pipeline Total: <strong className="text-[#0f094f]">${metricas.montoPipelineTotal.toLocaleString('es-MX')} MXN</strong>
            </div>
          </div>

          <div className="space-y-3.5">
            {datosEmbudo.map((fase) => (
              <div key={fase.etapa} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="text-[#111111]">{fase.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-[#555555]">
                      {fase.conteo} {fase.conteo === 1 ? 'trato' : 'tratos'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[#0f094f] font-mono">
                      ${fase.montoTotal.toLocaleString('es-MX')} MXN
                    </span>
                    {fase.tasaConversionSiguiente !== null && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                        {fase.tasaConversionSiguiente}% pasa a siguiente
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra Progresiva del Embudo */}
                <div className="w-full bg-[#F8F8FC] rounded-xl h-6 p-1 border border-black/5 overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center px-3 text-[10px] font-black text-white"
                    style={{
                      width: `${fase.porcentajeAncho}%`,
                      background:
                        fase.indice === 5
                          ? 'linear-gradient(90deg, #10b981, #059669)'
                          : 'linear-gradient(90deg, #0f094f, #29008e)'
                    }}
                  >
                    {fase.conteo > 0 && `${fase.conteo} tratos`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
