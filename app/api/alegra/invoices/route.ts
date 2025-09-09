import { NextRequest, NextResponse } from 'next/server';
import { alegraRequest, getCurrentMonthDates, AlegraInvoice } from '@/lib/alegra';

/**
 * GET /api/alegra/invoices
 * Obtiene las facturas de venta del mes actual desde Alegra
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener fechas del mes actual
    const { start, end } = getCurrentMonthDates();
    
    console.log(`🔍 Obteniendo facturas de venta del ${start} al ${end}`);
    
    // Construir query parameters para filtrar por fecha
    const queryParams = new URLSearchParams({
      start_date: start,
      end_date: end,
      order_direction: 'DESC',
      order_field: 'date',
    });

    // Realizar petición a Alegra API
    const endpoint = `/invoices?${queryParams.toString()}`;
    const response = await alegraRequest(endpoint);
    
    console.log(`🔍 Respuesta completa de Alegra:`, JSON.stringify(response, null, 2));
    console.log(`🔍 Tipo de respuesta:`, typeof response);
    console.log(`🔍 Propiedades de la respuesta:`, Object.keys(response || {}));
    
    // Verificar si la respuesta tiene la estructura esperada
    if (!response) {
      throw new Error('Respuesta vacía de Alegra API');
    }

    // Manejar diferentes estructuras de respuesta
    let invoices: AlegraInvoice[] = [];
    let meta: any = {};
    
    if (Array.isArray(response)) {
      // Si la respuesta es directamente un array
      invoices = response;
      meta = { total: response.length };
      console.log(`📊 Respuesta es array directo con ${response.length} elementos`);
    } else if (response.data && Array.isArray(response.data)) {
      // Si la respuesta tiene estructura con data
      invoices = response.data;
      meta = response.meta || { total: response.data.length };
      console.log(`📊 Respuesta con estructura data: ${response.data.length} facturas`);
    } else {
      console.log(`❌ Estructura de respuesta no reconocida`);
      throw new Error('Estructura de respuesta no válida de Alegra API');
    }
    
    console.log(`📊 Total de facturas encontradas: ${invoices.length}`);
    
    if (invoices.length > 0) {
      console.log(`💰 Detalles de las facturas:`, invoices.map((invoice: AlegraInvoice) => ({
        id: invoice.id,
        numero: invoice.numberTemplate ? `${invoice.numberTemplate.prefix || ''}${invoice.numberTemplate.number || ''}` : 'N/A',
        fecha: invoice.date,
        cliente: invoice.client ? invoice.client.name : 'N/A',
        total: invoice.total || 0,
        estado: invoice.status,
      })));
    }

    // Calcular totales del mes de forma segura
    const totalVentas = invoices.reduce((sum: number, invoice: AlegraInvoice) => sum + (invoice.total || 0), 0);
    const totalPagado = invoices.reduce((sum: number, invoice: AlegraInvoice) => sum + (invoice.totalPaid || 0), 0);
    const totalPendiente = invoices.reduce((sum: number, invoice: AlegraInvoice) => sum + (invoice.balance || 0), 0);
    
    console.log(`💵 Resumen del mes:`, {
      totalVentas: `$${totalVentas.toLocaleString('es-CO')}`,
      totalPagado: `$${totalPagado.toLocaleString('es-CO')}`,
      totalPendiente: `$${totalPendiente.toLocaleString('es-CO')}`,
      numeroFacturas: invoices.length,
    });

    // Retornar datos procesados
    return NextResponse.json({
      success: true,
      period: { start, end },
      summary: {
        totalVentas,
        totalPagado,
        totalPendiente,
        numeroFacturas: invoices.length,
      },
      invoices: invoices,
      meta: meta,
    });

  } catch (error) {
    console.error('❌ Error al obtener facturas de Alegra:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener facturas de Alegra',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
