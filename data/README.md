# Gestión Manual de Métricas

Este archivo contiene instrucciones para actualizar manualmente los datos de las métricas en Pulse.

## Archivo de Datos

Los datos se encuentran en: `data/metrics.json`

## Cómo Actualizar los Datos

### 1. Editar el archivo JSON

Abre el archivo `data/metrics.json` y modifica los valores según necesites:

```json
{
  "metrics": {
    "ventas": {
      "value": 120000000,           // Valor real en pesos
      "formattedValue": "$120.000.000", // Valor formateado para mostrar
      "target": 140000000,          // Meta del período
      "percentage": 85              // Porcentaje de cumplimiento (value/target * 100)
    }
  }
}
```

### 2. Campos Principales

**Para cada métrica puedes actualizar:**
- `value`: Valor numérico real
- `formattedValue`: Cómo se muestra en la interfaz
- `target`: Meta o objetivo del período
- `percentage`: Porcentaje de progreso (se calcula como value/target * 100)

### 3. Actualizar Fecha

Cambia el campo `lastUpdated` con la fecha actual:
```json
"lastUpdated": "2025-01-10T15:30:00.000Z"
```

### 4. Información del Período

Puedes actualizar el período que representan los datos:
```json
"period": {
  "start": "2025-01-01",
  "end": "2025-01-31", 
  "description": "Enero 2025"
}
```

## Métricas Disponibles

1. **Ventas**: Ingresos por ventas del período
2. **Recaudo**: Dinero efectivamente cobrado
3. **Inventario**: Valor del inventario actual
4. **Margen**: Porcentaje de margen de ganancia
5. **Caja**: Efectivo disponible

## Consejos

- **Mantén el formato**: Respeta la estructura JSON
- **Valores coherentes**: Asegúrate de que los porcentajes correspondan a los valores
- **Formato de moneda**: Usa el formato colombiano con puntos como separadores de miles
- **Backup**: Haz una copia del archivo antes de hacer cambios grandes

## Próximos Pasos

Una vez que tengas más claridad sobre qué datos necesitas de Alegra, podrás:
1. Automatizar la carga desde la API
2. Crear un formulario web para edición
3. Migrar a una base de datos más robusta

## Ejemplo de Actualización Rápida

Para actualizar solo las ventas:

```json
{
  "lastUpdated": "2025-01-10T16:00:00.000Z",
  "metrics": {
    "ventas": {
      "title": "Ventas",
      "value": 150000000,
      "formattedValue": "$150.000.000",
      "target": 140000000,
      "percentage": 107,
      "showProgressBar": true
    }
  }
}
```

Guarda el archivo y recarga la página para ver los cambios.
