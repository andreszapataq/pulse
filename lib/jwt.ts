/**
 * Utilidades para generar y validar JWT
 * Para autenticación con la API del banco
 */

import jwt from 'jsonwebtoken';

/**
 * Payload estándar para JWT según RFC 7519
 * Incluye claims específicos para la integración bancaria
 */
export interface TokenPayload {
  // Claims estándar RFC 7519
  iss: string;        // Issuer - nuestra aplicación
  aud: string;        // Audience - el banco
  sub: string;        // Subject - identificador de nuestra app
  exp: number;        // Expiration time - timestamp
  iat: number;        // Issued at - timestamp
  nbf?: number;       // Not before - timestamp (opcional)
  jti: string;        // JWT ID - identificador único del token
  
  // Claims específicos para el banco
  companyId?: string;     // ID de BioTissue Colombia
  companyName?: string;   // Nombre de la empresa
  apiVersion?: string;    // Versión de la API que usamos
  scope?: string[];       // Permisos solicitados
  
  // Claims adicionales para auditoría
  appVersion?: string;    // Versión de nuestra app
  environment?: string;   // production, staging, development
}

/**
 * Configuración para generación de tokens
 */
export interface TokenConfig {
  expiresIn?: string | number;  // Tiempo de expiración (default: 1h)
  audience?: string;            // Audiencia específica
  issuer?: string;              // Emisor (nuestra URL)
}

/**
 * Genera un JWT firmado con RSA256 para autenticación bancaria
 * 
 * @param payload Datos a incluir en el token (sin iat, exp, jti que se generan automáticamente)
 * @param config Configuración adicional del token
 * @returns JWT firmado listo para usar
 */
export function generateBankToken(
  payload: Omit<TokenPayload, 'iat' | 'exp' | 'jti'>, 
  config: TokenConfig = {}
): string {
  const privateKey = process.env.JWT_PRIVATE_KEY;
  const keyId = process.env.JWT_KEY_ID || 'pulse-main-key';
  
  if (!privateKey) {
    throw new Error('JWT_PRIVATE_KEY no está configurada en las variables de entorno');
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresIn = config.expiresIn || '1h';
  
  // Calcular tiempo de expiración
  let exp: number;
  if (typeof expiresIn === 'string') {
    // Convertir strings como '1h', '30m', etc.
    const timeMap: Record<string, number> = {
      's': 1, 'm': 60, 'h': 3600, 'd': 86400
    };
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (match) {
      const [, amount, unit] = match;
      exp = now + (parseInt(amount) * timeMap[unit]);
    } else {
      exp = now + 3600; // Default 1 hora
    }
  } else {
    exp = now + expiresIn;
  }

  // Payload completo con claims requeridos
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: exp,
    nbf: now, // Token válido desde ahora
    jti: generateJTI(), // ID único del token
    
    // Valores por defecto si no se proporcionan
    iss: payload.iss || config.issuer || getAppUrl(),
    aud: payload.aud || config.audience || 'banco-api',
    sub: payload.sub || 'biotissue-pulse-app',
    
    // Información de la aplicación
    companyName: payload.companyName || 'BioTissue Colombia',
    apiVersion: payload.apiVersion || '1.0',
    appVersion: process.env.npm_package_version || '0.1.0',
    environment: process.env.NODE_ENV || 'production'
  };

  try {
    // Generar JWT con RSA256
    const token = jwt.sign(fullPayload, privateKey, {
      algorithm: 'RS256',
      keyid: keyId,
      header: {
        typ: 'JWT',
        alg: 'RS256',
        kid: keyId
      }
    });

    console.log('✅ JWT generado exitosamente');
    console.log(`🎫 JTI: ${fullPayload.jti}`);
    console.log(`⏰ Expira: ${new Date(exp * 1000).toISOString()}`);
    console.log(`👤 Audiencia: ${fullPayload.aud}`);

    return token;

  } catch (error) {
    console.error('❌ Error generando JWT:', error);
    throw new Error(`Error al generar token JWT: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Valida un JWT (útil para testing)
 * 
 * @param token JWT a validar
 * @param publicKey Llave pública para validación (opcional, usa la del entorno)
 * @returns Payload decodificado si es válido
 */
export function validateToken(token: string, publicKey?: string): TokenPayload {
  try {
    const key = publicKey || process.env.JWT_PUBLIC_KEY;
    if (!key) {
      throw new Error('No se encontró llave pública para validación');
    }

    const decoded = jwt.verify(token, key, {
      algorithms: ['RS256']
    }) as TokenPayload;

    return decoded;

  } catch (error) {
    console.error('❌ Error validando JWT:', error);
    throw new Error(`Token inválido: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Genera un ID único para el JWT (JTI)
 * Formato: pulse-{timestamp}-{random}
 */
function generateJTI(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `pulse-${timestamp}-${random}`;
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
 * Extrae información del header de un JWT sin validarlo
 * Útil para debugging
 */
export function decodeTokenHeader(token: string) {
  try {
    const [headerB64] = token.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
    return header;
  } catch (error) {
    throw new Error('Token JWT malformado');
  }
}

/**
 * Extrae el payload de un JWT sin validarlo
 * Útil para debugging (NO usar en producción sin validar)
 */
export function decodeTokenPayload(token: string): TokenPayload {
  try {
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    return payload;
  } catch (error) {
    throw new Error('Token JWT malformado');
  }
}
