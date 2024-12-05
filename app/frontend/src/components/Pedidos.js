import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Pedidos.css";

function PedidosYVentas() {
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedido, setPedido] = useState({ mesa: "", productos: [] });
  const [pedidosPendientes, setPedidosPendientes] = useState([]);
  const [pedidoTemporal, setPedidoTemporal] = useState(null); // Pedido temporal antes de guardar en la BD

  // Cargar datos iniciales
  useEffect(() => {
    cargarMesas();
    cargarProductos();
    fetchPedidos();
  }, []);

  const cargarMesas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/mesas");
      setMesas(response.data);
    } catch (error) {
      console.error("Error al obtener mesas:", error);
    }
  };

  const cargarProductos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/productos");
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const fetchPedidos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/vistapedidos");
      setPedidosPendientes(response.data);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    }
  };

  const handleMesaChange = (e) => {
    setPedido({ ...pedido, mesa: e.target.value });
  };

  const handleCantidadChange = (idProducto, nombreProducto, cantidad) => {
    const productosActualizados = pedido.productos.filter(
      (p) => p.id_producto !== idProducto
    );
    if (cantidad > 0) {
      productosActualizados.push({
        id_producto: idProducto,
        nombre: nombreProducto,
        cantidad: parseInt(cantidad),
      });
    }
    setPedido({ ...pedido, productos: productosActualizados });
  };

  const handleConfirmarPedido = () => {
    if (!pedido.mesa || pedido.productos.length === 0) {
      alert("Por favor, selecciona una mesa y al menos un producto con cantidad.");
      return;
    }

    setPedidoTemporal(pedido); // Guarda el pedido en memoria temporal
    setPedido({ mesa: "", productos: [] }); // Limpia el pedido actual
  };

  const manejarAccionTemporal = async (accion) => {
    if (!pedidoTemporal) {
      alert("No hay un pedido para procesar.");
      return;
    }
  
    console.log("Pedido temporal antes de enviar:", pedidoTemporal);
  
    if (accion === "aprobado") {
      try {
        await axios.post("http://localhost:3000/api/pedidosadmin", {
          ...pedidoTemporal,
          estado: "pendiente",
        });
        alert("Pedido aprobado y registrado en la base de datos.");
        fetchPedidos(); // Actualiza la lista de pedidos pendientes
      } catch (error) {
        console.error("Error al registrar pedido:", error);
        alert("Error al registrar el pedido.");
      }
    } else if (accion === "rechazado") {
      alert("Pedido rechazado. No se registrará en la base de datos.");
    }

    setPedidoTemporal(null); // Limpia el pedido temporal después de tomar acción
  };

  const manejarEstadoPedido = async (idPedido, nuevoEstado) => {
    console.log("Datos enviados:", { idPedido, estado: nuevoEstado });
    try {
      await axios.put("http://localhost:3000/api/actualizarpedido", {
        idPedido,
        estado: nuevoEstado,
      });
      alert(`El pedido ha sido marcado como "${nuevoEstado}".`);
      fetchPedidos();
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      alert("No se pudo actualizar el estado del pedido.");
    }
  };
  

  return (
    <div className="pedidos-ventas-container">
      <div className="pedidos-section">
        <h2>Realizar Pedido</h2>
        <label>Mesa:</label>
        <select value={pedido.mesa} onChange={handleMesaChange}>
          <option value="">Seleccionar mesa</option>
          {mesas.map((mesa) => (
            <option key={mesa.id_mesa} value={mesa.id_mesa}>
              {mesa.nombre}
            </option>
          ))}
        </select>

        <div className="tabla-container">
          <table className="tabla-productos">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto) => (
                <tr key={producto.id_producto}>
                  <td>{producto.nombre}</td>
                  <td>{producto.precio}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      placeholder="Cantidad"
                      onChange={(e) =>
                        handleCantidadChange(
                          producto.id_producto,
                          producto.nombre,
                          e.target.value
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={handleConfirmarPedido} className="btn-confirmar">
          Confirmar Pedido
        </button>
      </div>

      {pedidoTemporal && (
        <div className="confirmacion-section">
          <h2>Confirmar Acción del Pedido</h2>
          <p>
            Mesa: {pedidoTemporal.mesa}, Productos:{" "}
            {pedidoTemporal.productos
              .map((p) => `${p.nombre} (${p.cantidad})`)
              .join(", ")}
          </p>
          <button
            onClick={() => manejarAccionTemporal("aprobado")}
            className="btn-aprobar"
          >
            Aprobar Pedido
          </button>
          <button
            onClick={() => manejarAccionTemporal("rechazado")}
            className="btn-rechazar"
          >
            Rechazar Pedido
          </button>
        </div>
      )}

      <div className="ventas-section">
        <h2>Pedidos Pendientes</h2>
        <table className="tabla-pedidos">
          <thead>
            <tr>
              <th>Mesa</th>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {pedidosPendientes.map((pedido) => (
              <tr key={pedido.id_pedido}>
                <td>{pedido.id_mesa}</td>
                <td>{pedido.nombre_producto}</td>
                <td>{pedido.cantidad}</td>
                <td>{pedido.estado || "Pendiente"}</td>
                <td>
                  <button
                    onClick={() => manejarEstadoPedido(pedido.id_pedido, "entregado")}
                    className="btn-entregado"
                  >
                    Marcar como Entregado
                  </button>
                  <button
                    onClick={() => manejarEstadoPedido(pedido.id_pedido, "cancelado")}
                    className="btn-cancelado"
                  >
                    Cancelar Pedido
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PedidosYVentas;
