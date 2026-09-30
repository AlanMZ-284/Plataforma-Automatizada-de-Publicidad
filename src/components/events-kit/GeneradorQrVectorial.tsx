import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check, QrCode, ExternalLink, Image } from 'lucide-react';

export interface PropiedadesGeneradorQrVectorial {
  urlDestino?: string;
  oportunidadId?: string;
  nombreEvento?: string;
  nombreInstitucion?: string;
  tamano?: number;
  colorOscuro?: string;
  colorClaro?: string;
  mostrarBotonesDescarga?: boolean;
  mostrarEnlace?: boolean;
  etiquetaInstruccion?: string;
  className?: string;
}

export const GeneradorQrVectorial: React.FC<PropiedadesGeneradorQrVectorial> = ({
  urlDestino,
  oportunidadId = '',
  nombreEvento = 'Evento Universitario',
  nombreInstitucion = 'Universidad Aliada',
  tamano = 220,
  colorOscuro = '#0f094f',
  colorClaro = '#ffffff',
  mostrarBotonesDescarga = true,
  mostrarEnlace = true,
  etiquetaInstruccion = 'Escanea con la cámara de tu teléfono móvil para registrar tu perfil de estudiante',
  className = ''
}) => {
  const [svgCodigo, setSvgCodigo] = useState<string>('');
  const [enlaceCopiado, setEnlaceCopiado] = useState<boolean>(false);
  const [errorGeneracion, setErrorGeneracion] = useState<string | null>(null);

  // Construir la URL de captura del evento según los lineamientos del Sprint 2 y 4
  const urlFinal = React.useMemo(() => {
    if (urlDestino && urlDestino.trim().length > 0) {
      return urlDestino;
    }
    const origen = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    return `${origen}/?vista=registro-alumno-qr&dealId=${encodeURIComponent(oportunidadId)}`;
  }, [urlDestino, oportunidadId]);

  // Generar código QR vectorial en formato SVG nativo
  useEffect(() => {
    let cancelado = false;

    QRCode.toString(
      urlFinal,
      {
        type: 'svg',
        margin: 1,
        width: tamano,
        color: {
          dark: colorOscuro,
          light: colorClaro
        }
      },
      (error, svgString) => {
        if (cancelado) return;
        if (error) {
          console.error('Error generando QR SVG:', error);
          setErrorGeneracion('No fue posible generar el código QR vectorial');
        } else {
          setSvgCodigo(svgString);
          setErrorGeneracion(null);
        }
      }
    );

    return () => {
      cancelado = true;
    };
  }, [urlFinal, tamano, colorOscuro, colorClaro]);

  // Descarga en formato vectorial SVG
  const handleDescargarSvg = () => {
    if (!svgCodigo) return;
    const blob = new Blob([svgCodigo], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    const nombreLimpio = `${nombreInstitucion}-${nombreEvento}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    enlace.download = `qr-vectorial-${nombreLimpio}.svg`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  };

  // Descarga en formato de alta resolución PNG (1200x1200px para impresión)
  const handleDescargarPngHd = () => {
    QRCode.toDataURL(
      urlFinal,
      {
        width: 1200,
        margin: 2,
        color: {
          dark: colorOscuro,
          light: colorClaro
        }
      },
      (error, dataUrl) => {
        if (error) {
          console.error('Error generando PNG:', error);
          return;
        }
        const enlace = document.createElement('a');
        enlace.href = dataUrl;
        const nombreLimpio = `${nombreInstitucion}-${nombreEvento}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-');
        enlace.download = `qr-alta-resolucion-${nombreLimpio}-1200px.png`;
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);
      }
    );
  };

  // Copiar URL al portapapeles
  const handleCopiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(urlFinal);
      setEnlaceCopiado(true);
      setTimeout(() => setEnlaceCopiado(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Contenedor del Código QR Vectorial */}
      <div
        className="relative bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-black/10 shadow-develop-card flex items-center justify-center transition-all group hover:border-[#29008e]/30"
        style={{ width: tamano + 32, minHeight: tamano + 32 }}
      >
        {svgCodigo ? (
          <div
            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:rounded-xl"
            dangerouslySetInnerHTML={{ __html: svgCodigo }}
          />
        ) : errorGeneracion ? (
          <div className="text-xs text-rose-600 p-4">{errorGeneracion}</div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-xs text-[#555555]">
            <QrCode className="w-8 h-8 animate-pulse text-[#29008e]" />
            <span>Generando QR Vectorial...</span>
          </div>
        )}

        {/* Distintivo de Marca Develop en el centro inferior */}
        <div className="absolute -bottom-2.5 bg-gradient-to-r from-[#0f094f] to-[#29008e] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs border border-white/20">
          Develop PAP
        </div>
      </div>

      {/* Instrucción de Escaneo */}
      {etiquetaInstruccion && (
        <p className="text-[11px] sm:text-xs text-[#555555] max-w-[280px] mt-4 leading-relaxed font-medium">
          {etiquetaInstruccion}
        </p>
      )}

      {/* URL de Captura y Botón de Copiar */}
      {mostrarEnlace && (
        <div className="mt-2.5 flex items-center gap-1.5 max-w-[320px] w-full bg-[#F8F8FC] px-2.5 py-1.5 rounded-xl border border-black/5 text-[10px] text-[#555555]">
          <span className="truncate flex-1 font-mono text-left">{urlFinal}</span>
          <button
            onClick={handleCopiarEnlace}
            title="Copiar enlace directo"
            className="p-1 hover:text-[#29008e] text-[#888888] transition-colors rounded-md"
          >
            {enlaceCopiado ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
          <a
            href={urlFinal}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir formulario en pestaña nueva"
            className="p-1 hover:text-[#29008e] text-[#888888] transition-colors rounded-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Botones de Descarga Profesional para Diseñadores y Asesores */}
      {mostrarBotonesDescarga && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <button
            onClick={handleDescargarSvg}
            className="btn-secondary-light px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 rounded-xl shadow-2xs hover:border-[#29008e]/30"
          >
            <Download className="w-3.5 h-3.5 text-[#29008e]" />
            Descargar SVG (Vectorial)
          </button>

          <button
            onClick={handleDescargarPngHd}
            className="btn-secondary-light px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 rounded-xl shadow-2xs hover:border-[#640354]/30"
          >
            <Image className="w-3.5 h-3.5 text-[#640354]" />
            Descargar PNG (1200px HD)
          </button>
        </div>
      )}
    </div>
  );
};
