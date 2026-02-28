/* ============================================================
   MAIN.JS — StoryData Studio
   Proyecto Final: Dashboard Campañas Marketing Bancario
   Responsable: Felipe Ardila
   
   ¿Qué hace este archivo?
   1. Carga el CSV desde la carpeta data/
   2. Limpia y prepara los datos para visualización
   3. Calcula los KPIs y los inyecta en el HTML
   4. Llama a cada función de gráfica (una por chart)
   ============================================================ */


/* ============================================================
   1. CONFIGURACIÓN GLOBAL
   Colores de la paleta disponibles para todas las gráficas
   ============================================================ */
const COLORS = {
  crimson : '#C0392B',
  coral   : '#E8523F',
  magenta : '#A0286E',
  purple  : '#6B2FA0',
  steel   : '#2D6FA0',
  muted   : '#B5A898',
  subtle  : '#EDE8DE',
  textPrimary: '#1C1410'
};

// Secuencia ordenada para gráficas con múltiples series
const COLOR_SCALE = [
  COLORS.crimson,
  COLORS.magenta,
  COLORS.purple,
  COLORS.coral,
  COLORS.steel
];


/* ============================================================
   2. CARGA DEL CSV
   d3.csv() lee el archivo y convierte cada fila en un objeto JS
   Ejemplo de fila: { age: "41", job: "technician", y: "yes", ... }
   ============================================================ */
d3.csv('data/bank-full-clean.csv')

  // .then() se ejecuta cuando el archivo terminó de cargar
  .then(function(data) {

    // Confirmación en consola — abre DevTools (F12) para verlo
    console.log(`✅ CSV cargado: ${data.length} filas`);
    console.log('Ejemplo de fila:', data[0]);

    // Paso 1: limpiar y convertir tipos de datos
    const cleanData = prepareData(data);

    // Paso 2: calcular y mostrar los KPIs en el HTML
    renderKPIs(cleanData);

    // Paso 3: dibujar cada gráfica
    // Cuando Laura tenga sus gráficas listas, se descomentan una a una
    renderChart1(cleanData);   // Gráfica 1
    renderChart2(cleanData);   // Gráfica 2
    renderChart3(cleanData);   // Gráfica 3
    renderChart4(cleanData);   // Gráfica 4

  })

  // .catch() se ejecuta si hay un error al cargar el CSV
  .catch(function(error) {
    console.error('❌ Error al cargar el CSV:', error);
    // Muestra un mensaje de error visible en la página
    document.querySelectorAll('.chart-card__canvas').forEach(el => {
      el.textContent = 'Error al cargar los datos';
      el.style.color = COLORS.crimson;
    });
  });


/* ============================================================
   3. PREPARACIÓN DE DATOS
   Convierte strings a números donde sea necesario
   y estandariza valores para las visualizaciones

   NOTA PARA MARCO: si el CSV tiene columnas con nombres
   diferentes, ajusta los nombres aquí
   ============================================================ */
function prepareData(rawData) {

  return rawData.map(function(row) {
    return {

      // Datos demográficos
      age     : +row.age,          // "+" convierte string a número
      job     : row.job,
      marital : row.marital,
      education: row.education,

      // Datos financieros
      balance : +row.balance,
      housing : row.housing,
      loan    : row.loan,

      // Datos de la campaña
      contact  : row.contact,
      duration : +row.duration,
      campaign : +row.campaign,    // número de llamadas esta campaña
      pdays    : +row.pdays,       // días desde último contacto
      previous : +row.previous,   // llamadas campañas anteriores
      poutcome : row.poutcome,     // resultado campaña anterior

      // Variable objetivo — "yes" o "no"
      // Convertimos a booleano para facilitar los cálculos
      subscribed: row.y === 'yes'

    };
  });
}


/* ============================================================
   4. KPIs
   Calcula 4 métricas clave y las inyecta en el HTML
   Los id corresponden a los definidos en index.html
   ============================================================ */
function renderKPIs(data) {

  // --- KPI 1: Total de clientes analizados ---
  const totalClientes = data.length;
  // Formatea el número con separador de miles: 45218 → "45.218"
  document.getElementById('kpi-1').textContent =
    totalClientes.toLocaleString('es-CO');


  // --- KPI 2: Tasa de conversión global ---
  const suscritos = data.filter(d => d.subscribed).length;
  const tasaConversion = ((suscritos / totalClientes) * 100).toFixed(1);
  document.getElementById('kpi-2').textContent = tasaConversion + '%';


  // --- KPI 3 y 4: [AQUÍ VA LO QUE DEFINA LAURA] ---
  // Ejemplos de métricas posibles — descomentar la que elija el equipo:

  // Opción A — Promedio de llamadas por cliente
  // const promedioLlamadas = d3.mean(data, d => d.campaign).toFixed(1);
  // document.getElementById('kpi-3').textContent = promedioLlamadas + 'x';

  // Opción B — Porcentaje con campaña anterior exitosa
  // const exitoAnterior = data.filter(d => d.poutcome === 'success').length;
  // const tasaExitoAnterior = ((exitoAnterior / totalClientes) * 100).toFixed(1);
  // document.getElementById('kpi-3').textContent = tasaExitoAnterior + '%';

  // Opción C — Edad promedio del cliente suscrito
  // const edadPromedio = d3.mean(data.filter(d => d.subscribed), d => d.age).toFixed(0);
  // document.getElementById('kpi-3').textContent = edadPromedio + ' años';

  // Por ahora dejamos placeholder hasta que el equipo decida
  document.getElementById('kpi-3').textContent = '—';
  document.getElementById('kpi-4').textContent = '—';

}


/* ============================================================
   5. HELPER: CREAR TOOLTIP
   Función reutilizable que crea el tooltip para cualquier gráfica
   Laura puede llamar createTooltip() en cada gráfica que haga
   ============================================================ */
function createTooltip() {

  // Crea el div del tooltip si no existe aún
  let tooltip = d3.select('body').select('.tooltip');

  if (tooltip.empty()) {
    tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip');
  }

  return tooltip;
}

// Función para mostrar el tooltip
function showTooltip(tooltip, event, content) {
  tooltip
    .html(content)
    .classed('visible', true)
    .style('left', (event.pageX + 12) + 'px')
    .style('top',  (event.pageY - 28) + 'px');
}

// Función para ocultar el tooltip
function hideTooltip(tooltip) {
  tooltip.classed('visible', false);
}


/* ============================================================
   6. HELPER: DIMENSIONES DEL CANVAS
   Calcula el ancho y alto disponible de cada contenedor
   Para que las gráficas sean siempre responsivas
   ============================================================ */
function getCanvasDimensions(canvasId, margin) {

  const canvas = document.getElementById(canvasId);

  return {
    width  : canvas.clientWidth  - margin.left - margin.right,
    height : canvas.clientHeight - margin.top  - margin.bottom
  };
}


/* ============================================================
   7. GRÁFICAS — PLACEHOLDERS
   Cada función corresponde a un chart-card en el HTML
   Laura completa cada función con su código D3

   INSTRUCCIONES PARA LAURA:
   - Cada función recibe "data" — el array completo ya limpio
   - Usa d3.select('#canvas-X') para seleccionar el contenedor
   - El tamaño del canvas ya está definido en style.css (min-height: 280px)
   - Usa COLORS y COLOR_SCALE para los colores
   - Usa createTooltip() para los tooltips
   ============================================================ */


/* ---------- GRÁFICA 1 ---------- */
function renderChart1(data) {

  const margin = {top: 20, right: 30, bottom: 40, left: 60};
  const {width, height} = getCanvasDimensions('canvas-1', margin);

  // Limpiar el canvas antes de dibujar
  d3.select('#canvas-1').html('');

  // Crear el SVG
  const svg = d3.select('#canvas-1')
    .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // Procesar datos: contar suscripciones por educación
  const educationData = d3.rollups(data, 
    v => d3.sum(v, d => d.subscribed ? 1 : 0),
    d => d.education
  ).map(([key, value]) => ({education: key, count: value}))
   .sort((a, b) => d3.descending(a.count, b.count));

  // Escalas
  const x = d3.scaleBand()
    .range([0, width])
    .domain(educationData.map(d => d.education))
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(educationData, d => d.count)])
    .nice()
    .range([height, 0]);

  // Ejes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
      .style('text-anchor', 'middle');

  svg.append('g')
    .call(d3.axisLeft(y));

  // Barras
  const tooltip = createTooltip();

  svg.selectAll('.bar')
    .data(educationData)
    .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.education))
      .attr('y', d => y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y(d.count))
      .attr('fill', COLORS.steel)
      .on('mousemove', function(event, d) {
        d3.select(this).attr('fill', COLORS.coral);
        showTooltip(tooltip, event, `<strong>Educación:</strong> ${d.education}<br><strong>Suscritos:</strong> ${d.count}`);
      })
      .on('mouseleave', function() {
        d3.select(this).attr('fill', COLORS.steel);
        hideTooltip(tooltip);
      });
}


/* ---------- GRÁFICA 2 ---------- */
function renderChart2(data) {

  // [AQUÍ VA EL CÓDIGO D3 DE LAURA — GRÁFICA 2]
  // Sugerencia: gráfica de tasa de conversión por ocupación

  d3.select('#canvas-2')
    .style('color', COLORS.muted)
    .text('[Gráfica 2 — pendiente Laura]');
}


/* ---------- GRÁFICA 3 ---------- */
function renderChart3(data) {

  // [AQUÍ VA EL CÓDIGO D3 DE LAURA — GRÁFICA 3]
  // Sugerencia: scatter plot duración de llamada vs conversión

  d3.select('#canvas-3')
    .style('color', COLORS.muted)
    .text('[Gráfica 3 — pendiente Laura]');
}


/* ---------- GRÁFICA 4 ---------- */
function renderChart4(data) {

  // [AQUÍ VA EL CÓDIGO D3 DE LAURA — GRÁFICA 4]
  // Sugerencia: gráfica de resultado campaña anterior vs conversión

  d3.select('#canvas-4')
    .style('color', COLORS.muted)
    .text('[Gráfica 4 — pendiente Laura]');
}