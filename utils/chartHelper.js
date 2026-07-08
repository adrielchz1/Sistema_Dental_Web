const prepareChartData = (data) => {
  // Preparar datos para gráficos
  const chartData = {
    tratamientosComunes: [],
    ingresosPorMes: []
  };
  
  // Tratamientos más comunes
  if (data.tratamientosComunes) {
    chartData.tratamientosComunes = data.tratamientosComunes.map(item => ({
      label: item._id,
      value: item.count
    }));
  }
  
  // Ingresos por mes
  if (data.ingresosPorMes) {
    chartData.ingresosPorMes = data.ingresosPorMes.map(item => ({
      label: `${item._id.month}/${item._id.year}`,
      value: item.total
    }));
  }
  
  return chartData;
};

module.exports = { prepareChartData };