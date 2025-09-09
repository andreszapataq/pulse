import { NextResponse } from 'next/server';
import { alegraRequest, ALEGRA_CONFIG } from '@/lib/alegra';

/**
 * GET /api/alegra/test
 * Prueba la conexión y autenticación con Alegra API
 */
export async function GET() {
  try {
    console.log('🔧 Probando conexión con Alegra API...');
    console.log('📧 Email configurado:', ALEGRA_CONFIG.email ? 'Sí' : 'No');
    console.log('🔑 Token configurado:', ALEGRA_CONFIG.token ? 'Sí' : 'No');
    
    if (!ALEGRA_CONFIG.email || !ALEGRA_CONFIG.token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuración incompleta',
          details: 'Falta configurar ALEGRA_EMAIL y/o ALEGRA_TOKEN en las variables de entorno',
        },
        { status: 400 }
      );
    }

    // Probar con un endpoint simple - obtener información de la empresa
    const companyInfo = await alegraRequest('/company');
    
    console.log('✅ Conexión exitosa con Alegra');
    console.log('🏢 Información de la empresa:', {
      nombre: companyInfo.name,
      identificacion: companyInfo.identification,
      email: companyInfo.email,
    });

    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa con Alegra API',
      company: {
        name: companyInfo.name,
        identification: companyInfo.identification,
        email: companyInfo.email,
      },
      config: {
        baseURL: ALEGRA_CONFIG.baseURL,
        emailConfigured: !!ALEGRA_CONFIG.email,
        tokenConfigured: !!ALEGRA_CONFIG.token,
      },
    });

  } catch (error) {
    console.error('❌ Error al probar conexión con Alegra:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Error de conexión con Alegra API',
        details: error instanceof Error ? error.message : 'Error desconocido',
        config: {
          baseURL: ALEGRA_CONFIG.baseURL,
          emailConfigured: !!ALEGRA_CONFIG.email,
          tokenConfigured: !!ALEGRA_CONFIG.token,
        },
      },
      { status: 500 }
    );
  }
}
