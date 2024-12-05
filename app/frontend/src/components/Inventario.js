import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Inventario.css";

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [nuevoProducto, setNuevoProducto] = useState({
    id_producto: null,
    nombre: "",
    id_tipo: "",
    cantidad: 0,
  });
  const [mensaje, setMensaje] = useState(null);

  const [cantidadPacas, setCantidadPacas] = useState('');
  const [unidadesPorPaca, setUnidadesPorPaca] = useState('');

  // Cargar inventario y tipos desde el backend
  const cargarDatos = useCallback(async () => {
    try {
      const [productosRes, tiposRes] = await Promise.all([
        axios.get("http://localhost:3000/api/inventario"),
        axios.get("http://localhost:3000/api/tipos"),
      ]);

      if (productosRes.status === 200 && Array.isArray(productosRes.data)) {
        setProductos(productosRes.data);
      } else {
        mostrarMensaje("Error al cargar inventario", "error");
      }

      if (tiposRes.status === 200 && Array.isArray(tiposRes.data)) {
        setTipos(tiposRes.data);
      } else {
        mostrarMensaje("Error al cargar tipos", "error");
      }
    } catch (error) {
      mostrarMensaje("Error al cargar datos", "error");
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const mostrarMensaje = (texto, tipo = "exito") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto(prev => ({
      ...prev,
      [name]: name === "cantidad" ? (value === "" ? "" : parseInt(value, 10)) : value
    }));
  };
  

  // Seleccionar un producto para edición
  const seleccionarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setNuevoProducto({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      id_tipo: producto.id_tipo,
      cantidad: producto.cantidad,
    });
  };

  // Agregar o actualizar producto
  const agregarProducto = async () => {
    try {
      console.log("Datos enviados al servidor:", nuevoProducto);

      // POST para agregar o actualizar
      const response = await axios.post(
        "http://localhost:3000/api/inventario",
        nuevoProducto
      );

      if (response.status === 201) {
        mostrarMensaje("Producto agregado correctamente", "exito");
      } else if (response.status === 200) {
        mostrarMensaje("Producto actualizado correctamente", "exito");
      } else {
        mostrarMensaje("Error inesperado al guardar producto", "error");
      }

      await cargarDatos();
      setNuevoProducto({ id_producto: null, nombre: "", id_tipo: "", cantidad: 0 });
      setProductoSeleccionado(null);
    } catch (error) {
      mostrarMensaje("Error al guardar producto", "error");
      console.error("Error al guardar producto:", error.response?.data || error.message);
    }
  };

  // Eliminar un producto
  const eliminarProducto = async () => {
    if (!productoSeleccionado) return;

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el producto "${productoSeleccionado.nombre}"?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:3000/api/inventario/${productoSeleccionado.id_producto}`
      );
      mostrarMensaje("Producto eliminado correctamente", "exito");
      await cargarDatos();
      setProductoSeleccionado(null);
    } catch (error) {
      mostrarMensaje("Error al eliminar producto", "error");
      console.error("Error al eliminar producto:", error.response?.data || error.message);
    }
  };

  const getColorByStock = (cantidad) => {
    if (cantidad === 5) return "red";
    if (cantidad <= 15) return "orange";
    if (cantidad <= 20) return "yellow";
    return "green";
  };

  const getIconByStock = (cantidad) => {
    if (cantidad === 5) return "❌";
    if (cantidad <= 20) return "⚠️";
    return "✅";
  };
  const handleConvertir = () => {
    const cantidad = parseInt(cantidadPacas, 10);
    const unidades = parseInt(unidadesPorPaca, 10);
    if (isNaN(cantidad) || isNaN(unidades) || cantidad <= 0 || unidades <= 0) {
      alert('Por favor, ingresa números válidos y mayores que cero.');
      return;
    }

    const conversion = cantidad * unidades;
    setNuevoProducto({...nuevoProducto, cantidad: conversion});
    setCantidadPacas('');
    setUnidadesPorPaca('');
  };

  return (
    <div className="container-inv">
      <h2>Lista de Inventario</h2>
      {mensaje && (
        <div
          className={`mensaje ${mensaje.tipo === "error" ? "mensaje-error" : "mensaje-exito"}`}
        >
          {mensaje.texto}
        </div>
      )}

      <div className="layout-inv">
        <form
          className="form-inv"
          onSubmit={(e) => {
            e.preventDefault();
            agregarProducto();
          }}
        >
           <h3>Agregar Cantidades</h3>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del producto"
            value={nuevoProducto.nombre}
            onChange={handleInputChange}
            className="input-inv"
            required
          />
          <select
            name="id_tipo"
            value={nuevoProducto.id_tipo}
            onChange={handleInputChange}
            className="input-inv"
            required
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
  name="cantidad"
  placeholder="Cantidad"
  value={nuevoProducto.cantidad}
  onChange={handleInputChange}
  className="input-inv"
  required=""
/>

          <button type="submit" className="addButton-inv">
            {productoSeleccionado ? "Actualizar Producto" : "Agregar Producto"}
          </button>

          {productoSeleccionado && (
            <button onClick={eliminarProducto} className="deleteButton-inv">
              Eliminar Producto
            </button>
          )}
        </form>

        <div className="listContainer-inv">
  {productos.map((producto) => (
    <div
      key={producto.id_producto}
      className={`productItem-inv ${
        productoSeleccionado?.id_producto === producto.id_producto ? "selectedProduct" : ""
      }`}
      onClick={() => seleccionarProducto(producto)}
    >
      <span>{producto.id_producto}</span>
      <span>
        {getIconByStock(producto.cantidad)} {producto.nombre}
      </span>
      <span>{producto.tipo || "Sin tipo asignado"}</span>
      <span>
        {producto.cantidad}
        <div
          className="progressBar-inv"
          style={{
            width: `${Math.min(producto.cantidad, 100)}%`,
            backgroundColor: getColorByStock(producto.cantidad),
          }}
        ></div>
      </span>
      <span>
        {producto.fecha_actualizacion
          ? new Date(producto.fecha_actualizacion).toISOString().split("T")[0]
          : "N/A"}
      </span>
    </div>
  ))}
</div>
      
      </div>
      <div className="container-inve">

        {/* Inputs y botones de la mini calculadora */}
   
  <h3>mini calculadora</h3>
          <input type="number" value={cantidadPacas} onChange={(e) => setCantidadPacas(e.target.value)} placeholder="Cantidad de pacas" />
          <input type="number" value={unidadesPorPaca} onChange={(e) => setUnidadesPorPaca(e.target.value)} placeholder="Unidades por paca" />
          <button type="button" onClick={handleConvertir}>Convertir</button>
        </div>
        </div>

    
  );
}

export default Inventario;
