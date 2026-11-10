// Script de diagnóstico para detectar exactamente dónde se pierden los registros

async function diagnosticar(archivo) {
    console.log('=== DIAGNÓSTICO DE LECTURA CSV ===\n');
    
    const texto = await archivo.text();
    const lineas = texto.split(/\r?\n/);
    
    console.log(`📄 Archivo: ${archivo.name}`);
    console.log(`📊 Total líneas brutas: ${lineas.length}\n`);
    
    // 1. Encontrar encabezado
    let filaEncabezado = -1;
    for (let i = 0; i < Math.min(20, lineas.length); i++) {
        if (lineas[i].trim().startsWith('Centro,')) {
            filaEncabezado = i;
            break;
        }
    }
    
    if (filaEncabezado === -1) {
        console.error('❌ No se encontró encabezado');
        return;
    }
    
    console.log(`✅ Encabezado en línea ${filaEncabezado}`);
    const encabezado = lineas[filaEncabezado].split(',');
    console.log(`📋 Columnas: ${encabezado.length}`);
    console.log(`   ${encabezado.join(' | ')}\n`);
    
    // 2. Identificar columna de Observaciones
    const idxObservaciones = encabezado.findIndex(c => c.trim().toLowerCase().includes('observacion'));
    console.log(`💬 Columna "Observaciones" en posición: ${idxObservaciones}\n`);
    
    // 3. Analizar TODAS las filas de datos
    const lineasDatos = lineas.slice(filaEncabezado + 1).filter(l => l.trim() !== '');
    console.log(`📝 Líneas de datos no vacías: ${lineasDatos.length}\n`);
    
    let correctas = 0;
    let conCamposDeMas = 0;
    let conCamposDeMenos = 0;
    let vacias = 0;
    const problematicas = [];
    
    lineasDatos.forEach((linea, idx) => {
        const campos = linea.split(',');
        const linReal = filaEncabezado + idx + 2; // +2 porque índice empieza en 0 y hay encabezado
        
        // Verificar si tiene algún dato
        const tieneAlgunDato = campos.some(c => c.trim() !== '');
        if (!tieneAlgunDato) {
            vacias++;
            return;
        }
        
        if (campos.length === encabezado.length) {
            correctas++;
        } else if (campos.length > encabezado.length) {
            conCamposDeMas++;
            if (problematicas.length < 5) {
                problematicas.push({
                    linea: linReal,
                    campos: campos.length,
                    esperados: encabezado.length,
                    extra: campos.length - encabezado.length,
                    observacion: campos[idxObservaciones] || '',
                    contenido: linea.substring(0, 100) + '...'
                });
            }
        } else {
            conCamposDeMenos++;
        }
    });
    
    console.log('=== RESUMEN DE ANÁLISIS ===');
    console.log(`✅ Filas correctas (${encabezado.length} campos): ${correctas}`);
    console.log(`⚠️  Filas con campos de MÁS: ${conCamposDeMas}`);
    console.log(`⚠️  Filas con campos de MENOS: ${conCamposDeMenos}`);
    console.log(`🔲 Filas completamente vacías: ${vacias}`);
    console.log(`\n📊 TOTAL REGISTROS ESPERADOS: ${correctas + conCamposDeMas + conCamposDeMenos}`);
    console.log(`📊 PÉRDIDA POTENCIAL: ${conCamposDeMenos} registros\n`);
    
    if (problematicas.length > 0) {
        console.log('=== EJEMPLOS DE FILAS PROBLEMÁTICAS ===');
        problematicas.forEach(p => {
            console.log(`\n📍 Línea ${p.linea}:`);
            console.log(`   Campos encontrados: ${p.campos} (esperados: ${p.esperados}, extra: ${p.extra})`);
            console.log(`   Observación: "${p.observacion}"`);
            console.log(`   Inicio: ${p.contenido}`);
        });
    }
    
    // 4. Verificar si las observaciones tienen comas
    const observacionesConComas = lineasDatos.filter(linea => {
        const campos = linea.split(',');
        const obs = campos[idxObservaciones] || '';
        return obs.includes(',') || campos.length > encabezado.length;
    }).length;
    
    console.log(`\n💡 Filas con posibles comas en Observaciones: ${observacionesConComas}`);
    
    // 5. Simular reagrupación
    console.log('\n=== SIMULACIÓN DE REAGRUPACIÓN ===');
    let recuperadas = 0;
    lineasDatos.forEach(linea => {
        const campos = linea.split(',');
        if (campos.length > encabezado.length && idxObservaciones !== -1) {
            // Simular la reagrupación
            const sobrantes = campos.length - encabezado.length;
            const antes = campos.slice(0, idxObservaciones);
            const textoRearmado = campos.slice(idxObservaciones, idxObservaciones + sobrantes + 1).join(',');
            const despues = campos.slice(idxObservaciones + sobrantes + 1);
            const reagrupados = [...antes, textoRearmado, ...despues];
            
            if (reagrupados.length === encabezado.length) {
                recuperadas++;
            }
        }
    });
    
    console.log(`✅ Filas que SE PUEDEN recuperar reagrupando: ${recuperadas}`);
    console.log(`❌ Filas que SE PERDERÍAN: ${conCamposDeMenos}`);
    console.log(`\n🎯 CREDIBILIDAD ESPERADA: ${((correctas + recuperadas) / lineasDatos.length * 100).toFixed(1)}%`);
}

// Uso
document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        await diagnosticar(file);
    }
});
