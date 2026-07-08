const { jsPDF } = require('jspdf');

const generarReportePDF = async (data) => {
  const doc = new jsPDF();
  
  // Configuración inicial
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(23, 162, 184);
  doc.text('Reporte de la Clínica Dental', 105, 20, { align: 'center' });
  
  // Fecha del reporte
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Estadísticas generales
  doc.setFontSize(14);
  doc.setTextColor(23, 162, 184);
  doc.text('Estadísticas Generales', 14, 40);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de Pacientes: ${data.totalPacientes}`, 14, 50);
  doc.text(`Total de Tratamientos: ${data.totalTratamientos}`, 14, 60);
  doc.text(`Total de Pagos: ${data.totalPagos}`, 14, 70);
  doc.text(`Ingresos Totales: ${data.totalIngresos.toFixed(2)} BOB`, 14, 80);
  
  // Tratamientos más comunes
  doc.setFontSize(14);
  doc.setTextColor(23, 162, 184);
  doc.text('Tratamientos Más Comunes', 14, 100);
  
  let y = 110;
  data.tratamientosComunes.forEach((tratamiento, index) => {
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${index + 1}. ${tratamiento._id}: ${tratamiento.count}`, 20, y);
    y += 10;
  });
  
  // Ingresos por mes
  doc.setFontSize(14);
  doc.setTextColor(23, 162, 184);
  doc.text('Ingresos por Mes', 14, y + 10);
  
  y += 20;
  data.ingresosPorMes.forEach(ingreso => {
    const mes = ingreso._id.month.toString().padStart(2, '0');
    const año = ingreso._id.year;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${mes}/${año}: ${ingreso.total.toFixed(2)} BOB`, 20, y);
    y += 10;
  });
  
  // Pie de página
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Reporte generado por el Sistema de Gestión Dental', 105, 280, { align: 'center' });
  
  return doc;
};

module.exports = { generarReportePDF };