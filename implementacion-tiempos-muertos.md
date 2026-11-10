# Implementación: Sección Análisis de Tiempos Muertos

## Fase 1: Detección Automática del Tipo de Archivo ✅

### 1.1 Agregar nuevo rubro "tiempos-muertos"

**Ubicación:** Después de la línea 12420 (antes de `general:`)

```javascript
'tiempos-muertos': {
    clave: 'tiempos-muertos',
    etiqueta: 'Tiempos muertos de producción',
    descripcion: 'Paradas de máquinas, tiempos de inactividad y análisis de disponibilidad',
    icono: 'fabrica',
    palabrasEnColumnas: [
        'maquina', 'máquina', 'equipo', 'centro', 'prensa', 'horno',
        'esmalte', 'linea', 'turno', 'parada', 'paradas', 'motivo',
        'duracion', 'duración', 'minutos', 'vacios', 'vacíos',
        'observaciones', 'grupo', 'proceso', 'quemado', 'prensado',
        'disponibilidad', 'falla', 'mantenimiento', 'limpieza',
        'cambio', 'formato', 'producto', 'rodillera', 'secadero'
    ],
    palabrasEnValores: [
        'paro', 'parada', 'falla', 'mantenimiento', 'limpieza',
        'cambio de producto', 'cambio de formato', 'falta polvo',
        'bloqueo', 'atoramiento', 'turno mañana', 'turno tarde',
        'turno noche', 'preventivo', 'correctivo'
    ],
    dimensionesPreferidas: ['maquina', 'turno', 'motivo', 'grupo', 'proceso', 'centro'],
    metricasPreferidas: ['duracion', 'duración', 'minutos', 'vacios', 'vacíos'],
    preguntasClave: [
        'Qué máquinas tienen más paradas',
        'Cuáles son los motivos que más tiempo generan',
        'Qué turno es más afectado por paradas',
        'Cómo evoluciona la disponibilidad en el tiempo'
    ],
    enfoque: 'disponibilidad y mantenimiento industrial'
},
```

---

## Fase 2: Agregar Nueva Sección al Menú HTML ✅

### 2.1 Agregar botón en la navegación

**Ubicación:** Línea 6319 (después del botón de "Análisis de Turnos")

```html
<button type="button" class="navegacion-boton" data-seccion="tiempos-muertos" id="nav-seccion-tiempos-muertos">
    <svg class="icono"><use href="#ico-fabrica"/></svg>
    Tiempos Muertos
</button>
```

### 2.2 Agregar contenedor de la sección

**Ubicación:** Línea 6443 (después de seccion-ventas)

```html
<section class="seccion" id="seccion-tiempos-muertos" data-seccion="tiempos-muertos" hidden></section>
```

---

## Fase 3: Crear Función Principal de Dibujado

### 3.1 Estructura principal

**Ubicación:** Después de la función `dibujarVistaVentas` (aprox línea 29000)

```javascript
/**
 * Dibuja la vista especializada de Tiempos Muertos de Producción
 * 
 * @param {HTMLElement} contenedor - Contenedor de la sección
 * @param {object} contexto - Estado, análisis, datos filtrados, etc.
 */
function dibujarVistaTiemposMuertos(contenedor, {
    estado,
    analisis,
    alcance,
    datosFiltrados,
    filtros,
    textoBusqueda
}) {
    const partes = [];
    
    // Título de la sección
    partes.push(crearTituloSeccion({
        titulo: 'Análisis de Tiempos Muertos de Producción',
        descripcion: 'Análisis detallado de paradas, disponibilidad de equipos y observaciones de planta',
        icono: 'fabrica'
    }));
    
    // Resumen de alcance
    partes.push(crearResumenAlcance(alcance));
    
    // KPIs principales
    partes.push(crearPanelKPIsTiemposMuertos(datosFiltrados, estado));
    
    // Rankings TOP 5
    partes.push(crearPanelRankingsTiemposMuertos(datosFiltrados, estado));
    
    // Gráfico temporal mejorado
    partes.push(crearPanelTemporalTiemposMuertos(datosFiltrados, estado));
    
    // Filtros jerárquicos
    partes.push(crearPanelFiltrosJerarquicos(datosFiltrados, estado));
    
    reemplazarContenido(contenedor, partes);
}
```

---

## Fase 4: Implementar Funciones de Cálculo

### 4.1 Calcular métricas principales

```javascript
/**
 * Calcula métricas clave de tiempos muertos
 */
function calcularMetricasTiemposMuertos(datos) {
    // Detectar columnas
    const colMaquina = detectarColumna(datos[0], ['maquina', 'máquina', 'equipo', 'centro']);
    const colMotivo = detectarColumna(datos[0], ['motivo', 'causa', 'codigo']);
    const colDuracion = detectarColumna(datos[0], ['duracion', 'duración', 'minutos', 'tiempo']);
    const colFecha = detectarColumna(datos[0], ['fecha', 'fecha sap']);
    const colTurno = detectarColumna(datos[0], ['turno']);
    const colObservaciones = detectarColumna(datos[0], ['observaciones', 'observacion', 'comentario', 'detalle']);
    
    const metricas = {
        totalMinutos: 0,
        totalEventos: datos.length,
        motivosPorDuracion: {},
        maquinasPorDuracion: {},
        turnosPorDuracion: {},
        eventosPorDia: {},
        observacionesPorMotivo: {}
    };
    
    datos.forEach(fila => {
        const duracion = parseFloat(fila[colDuracion]) || 0;
        const motivo = String(fila[colMotivo] || 'Sin motivo');
        const maquina = String(fila[colMaquina] || 'Sin máquina');
        const turno = String(fila[colTurno] || 'Sin turno');
        const fecha = String(fila[colFecha] || '').split(' ')[0];
        const obs = String(fila[colObservaciones] || '').trim();
        
        metricas.totalMinutos += duracion;
        
        // Agrupar por motivo
        if (!metricas.motivosPorDuracion[motivo]) {
            metricas.motivosPorDuracion[motivo] = {
                minutos: 0,
                eventos: 0,
                observaciones: []
            };
        }
        metricas.motivosPorDuracion[motivo].minutos += duracion;
        metricas.motivosPorDuracion[motivo].eventos += 1;
        if (obs) metricas.motivosPorDuracion[motivo].observaciones.push(obs);
        
        // Agrupar por máquina
        metricas.maquinasPorDuracion[maquina] = (metricas.maquinasPorDuracion[maquina] || 0) + duracion;
        
        // Agrupar por turno
        metricas.turnosPorDuracion[turno] = (metricas.turnosPorDuracion[turno] || 0) + duracion;
        
        // Agrupar por día
        if (fecha) {
            metricas.eventosPorDia[fecha] = (metricas.eventosPorDia[fecha] || 0) + duracion;
        }
    });
    
    return metricas;
}

/**
 * Detecta columna por múltiples posibles nombres
 */
function detectarColumna(fila, posiblesNombres) {
    for (const nombre of posiblesNombres) {
        const encontrada = Object.keys(fila).find(k => 
            k.toLowerCase().includes(nombre.toLowerCase())
        );
        if (encontrada) return encontrada;
    }
    return Object.keys(fila)[0]; // fallback
}
```

### 4.2 Generar TOP 5

```javascript
/**
 * Genera ranking TOP 5 de motivos
 */
function generarTop5Motivos(metricas) {
    const ranking = Object.entries(metricas.motivosPorDuracion)
        .map(([motivo, datos]) => ({
            motivo,
            minutos: datos.minutos,
            eventos: datos.eventos,
            observaciones: datos.observaciones.slice(0, 3), // Primeras 3
            porcentaje: (datos.minutos / metricas.totalMinutos) * 100
        }))
        .sort((a, b) => b.minutos - a.minutos)
        .slice(0, 5);
    
    return ranking;
}
```

---

## Fase 5: Crear Componentes Visuales

### 5.1 Panel de KPIs

```javascript
function crearPanelKPIsTiemposMuertos(datos, estado) {
    const metricas = calcularMetricasTiemposMuertos(datos);
    
    // Disponibilidad = (1440 min/día - paradas) / 1440
    const diasUnicos = Object.keys(metricas.eventosPorDia).length;
    const minutosDisponibles = (diasUnicos * 1440) - metricas.totalMinutos;
    const disponibilidad = (minutosDisponibles / (diasUnicos * 1440)) * 100;
    
    const kpis = [
        {
            titulo: 'Disponibilidad',
            valor: `${disponibilidad.toFixed(1)}%`,
            detalle: `${metricas.totalMinutos} min de paradas`,
            color: disponibilidad >= 95 ? 'correcto' : disponibilidad >= 85 ? 'aviso' : 'critico'
        },
        {
            titulo: 'Total Eventos',
            valor: formatearNumero(metricas.totalEventos),
            detalle: `En ${diasUnicos} días`,
            color: 'informativo'
        },
        {
            titulo: 'Promedio por Día',
            valor: formatearNumero(Math.round(metricas.totalMinutos / diasUnicos)),
            detalle: 'minutos/día',
            color: 'informativo'
        },
        {
            titulo: 'Máquina más afectada',
            valor: Object.entries(metricas.maquinasPorDuracion)
                .sort((a, b) => b[1] - a[1])[0][0].substring(0, 15),
            detalle: `${Math.round(Object.values(metricas.maquinasPorDuracion).sort((a,b) => b-a)[0])} min`,
            color: 'aviso'
        }
    ];
    
    return crearPanel({
        titulo: 'KPIs Principales',
        icono: 'medidor',
        cuerpo: crearGrillaKPIs(kpis)
    });
}

function crearGrillaKPIs(kpis) {
    return crearElemento('div', {
        clase: 'grilla-kpis',
        estilo: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
        }
    }, kpis.map(kpi => crearElemento('div', {
        clase: 'kpi-tarjeta',
        estilo: {
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: `4px solid var(--color-${kpi.color})`
        }
    }, [
        crearElemento('div', {
            estilo: { fontSize: '0.85em', color: '#64748b', marginBottom: '8px' },
            texto: kpi.titulo
        }),
        crearElemento('div', {
            estilo: { fontSize: '2em', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' },
            texto: kpi.valor
        }),
        crearElemento('div', {
            estilo: { fontSize: '0.9em', color: '#94a3b8' },
            texto: kpi.detalle
        })
    ])));
}
```

---

## Fase 6: Registrar Dibujante

**Ubicación:** En el objeto `DIBUJANTES` (línea 39831)

```javascript
const DIBUJANTES = {
    tablero: dibujarTablero,
    turnos: dibujarVistaTurnos,
    ventas: dibujarVistaVentas,
    'tiempos-muertos': dibujarVistaTiemposMuertos,  // ← NUEVO
    resumen: dibujarResumen,
    // ... resto
};
```

---

## Resumen de Archivos a Modificar

1. **index.html** - Línea ~12420: Agregar rubro `tiempos-muertos`
2. **index.html** - Línea ~6319: Agregar botón navegación
3. **index.html** - Línea ~6443: Agregar sección HTML
4. **index.html** - Línea ~29000: Agregar funciones de dibujado
5. **index.html** - Línea ~39831: Registrar en DIBUJANTES

---

## Próximos Pasos

Una vez implementado lo básico, agregaremos:
- [ ] Gráfico temporal con anotaciones de picos
- [ ] Filtros jerárquicos (máquina → motivo → observaciones)
- [ ] Panel de rankings TOP 5
- [ ] Exportación especializada

¿Procedemos con la implementación?
