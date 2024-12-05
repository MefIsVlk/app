import React, { useEffect, useRef, useState } from 'react';
import ApexCharts from 'apexcharts';
import './Principal.css';

function Principal() {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState({ productos: [], ganancias: [], ventas: [] });
  const [totales, setTotales] = useState({ totalGanancias: 0, totalVentas: 0 });

  // Obtener datos del backend
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch('http://localhost:3000/productos/ganancias'); // URL del endpoint
        const data = await response.json();

        // Transformar los datos para el gráfico
        const transformedData = {
          productos: data.productos.map((item) => item.producto),
          ganancias: data.productos.map((item) => item.ganancia_total),
          ventas: data.productos.map((item) => item.numero_ventas),
        };

        setChartData(transformedData);
        setTotales({
          totalGanancias: data.totales.total_ganancia,
          totalVentas: data.totales.total_ventas,
        });
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };

    fetchProductos();
  }, []);

  // Renderizar el gráfico con los datos obtenidos
  useEffect(() => {
    if (chartData.productos.length > 0) {
      const options = {
        chart: {
          height: 380,
          type: 'bar', // Gráfico de barras
          background: '#000000',
        },
        series: [
          {
            name: 'Ganancias Totales',
            data: chartData.ganancias,
          },
          {
            name: 'Número de Ventas',
            data: chartData.ventas,
          },
        ],
        xaxis: {
          categories: chartData.productos,
          labels: {
            style: {
              colors: '#52C41A',
            },
          },
        },
        yaxis: [
          {
            title: {
              text: 'Ganancias ($)',
              style: { color: '#52C41A' },
            },
          },
          {
            opposite: true,
            title: {
              text: 'Número de Ventas',
              style: { color: '#FFD700' },
            },
          },
        ],
        title: {
          text: 'Ganancias y Ventas por Producto',
          style: {
            color: '#52C41A',
          },
        },
        plotOptions: {
          bar: {
            horizontal: false, // Barras verticales
            columnWidth: '50%',
          },
        },
        colors: ['#52C41A', '#FFD700'], // Colores de las series
      };

      const chart = new ApexCharts(chartRef.current, options);
      chart.render();

      return () => {
        chart.destroy();
      };
    }
  }, [chartData]);

  return (
    <div className="app-container dark">
      {/* Contenedor para los totales, alineados horizontalmente */}
      <div className="totales-wrapper">
        {/* Contenedor separado para Ganancias Totales */}
        <div className="totales-container ganancias">
          <h2>Total de Ganancias</h2>
          <p>${totales.totalGanancias.toFixed(2)}</p>
        </div>
  
        {/* Contenedor separado para Número de Ventas */}
        <div className="totales-container ventas">
          <h2>Total de Ventas</h2>
          <p>{totales.totalVentas}</p>
        </div>
      </div>
  
      {/* Gráfico */}
      <div className="chart-section dark">
        <div className="chart-title">Ganancias y Ventas</div>
        <div id="chart" ref={chartRef}></div>
      </div>
    </div>
  );
}  
export default Principal;
