# SynoptiK - Archivos de Datos de Producción (Noviembre)

Este directorio contiene archivos de muestra para probar la lectura al 100% de reportes de producción en la aplicación SynoptiK.

## Estructura de los Archivos

### 1. reporte_noviembre.xlsx (Excel - Registro Diario)
La aplicación espera un archivo Excel con una hoja llamada **"Registro Diario"** que contenga los 3 turnos. Cada turno tiene dos secciones:

**Sección Paradas (Tiempos Muertos):**
| Hora | Cód. Motivo | Motivo Parada | Minutos Parada | Minutos Vacíos de Horno | Observaciones |

**Sección Acciones Correctivas/Preventivas:**
| Hora | Problema/Defecto | Acción Correctiva / Preventiva | Responsable | Estado | Observaciones |

Los turnos se detectan automáticamente mediante banners como "TURNO MAÑANA", "TURNO TARDE", "TURNO NOCHE".

### 2. Archivos CSV Diarios (reporte_DD_noviembre.csv)
Uno por día del mes (30 o 31 archivos). Cada uno contiene las paradas del día con columnas:
| Turno | Hora | Cód. Motivo | Motivo Parada | Minutos Parada | Minutos Vacíos | Observaciones |

### 3. Archivos CSV de Acciones (acciones_DD_noviembre.csv)
Acciones correctivas/preventivas por día con columnas:
| Turno | Hora | Problema/Defecto | Acción Correctiva / Preventiva | Responsable | Estado | Observaciones |

### 4. Catalogo de Códigos (catalogo_codigos.csv)
Referencia de códigos de motivo:
| Código | Descripción | Tipo |
| P-01 | Falla de sensor de temperatura | Sensor |
| P-02 | Falla de motor / energía | Eléctrico |
| P-03 | Mantenimiento preventivo | Mantenimiento |
| P-04 | Falla de horno industrial | Horno |
| P-05 | Obstrucción en tolva/línea | Mecánico |
| P-06 | Vacío de horno por parada | Horno |

## Cómo Usar con SynoptiK

1. Abre la aplicación SynoptiK (`index.html`)
2. Haz clic en el botón de carga de archivos
3. Selecciona:
   - **Un solo archivo Excel** `reporte_noviembre.xlsx` (con hoja "Registro Diario")
   - **O una carpeta** con todos los CSV diarios del mes (30-31 archivos)
4. La aplicación detectará automáticamente:
   - Los 3 turnos (Mañana, Tarde, Noche)
   - Las paradas y sus minutos de parada/vacíos
   - Las acciones correctivas y su estado
5. Verás:
   - **KPIs con semáforo** (disponibilidad, causa principal, turno más afectado, eficacia de acciones)
   - **Gráficos** de paradas por código, vacíos por horno, distribución por turno
   - **Tablas detalladas** con todos los datos leídos
   - **Análisis de qué código generó más paradas y más vacíos**

## Capacidades de la Aplicación

- ✅ Lectura de Excel (.xlsx, .xls) con múltiples hojas
- ✅ Detección automática de hoja "Registro Diario"
- ✅ Lectura de 3 turnos: Mañana, Tarde, Noche
- ✅ Lectura de paradas: hora, código, motivo, min parada, min vacíos, observaciones
- ✅ Lectura de acciones: hora, problema, acción, responsable, estado, observaciones
- ✅ Lectura de 30-31 archivos diarios (consolidación del mes)
- ✅ Análisis: código con más paradas y código con más vacíos de horno
- ✅ KPIs con semáforo (verde/ámbar/rojo)
- ✅ Gráficos SVG generados automáticamente
- ✅ Exportación de resultados a Excel

## Formato de Fecha y Hora

- Horas: formato HH:MM (ej: 06:30, 14:20, 22:00)
- Minutos: valores numéricos enteros
- Códigos: formato P-XX (ej: P-01, P-04)