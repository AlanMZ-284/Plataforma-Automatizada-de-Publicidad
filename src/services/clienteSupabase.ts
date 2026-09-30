/**
 * Cliente de conexión oficial a Supabase para la Plataforma Automatizada de Publicidad (PAP).
 * Configurado con la URL local por defecto y mecanismo de respaldo resiliente (offline/fallback)
 * para operar en almacenamiento local o memoria si la base de datos no está accesible.
 * 
 * Regla: 100% en español, cero términos en inglés para lógica de negocio.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BaseDatos } from '../types/base_datos';

// Constantes de conexión local predeterminada
export const URL_SUPABASE_PREDETERMINADA =
  (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL ||
  'http://127.0.0.1:44321';

export const LLAVE_ANONIMA_PREDETERMINADA =
  (import.meta as unknown as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Creación del cliente tipado con el esquema oficial en español
export const clienteSupabase: SupabaseClient<BaseDatos> = createClient<BaseDatos>(
  URL_SUPABASE_PREDETERMINADA,
  LLAVE_ANONIMA_PREDETERMINADA,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    },
    global: {
      headers: {
        'x-cliente-aplicacion': 'pap-crm-develop'
      }
    }
  }
);

// Estado de conectividad en memoria
let conexionActiva: boolean | null = null;

/**
 * Comprueba de forma no intrusiva si el servicio de Supabase local responde.
 * Permite alternar al modo de respaldo sin bloquear la interfaz.
 */
export async function verificarConexionSupabase(): Promise<boolean> {
  try {
    const controladorTiempo = new AbortController();
    const tiempoLimite = setTimeout(() => controladorTiempo.abort(), 2000);

    const respuesta = await fetch(`${URL_SUPABASE_PREDETERMINADA}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: LLAVE_ANONIMA_PREDETERMINADA,
        Authorization: `Bearer ${LLAVE_ANONIMA_PREDETERMINADA}`
      },
      signal: controladorTiempo.signal
    });

    clearTimeout(tiempoLimite);
    conexionActiva = respuesta.ok || respuesta.status === 404 || respuesta.status === 200;
    return conexionActiva;
  } catch (error) {
    console.warn('Supabase local no disponible. Activando modo resiliente en almacenamiento local/memoria.', error);
    conexionActiva = false;
    return false;
  }
}

/**
 * Consulta el estado actual de conexión a Supabase.
 */
export function obtenerEstadoConexion(): boolean {
  return conexionActiva ?? false;
}
