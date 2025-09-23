/**
 * Endpoint JWKS Alternativo
 * 
 * Este endpoint funciona como alternativa a /.well-known/jwks.json
 * URL: /api/jwks
 * 
 * Cumple con los mismos estándares RFC 7517 y RFC 7518
 */

import { NextResponse } from 'next/server';
import { privateKeyToPublicJWK, validateRSAKeySize, type RSAPublicJWK } from '@/lib/crypto';

/**
 * GET /api/jwks
 * 
 * Retorna el conjunto de llaves públicas en formato JWKS
 * Alternativa a /.well-known/jwks.json que funciona en todos los entornos
 */
export async function GET() {
  try {
    console.log('🔑 Generando JWKS endpoint alternativo...');
    
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
          // URLs alternativas
          x5u: `${process.env.VERCEL_URL || 'https://pulse-biz.vercel.app'}/api/jwks`,
        }
      ]
    };

    console.log('✅ JWKS alternativo generado exitosamente');
    console.log(`🔑 Key ID: ${keyId}`);
    console.log(`📏 Tamaño de llave: ${Buffer.from(publicJWK.n, 'base64url').length * 8} bits`);
    console.log(`🌐 URL alternativa: /api/jwks`);

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
        // Header personalizado para identificar que es el endpoint alternativo
        'X-JWKS-Source': 'alternative-endpoint',
      }
    });

  } catch (error) {
    console.error('❌ Error generando JWKS alternativo:', error);
    
    return NextResponse.json(
      { 
        error: 'Error generating JWKS',
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
        endpoint: '/api/jwks (alternative)'
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/jwks
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
