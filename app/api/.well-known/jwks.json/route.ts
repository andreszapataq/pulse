/**
 * Endpoint JWKS (JSON Web Key Set)
 * 
 * Este endpoint expone las llaves públicas RSA que el banco usará
 * para verificar los JWT que genere nuestra aplicación.
 * 
 * URL: https://tu-app.vercel.app/.well-known/jwks.json
 * 
 * Cumple con:
 * - RFC 7517 (JSON Web Key)
 * - RFC 7518 (JSON Web Algorithms)
 * - Requisitos del banco: RSA 2048 bits mínimo
 */

import { NextResponse } from 'next/server';
import { privateKeyToPublicJWK, validateRSAKeySize, type RSAPublicJWK } from '@/lib/crypto';

/**
 * GET /.well-known/jwks.json
 * 
 * Retorna el conjunto de llaves públicas en formato JWKS
 * que el banco usará para verificar nuestros JWT
 */
export async function GET() {
  try {
    console.log('🔑 Generando JWKS endpoint...');
    
    // Obtener la llave privada desde variables de entorno
    const privateKey = process.env.JWT_PRIVATE_KEY;
    const keyId = process.env.JWT_KEY_ID || 'pulse-main-key';
    
    if (!privateKey) {
      console.error('❌ JWT_PRIVATE_KEY no configurada');
      return NextResponse.json(
        { 
          error: 'JWT private key not configured',
          message: 'Configura JWT_PRIVATE_KEY en las variables de entorno'
        },
        { status: 500 }
      );
    }

    // Convertir la llave privada a formato JWK público
    const publicJWK = await privateKeyToPublicJWK(privateKey, keyId);

    // Validar que la llave cumple con los requisitos del banco (RSA 2048+)
    if (!validateRSAKeySize(publicJWK)) {
      console.error('❌ La llave RSA no cumple con el tamaño mínimo de 2048 bits');
      return NextResponse.json(
        { 
          error: 'Invalid RSA key size',
          message: 'La llave RSA debe ser de al menos 2048 bits'
        },
        { status: 500 }
      );
    }

    // Formato JWKS estándar según RFC 7517
    const jwks = {
      keys: [
        {
          ...publicJWK,
          // Metadatos adicionales para el banco
          key_ops: ['verify'],           // Operaciones permitidas
          ext: true,                     // Extractable
          // Información de la aplicación
          x5u: `${process.env.VERCEL_URL || 'https://pulse-app.vercel.app'}/api/.well-known/jwks.json`,
        }
      ]
    };

    console.log('✅ JWKS generado exitosamente');
    console.log(`🔑 Key ID: ${keyId}`);
    console.log(`📏 Tamaño de llave: ${Buffer.from(publicJWK.n, 'base64url').length * 8} bits`);

    // Retornar JWKS con headers apropiados
    return NextResponse.json(jwks, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache por 1 hora
        'Access-Control-Allow-Origin': '*', // Permitir CORS para el banco
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Headers de seguridad
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      }
    });

  } catch (error) {
    console.error('❌ Error generando JWKS:', error);
    
    return NextResponse.json(
      { 
        error: 'Error generating JWKS',
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /.well-known/jwks.json
 * 
 * Manejar preflight requests para CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 horas
    }
  });
}
