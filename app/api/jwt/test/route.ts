/**
 * Endpoint de prueba para JWT y JWKS
 * 
 * Este endpoint permite probar:
 * 1. Generación de JWT con las llaves configuradas
 * 2. Verificación del endpoint JWKS
 * 3. Validación de la configuración
 * 
 * URL: /api/jwt/test
 */

import { NextResponse } from 'next/server';
import { generateBankToken } from '@/lib/jwt';

/**
 * GET /api/jwt/test
 * 
 * Genera un JWT de prueba y verifica la configuración
 */
export async function GET() {
  try {
    console.log('🧪 Probando configuración JWT/JWKS...');
    
    // Verificar que las variables de entorno estén configuradas
    const privateKey = process.env.JWT_PRIVATE_KEY;
    const keyId = process.env.JWT_KEY_ID;
    
    if (!privateKey) {
      return NextResponse.json({
        success: false,
        error: 'JWT_PRIVATE_KEY no configurada',
        message: 'Configura JWT_PRIVATE_KEY en las variables de entorno'
      }, { status: 500 });
    }

    if (!keyId) {
      return NextResponse.json({
        success: false,
        error: 'JWT_KEY_ID no configurada',
        message: 'Configura JWT_KEY_ID en las variables de entorno'
      }, { status: 500 });
    }

    // Generar un JWT de prueba
    const testToken = generateBankToken({
      iss: getAppUrl(),
      aud: 'banco-test',
      sub: 'biotissue-pulse-test',
      companyId: 'biotissue-colombia',
      companyName: 'BioTissue Colombia',
      apiVersion: '1.0',
      scope: ['read:balance', 'read:transactions']
    });

    // Obtener información de los endpoints JWKS
    const jwksUrlStandard = `${getAppUrl()}/.well-known/jwks.json`;
    const jwksUrlAlternative = `${getAppUrl()}/api/jwks`;
    
    console.log('✅ JWT de prueba generado exitosamente');
    
    return NextResponse.json({
      success: true,
      message: 'Configuración JWT/JWKS verificada exitosamente',
      config: {
        keyId: keyId,
        privateKeyConfigured: true,
        jwksEndpointStandard: jwksUrlStandard,
        jwksEndpointAlternative: jwksUrlAlternative,
        appUrl: getAppUrl()
      },
      test: {
        tokenGenerated: true,
        tokenPreview: {
          header: decodeTokenHeader(testToken),
          // Solo mostramos algunos claims por seguridad
          claims: {
            iss: getAppUrl(),
            aud: 'banco-test',
            sub: 'biotissue-pulse-test',
            companyName: 'BioTissue Colombia'
          }
        }
      },
      nextSteps: [
        '1. Verifica el endpoint JWKS estándar: ' + jwksUrlStandard,
        '2. Verifica el endpoint JWKS alternativo: ' + jwksUrlAlternative,
        '3. Usa cualquiera de las dos URLs para el banco',
        '4. Proporciona la URL JWKS al banco'
      ]
    });

  } catch (error) {
    console.error('❌ Error en prueba JWT:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error en configuración JWT',
      message: error instanceof Error ? error.message : 'Error desconocido',
      config: {
        privateKeyConfigured: !!process.env.JWT_PRIVATE_KEY,
        keyIdConfigured: !!process.env.JWT_KEY_ID
      }
    }, { status: 500 });
  }
}

/**
 * Obtiene la URL base de la aplicación
 */
function getAppUrl(): string {
  // En Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // En desarrollo
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // Fallback
  return 'https://pulse-app.vercel.app';
}

/**
 * Decodifica el header de un JWT sin validarlo
 */
function decodeTokenHeader(token: string) {
  try {
    const [headerB64] = token.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
    return header;
  } catch (error) {
    return { error: 'Token malformado' };
  }
}
