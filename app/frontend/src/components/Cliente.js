import React, { useState, useEffect } from "react";
import './Cliente.css';

function VistaPedidosPorMesa() {
  const [vistaPedidos, setVistaPedidos] = useState([]); // Almacena los datos de la vista
  const [agrupadosPorMesa, setAgrupadosPorMesa] = useState({}); // Almacena datos agrupados por mesa
  const [totalesPorMesa, setTotalesPorMesa] = useState({}); // Almacena los totales por mesa
  const [totalGeneral, setTotalGeneral] = useState(0); // Almacena el total general
  const [isLoading, setIsLoading] = useState(true);

  const fetchVistaPedidos = async () => {
    try {
      setIsLoading(true);

      // Llamada a la vista
      const response = await fetch("http://localhost:3000/api/vista-pedidos");
      if (!response.ok) {
        throw new Error("Error al obtener la vista de pedidos por mesa");
      }

      const data = await response.json();
      setVistaPedidos(data);

      // Agrupar los datos por mesa y calcular totales
      const agrupados = data.reduce((acc, pedido) => {
        if (!acc[pedido.nombre_mesa]) {
          acc[pedido.nombre_mesa] = [];
        }
        acc[pedido.nombre_mesa].push(pedido);
        return acc;
      }, {});

      const totales = {};
      let totalGeneral = 0;

      for (const mesa in agrupados) {
        const totalMesa = agrupados[mesa].reduce((sum, pedido) => sum + pedido.subtotal, 0);
        totales[mesa] = totalMesa;
        totalGeneral += totalMesa;
      }

      setAgrupadosPorMesa(agrupados);
      setTotalesPorMesa(totales);
      setTotalGeneral(totalGeneral);
    } catch (error) {
      console.error("Error al cargar los datos de la vista:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVistaPedidos();
  }, []);

  const limpiarMesa = async (nombreMesa) => {
    try {
      const confirmar = window.confirm(`¿Estás seguro de que deseas limpiar la mesa "${nombreMesa}"?`);
      if (!confirmar) return;

      const response = await fetch(`http://localhost:3000/api/limpiar-mesa/${nombreMesa}`, { method: 'DELETE' });
      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchVistaPedidos(); // Actualiza la vista después de limpiar la mesa
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error al limpiar la mesa "${nombreMesa}":`, error);
      alert(`Error: ${error.message}`);
    }
  };

  if (isLoading) {
    return <div className="loading">Cargando datos...</div>;
  }

  if (Object.keys(agrupadosPorMesa).length === 0) {
    return <div className="empty">No hay datos disponibles en la vista</div>;
  }

  return (
    <div className="vista-pedidos-container">
      <h1>Vista de Pedidos por Mesa</h1>

      {Object.keys(agrupadosPorMesa).map((mesa) => (
        <div key={mesa} className="mesa-container" style={{ marginBottom: "20px" }}>
          <h2>
            {mesa}{" "}
            
          </h2>
          <table className="vista-pedidos-table" border="1" style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {agrupadosPorMesa[mesa].map((pedido, index) => (
                <tr key={index}>
                  <td>{pedido.id_pedido}</td>
                  <td>{new Date(pedido.fecha).toLocaleDateString()}</td>
                  <td>{pedido.producto}</td>
                  <td>{pedido.cantidad}</td>
                  <td>${pedido.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: "right", fontWeight: "bold", marginTop: "10px" }}>
            Total por Mesa: ${totalesPorMesa[mesa].toFixed(2)}
          </div>
        </div>
      ))}

      <div style={{ textAlign: "right", fontWeight: "bold", marginTop: "20px", fontSize: "18px" }}>
        Total General: ${totalGeneral.toFixed(2)}
      </div>
    </div>
  );
}

export default VistaPedidosPorMesa;
