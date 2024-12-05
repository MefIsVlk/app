import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reporte.css';
import { Pie } from 'react-chartjs-2';  // Para el resumen de ventas por producto
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrar los elementos necesarios para Chart.js
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function VentasPeriodo() {
  const [periodo, setPeriodo] = useState('diario');
  const [ventasPeriodo, setVentasPeriodo] = useState([]);
  const [resumenProductos, setResumenProductos] = useState([]);
  const [ventasMesa, setVentasMesa] = useState([]);

  useEffect(() => {
    const fetchVentasPeriodo = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/ventas-periodo', {
          params: { periodo },
        });
        setVentasPeriodo(response.data);
        console.log('Ventas actualizadas para el período:', periodo, response.data);
      } catch (error) {
        console.error('Error al obtener las ventas por periodo:', error);
      }
    };

    fetchVentasPeriodo();
  }, [periodo]);

  useEffect(() => {
    const fetchResumenProductos = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/resumen-productos');
        setResumenProductos(response.data);
      } catch (error) {
        console.error('Error al obtener el resumen de productos:', error);
      }
    };

    fetchResumenProductos();
  }, []);

  useEffect(() => {
    const fetchVentasMesa = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/ventas-mesa');
        setVentasMesa(response.data);
      } catch (error) {
        console.error('Error al obtener las ventas por mesa:', error);
      }
    };

    fetchVentasMesa();
  }, []);

  const coloresPrimarios = [
    'rgba(255, 99, 132, 0.6)', // Rojo
    'rgba(54, 162, 235, 0.6)', // Azul
    'rgba(255, 206, 86, 0.6)', // Amarillo
    'rgba(75, 192, 192, 0.6)', // Verde
    'rgba(153, 102, 255, 0.6)', // Violeta
    'rgba(255, 159, 64, 0.6)', // Naranja
  ];

  const ventasPorPeriodoData = {
    labels: ventasPeriodo.map((venta) => venta.periodo || venta.Dia),
    datasets: [
      {
        label: 'Total Ventas',
        data: ventasPeriodo.map((venta) => venta.TotalVentas || venta.total_ventas),
        backgroundColor: ventasPeriodo.map((_, index) => coloresPrimarios[index % coloresPrimarios.length]),
        borderColor: ventasPeriodo.map((_, index) => coloresPrimarios[index % coloresPrimarios.length]),
        borderWidth: 1,
      },
    ],
  };

  const ventasPorProductoData = {
    labels: resumenProductos.map((producto) => producto.nombre_producto || 'Sin nombre'),
    datasets: [
      {
        label: 'Total Ventas',
        data: resumenProductos.map((producto) => producto.total_ventas || 0),
        backgroundColor: resumenProductos.map((_, index) => coloresPrimarios[index % coloresPrimarios.length]),
        borderColor: resumenProductos.map((_, index) => coloresPrimarios[index % coloresPrimarios.length]),
        borderWidth: 1,
      },
    ],
  };

  const ventasPorMesaData = {
    labels: ventasMesa.map((venta) => venta.nombre_mesa || 'Sin nombre'),
    datasets: [
      {
        label: 'Total Ventas',
        data: ventasMesa.map((venta) => venta.total_ventas || 0),
        backgroundColor: ventasMesa.map((_, index) => coloresPrimarios[index % coloresPrimarios.length]),
        borderColor: ventasMesa.map((_, index) => coloresPrimarios[index % coloresPrimarios.length]),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Ventas por Período</h2>
        <div className="buttons">
          <button onClick={() => setPeriodo('diario')}>Diario</button>
          <button onClick={() => setPeriodo('mensual')}>Mensual</button>
          <button onClick={() => setPeriodo('anual')}>Anual</button>
        </div>
        <Bar data={ventasPorPeriodoData} options={{ responsive: true }} />
        <table className="table">
          <thead>
            <tr>
              <th>{periodo === 'diario' ? 'Día' : periodo === 'mensual' ? 'Mes' : 'Año'}</th>
              <th>Total Ventas</th>
            </tr>
          </thead>
          <tbody>
            {ventasPeriodo.length > 0 ? (
              ventasPeriodo.map((venta, index) => (
                <tr key={index}>
                <td>{new Date(venta.periodo).toLocaleDateString('es-ES') || 'Sin datos'}</td>
                  <td>${(venta.TotalVentas || venta.total_ventas).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">Sin datos</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Ventas por Producto</h2>
        <Pie data={ventasPorProductoData} options={{ responsive: true }} />
        <table className="table">
          <thead>
            <tr>
              <th>ID Producto</th>
              <th>Producto</th>
              <th>Total Vendido</th>
              <th>Total Ventas</th>
            </tr>
          </thead>
          <tbody>
            {resumenProductos.map((producto) => (
              <tr key={producto.id_producto}>
                <td>{producto.id_producto}</td>
                <td>{producto.nombre_producto}</td>
                <td>{producto.total_vendido}</td>
                <td>${producto.total_ventas.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Ventas por Mesa</h3>
        <Bar data={ventasPorMesaData} options={{ responsive: true }} />
        <table className="table">
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Total Pedidos</th>
              <th>Total Ventas</th>
            </tr>
          </thead>
          <tbody>
            {ventasMesa.map((venta, index) => (
              <tr key={index}>
                <td>{venta.nombre_mesa}</td>
                <td>{venta.total_pedidos}</td>
                <td>${venta.total_ventas.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VentasPeriodo;
