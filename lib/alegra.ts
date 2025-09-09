/**
 * Configuración y utilidades para la API de Alegra
 */

// Configuración de la API de Alegra
export const ALEGRA_CONFIG = {
  baseURL: process.env.ALEGRA_BASE_URL || 'https://api.alegra.com/api/v1',
  email: process.env.ALEGRA_EMAIL || '',
  token: process.env.ALEGRA_TOKEN || '',
};

/**
 * Genera el header de autenticación Basic Auth para Alegra
 * El formato es: email:token en base64
 */
export function getAuthHeader(): string {
  const credentials = `${ALEGRA_CONFIG.email}:${ALEGRA_CONFIG.token}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  return `Basic ${base64Credentials}`;
}

/**
 * Realiza una petición GET a la API de Alegra
 */
export async function alegraRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${ALEGRA_CONFIG.baseURL}${endpoint}`;
  
  const headers = {
    'Authorization': getAuthHeader(),
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  try {
    console.log(`🌐 Realizando petición a: ${url}`);
    console.log(`🔑 Headers enviados:`, { ...headers, Authorization: '[HIDDEN]' });
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📡 Status de respuesta: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error de API:`, errorText);
      throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ Respuesta recibida exitosamente`);
    return data;
  } catch (error) {
    console.error('❌ Error en petición a Alegra:', error);
    throw error;
  }
}

/**
 * Obtiene las fechas del mes actual en formato YYYY-MM-DD
 */
export function getCurrentMonthDates() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  // Primer día del mes
  const startDate = new Date(year, month, 1);
  // Último día del mes
  const endDate = new Date(year, month + 1, 0);
  
  return {
    start: startDate.toISOString().split('T')[0], // YYYY-MM-DD
    end: endDate.toISOString().split('T')[0],     // YYYY-MM-DD
  };
}

/**
 * Tipos de datos para las facturas de Alegra
 */
export interface AlegraInvoice {
  id: number;
  date: string;
  dueDate: string;
  total: number;
  totalPaid: number;
  balance: number;
  numberTemplate: {
    number: string;
    prefix: string;
    template: string;
  };
  client: {
    id: number;
    name: string;
    identification: string;
  };
  status: string;
  seller?: {
    id: number;
    name: string;
  };
}

export interface AlegraInvoicesResponse {
  data: AlegraInvoice[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
