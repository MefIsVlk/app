import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axios from "axios";
import "./Productos.css";
import "bootstrap/dist/css/bootstrap.min.css"; // Importa estilos de Bootstrap


function Productos() {
  const [nombre, setNombre] = useState("");
  const [idTipo, setIdTipo] = useState("");
  const [precio, setPrecio] = useState("");
  const [precioCompra, setPrecioCompra] = useState(""); // Nuevo estado para precio de compra
  const [productos, setProductos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [chartData, setChartData] = useState({ series: [], labels: [] });
  const [ganancias, setGanancias] = useState([]);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" }); // Estado para manejar alertas
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  


  const showAlert = (type, message) => {
    setAlert({ show: true, type, message }); // Configura el estado de la alerta
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" }); // Oculta la alerta después de 3 segundos
    }, 3000);
  };
  

// Define la función fetchGanancias fuera de useState
async function fetchGanancias() {
  const response = await fetch("http://localhost:3000/api/ganancias");
  const data = await response.json();
  setGanancias(data);
}

// Llama a fetchGanancias en useEffect y otras partes donde sea necesario
useEffect(() => {
  async function fetchProducts() {
    const response = await fetch("http://localhost:3000/api/productos");
    const data = await response.json();
    setProductos(data);
    updateChartData(data);
  }

  async function fetchTipos() {
    const response = await fetch("http://localhost:3000/api/tipos");
    const data = await response.json();
    setTipos(data);
  }

  fetchProducts();
  fetchTipos();
  fetchGanancias(); // Actualiza la lista de ganancias al cargar

// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const updateChartData = (data) => {
    const tipoCounts = data.reduce((acc, prod) => {
      acc[prod.tipo] = (acc[prod.tipo] || 0) + 1;
      return acc;
    }, {});

    setChartData({
      series: Object.values(tipoCounts),
      labels: Object.keys(tipoCounts),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      if (selectedProduct) {
        const response = await fetch(
          `http://localhost:3000/api/productos/${selectedProduct.id_producto}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre,
              id_tipo: idTipo,
              precio,
              precio_compra: precioCompra,
            }),
          }
        );
  
        if (response.ok) {
          showAlert("success", "Producto actualizado correctamente");
          setProductos((prevProductos) =>
            prevProductos.map((prod) =>
              prod.id_producto === selectedProduct.id_producto
                ? { ...prod, nombre, id_tipo: idTipo, precio, precio_compra: precioCompra }
                : prod
            )
          );
          setSelectedProduct(null);
          updateChartData(productos);
          await fetchGanancias(); // Actualiza la lista de ganancias
        } else {
          const errorData = await response.json();
          showAlert("danger",`Error al actualizar producto: ${errorData.message || errorData.error}`);
        }
      } else {
        const response = await fetch("http://localhost:3000/api/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, id_tipo: idTipo, precio, precio_compra: precioCompra }),
        });
  
        if (response.ok) {
          showAlert("success","Producto agregado correctamente");
          const newProduct = await response.json();
          const updatedProductos = [
            ...productos,
            { id_producto: newProduct.id_producto, nombre, id_tipo: idTipo, precio, precio_compra: precioCompra },
          ];
          setProductos(updatedProductos);
          updateChartData(updatedProductos);
          await fetchGanancias(); // Actualiza la lista de ganancias
        } else {
          const errorData = await response.json();
          showAlert("danger",`Error al agregar producto: ${errorData.message || errorData.error}`);
        }
      }
    } catch (error) {
      showAlert("danger","Error en la operación: " + error.message);
    }
  
    setNombre("");
    setIdTipo("");
    setPrecio("");
    setPrecioCompra("");
  };
  

  const handleAddTipo = async () => {
    if (!nuevoTipo.trim()) {
      showAlert("danger","El nombre del tipo no puede estar vacío");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/tipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevoTipo }),
      });

      if (response.ok) {
        showAlert("success","Tipo agregado correctamente");
        const newTipo = await response.json();
        setTipos((prevTipos) => [...prevTipos, newTipo]);
        setNuevoTipo("");
      } else {
        const errorData = await response.json();
        alert(`Error al agregar tipo: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      alert("Error en la operación: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) {
      alert("Selecciona un producto para eliminar");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/api/productos/${selectedProduct.id_producto}`,
        {
          method: "DELETE",
        }
      );
  
      if (response.ok) {
        showAlert("success","Producto eliminado correctamente");
        const updatedProductos = productos.filter(
          (prod) => prod.id_producto !== selectedProduct.id_producto
        );
        setProductos(updatedProductos);
        setSelectedProduct(null);
        updateChartData(updatedProductos);
        await fetchGanancias(); // Actualiza la lista de ganancias
      } else {
        const errorData = await response.json();
        showAlert("danger",`Error al eliminar producto: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      showAlert("danger","Error en la operación: " + error.message);
    }
  };
  

  const handleDeleteAll = async () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar todos los productos?")) {
      try {
        const response = await axios.delete("http://localhost:3000/api/productos/todos/eliminar");
        showAlert(response.data.message);
  
        // Limpia los productos del estado
        setProductos([]);
        updateChartData([]);
        await fetchGanancias(); // Actualiza la lista de ganancias
      } catch (error) {
        console.error("Error al eliminar todos los productos:", error);
        showAlert("danger","Error al eliminar todos los productos: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = () => {
    if (selectedProduct) {
      setNombre(selectedProduct.nombre);
      setIdTipo(selectedProduct.id_tipo);
      setPrecio(selectedProduct.precio);
      setPrecioCompra(selectedProduct.precio_compra);
    }
  };

  const handleDeleteCategoria = async () => {
    if (!categoriaSeleccionada) {
      showAlert("danger", "Selecciona una categoría para eliminar");
      return;
    }
  
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      try {
        const response = await axios.delete(`http://localhost:3000/api/tipos/${categoriaSeleccionada}`);
        showAlert("success", "Categoría eliminada correctamente");
  
        // Actualiza la lista de categorías después de eliminar
        setTipos((prevTipos) => prevTipos.filter((tipo) => tipo.id_tipo !== parseInt(categoriaSeleccionada, 10)));
        setCategoriaSeleccionada(""); // Limpia la selección
      } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        showAlert("danger", "Error al eliminar la categoría: " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="productos-container">
      {alert.show && (
  <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
    {alert.message}
  </div>
)}
      <div className="top-container">
      <div className="form-container">
          {/* Card para Agregar Producto */}
          <div className="card">
            <div className="card-title">Agregar Producto</div>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nombre del producto"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              <select
                value={idTipo}
                onChange={(e) => setIdTipo(e.target.value)}
              >
                <option value="">Selecciona un tipo</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id_tipo} value={tipo.id_tipo}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Precio de venta"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
              <input
                type="number"
                placeholder="Precio de compra"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value)}
              />
              <button type="submit">{selectedProduct ? "Actualizar Producto" : "Agregar Producto"}</button>
            </form>
          </div>

          {/* Card para Gestionar Tipos */}
          <div className="card">
  <div className="card-title">Gestionar Tipos</div>
  <form>
    {/* Input para agregar una nueva categoría */}
    <input
      type="text"
      className="form-control-productos mb-2"
      placeholder="Nombre del tipo"
      value={nuevoTipo}
      onChange={(e) => setNuevoTipo(e.target.value)}
    />
    <button
      type="button"
      onClick={handleAddTipo}
    >
      Agregar Tipo
    </button>

    {/* Menú desplegable para seleccionar y eliminar una categoría */}
    <label htmlFor="selectCategoria" className="form-label">
      Selecciona una categoría:
    </label>
    <select
      id="selectCategoria"
      className="form-select-productos mb-2"
      value={categoriaSeleccionada}
      onChange={(e) => setCategoriaSeleccionada(e.target.value)}
    >
      <option value="">Seleccione un tipo</option>
      {tipos.map((tipo) => (
        <option key={tipo.id_tipo} value={tipo.id_tipo}>
          {tipo.nombre}
        </option>
      ))}
    </select>
    <button
      type="button"
      onClick={handleDeleteCategoria}
      disabled={!categoriaSeleccionada}
    >
      Eliminar Tipo
    </button>
  </form>
</div>
        </div>
        <div className="product-list-container">
          <h2>Lista de Productos</h2>
          <div className="product-list">
            {productos.map((producto) => (
             <div
             key={producto.id_producto}
             onClick={() => setSelectedProduct(producto)}
             className={`product-item ${
               selectedProduct?.id_producto === producto.id_producto ? "selected" : ""
             }`}
           >
             {producto.nombre} - {producto.tipo || "Sin tipo asignado"} - Venta: ${producto.precio} - Compra: ${producto.precio_compra}
           </div>
            ))}
          </div>
          <div className="action-buttons">
            <button onClick={handleEdit} disabled={!selectedProduct}>
              Editar
            </button>
            <button onClick={handleDelete} disabled={!selectedProduct}>
              Eliminar
            </button>
            <button onClick={handleDeleteAll}>Eliminar Todos los Productos</button>
          </div>
        </div>

        <div className="product-list-container">
          <h2>Ganancias por Producto</h2>
          <div className="product-list">
            {ganancias.map((producto) => (
              <div key={producto.id_producto} className="product-item">
                {producto.nombre} - Venta: ${producto.precio} - Compra: ${producto.precio_compra} - Ganancia: ${producto.ganancia}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h2>Distribución por Tipo de Producto</h2>
        <ReactApexChart
          options={{
            labels: chartData.labels,
            chart: { type: "donut" },
            dataLabels: {
              style: {
                colors: ["#FFFFFF"],
              },
            },
            legend: {
              labels: {
                colors: "#FFFFFF",
              },
            },
            tooltip: {
              theme: "dark",
            },
          }}
          series={chartData.series}
          type="donut"
          height={300}
        />
      </div>
    </div>
  );
}

export default Productos;
