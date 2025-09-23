/**
 * Utilidades para generar y manejar llaves RSA para JWT
 * Cumple con los requisitos del banco: RSA 2048 bits mínimo
 */

import * as jose from 'node-jose';

/**
 * Tipo para JWK RSA público
 */
export interface RSAPublicJWK {
  kty: 'RSA';
  kid: string;
  use: 'sig';
  alg: 'RS256';
  n: string;  // Módulo RSA en base64url
  e: string;  // Exponente público en base64url
}

/**
 * Genera un par de llaves RSA de 2048 bits para JWT
 * @returns Par de llaves en diferentes formatos
 */
export async function generateRSAKeyPair() {
  const keyStore = jose.JWK.createKeyStore();
  
  // Generar llave RSA de 2048 bits (cumple requisitos del banco)
  const key = await keyStore.generate('RSA', 2048, {
    alg: 'RS256',        // Algoritmo de firma
    use: 'sig',          // Uso: firma
    kid: `pulse-key-${Date.now()}` // Key ID único basado en timestamp
  });
  
  return {
    privateKey: key.toPEM(true),  // Llave privada en formato PEM
    publicKey: key.toPEM(false),  // Llave pública en formato PEM
    jwk: key.toJSON(),            // Llave en formato JWK para el endpoint
    keyId: key.kid                // ID de la llave
  };
}

/**
 * Convierte una llave privada PEM a formato JWK público
 * @param privateKeyPEM Llave privada en formato PEM
 * @param keyId ID único para la llave
 * @returns JWK público para el endpoint JWKS
 */
export async function privateKeyToPublicJWK(privateKeyPEM: string, keyId: string): Promise<RSAPublicJWK> {
  try {
    // Crear objeto JWK desde la llave privada PEM
    const key = await jose.JWK.asKey(privateKeyPEM, 'pem');
    
    // Obtener solo la parte pública
    const publicJWK = key.toJSON(false); // false = solo parte pública
    
    // Agregar metadatos requeridos para JWKS
    return {
      ...publicJWK,
      kid: keyId,          // Key ID
      alg: 'RS256',        // Algoritmo
      use: 'sig',          // Uso: firma
      kty: 'RSA'           // Tipo de llave: RSA
    } as RSAPublicJWK;
  } catch (error) {
    console.error('Error convirtiendo llave privada a JWK público:', error);
    throw new Error('Error procesando llave RSA');
  }
}

/**
 * Valida que una llave RSA tenga al menos 2048 bits
 * @param jwk Llave en formato JWK
 * @returns true si cumple los requisitos del banco
 */
export function validateRSAKeySize(jwk: any): boolean {
  if (jwk.kty !== 'RSA') {
    return false;
  }
  
  // Verificar que el módulo (n) tenga al menos 2048 bits
  // El módulo en base64url debe tener al menos 256 bytes (2048 bits / 8)
  const modulusBytes = Buffer.from(jwk.n, 'base64url').length;
  return modulusBytes >= 256; // 2048 bits / 8 = 256 bytes
}
