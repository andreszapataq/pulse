#!/usr/bin/env tsx

/**
 * Script para generar llaves RSA de 2048 bits para JWT
 * 
 * Este script genera:
 * 1. Par de llaves RSA de 2048 bits (cumple requisitos del banco)
 * 2. Llave privada en formato PEM (para JWT_PRIVATE_KEY)
 * 3. Llave pública en formato PEM (para validación local)
 * 4. JWK público (lo que verá el banco en el endpoint JWKS)
 * 
 * Uso:
 *   npx tsx scripts/generate-keys.ts
 */

import { generateRSAKeyPair, validateRSAKeySize } from '../lib/crypto';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🔐 Generando llaves RSA para JWT...');
  console.log('📏 Tamaño: 2048 bits (cumple requisitos bancarios)');
  console.log('🔧 Algoritmo: RS256');
  console.log('');

  try {
    // Generar par de llaves RSA
    console.log('⚡ Generando llaves...');
    const { privateKey, publicKey, jwk, keyId } = await generateRSAKeyPair();
    
    // Validar que cumple con los requisitos
    if (!validateRSAKeySize(jwk)) {
      throw new Error('❌ La llave generada no cumple con el tamaño mínimo de 2048 bits');
    }

    console.log('✅ Llaves generadas exitosamente');
    console.log(`🆔 Key ID: ${keyId}`);
    console.log(`📏 Tamaño verificado: ${Buffer.from(jwk.n, 'base64url').length * 8} bits`);
    console.log('');

    // Mostrar la información que necesitas copiar
    console.log('=' .repeat(80));
    console.log('🔑 LLAVE PRIVADA (Copia esto a JWT_PRIVATE_KEY en Vercel)');
    console.log('=' .repeat(80));
    console.log(privateKey);
    console.log('');

    console.log('=' .repeat(80));
    console.log('🆔 KEY ID (Copia esto a JWT_KEY_ID en Vercel)');
    console.log('=' .repeat(80));
    console.log(keyId);
    console.log('');

    console.log('=' .repeat(80));
    console.log('🌐 LLAVE PÚBLICA (Para validación local - opcional)');
    console.log('=' .repeat(80));
    console.log(publicKey);
    console.log('');

    console.log('=' .repeat(80));
    console.log('📋 JWK PÚBLICO (Esto verá el banco en /.well-known/jwks.json)');
    console.log('=' .repeat(80));
    console.log(JSON.stringify(jwk, null, 2));
    console.log('');

    // Guardar archivos para referencia (opcional)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const keyDir = join(process.cwd(), 'keys');
    
    try {
      const fs = require('fs');
      if (!fs.existsSync(keyDir)) {
        fs.mkdirSync(keyDir, { recursive: true });
      }
      
      writeFileSync(join(keyDir, `private-key-${timestamp}.pem`), privateKey);
      writeFileSync(join(keyDir, `public-key-${timestamp}.pem`), publicKey);
      writeFileSync(join(keyDir, `jwk-${timestamp}.json`), JSON.stringify(jwk, null, 2));
      writeFileSync(join(keyDir, `key-info-${timestamp}.txt`), 
        `Key ID: ${keyId}\nGenerated: ${new Date().toISOString()}\nSize: ${Buffer.from(jwk.n, 'base64url').length * 8} bits\nAlgorithm: RS256\n`
      );

      console.log('💾 Archivos guardados en ./keys/ para referencia');
      console.log(`📁 Archivos generados:`);
      console.log(`   - private-key-${timestamp}.pem`);
      console.log(`   - public-key-${timestamp}.pem`);
      console.log(`   - jwk-${timestamp}.json`);
      console.log(`   - key-info-${timestamp}.txt`);
      console.log('');
    } catch (saveError) {
      console.log('⚠️  No se pudieron guardar los archivos de referencia (no es crítico)');
    }

    // Instrucciones para configurar en Vercel
    console.log('🚀 PRÓXIMOS PASOS:');
    console.log('');
    console.log('1. Ve a tu proyecto en Vercel Dashboard');
    console.log('2. Ve a Settings > Environment Variables');
    console.log('3. Agrega estas variables:');
    console.log('');
    console.log('   Variable: JWT_PRIVATE_KEY');
    console.log('   Value: [Copia la llave privada de arriba, incluyendo -----BEGIN/END-----]');
    console.log('');
    console.log('   Variable: JWT_KEY_ID');
    console.log(`   Value: ${keyId}`);
    console.log('');
    console.log('4. Redespliega tu aplicación');
    console.log('5. Verifica el endpoint: https://tu-app.vercel.app/.well-known/jwks.json');
    console.log('6. Proporciona esa URL al banco');
    console.log('');
    console.log('✅ ¡Configuración completa!');

  } catch (error) {
    console.error('❌ Error generando llaves:', error);
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
}

export { main as generateKeys };
