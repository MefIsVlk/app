import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './pedidocliente.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function Pedidocliente() {
  const [productos, setProductos] = useState({});
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [pedido, setPedido] = useState([]);
  const [mostrarModalVerificacion, setMostrarModalVerificacion] = useState(false);
  const [pedidosExistentes, setPedidosExistentes] = useState([]);
  const [codigoMesa, setCodigoMesa] = useState('');
  const [mesaConfirmada, setMesaConfirmada] = useState(false);
  const [loadingPedidos, setLoadingPedidos] = useState(false);

  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [mostrarPagoTanda, setMostrarPagoTanda] = useState(false);
  const [mostrarSeleccionMedio, setMostrarSeleccionMedio] = useState(false);
  const [medioDePago, setMedioDePago] = useState(null);
  const [mostrarPasosQR, setMostrarPasosQR] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);
  const [idPedidoTanda, setIdPedidoTanda] = useState('');
  const [opcionPago, setOpcionPago] = useState('');
  const [pedidosMesa, setPedidosMesa] = useState([]);
  const [pagarTanda, setPagarTanda] = useState(0);
  const [totalPagoTanda, setTotalPagoTanda] = useState(0);
  const [idTandaPago, setIdTandaPago] = useState(0);
  const [comprobante, setComprobante] = useState(null);
  const [comprobanteCargado, setComprobanteCargado] = useState(false);
  const [mostrarPasosEfectivo, setMostrarPasosEfectivo] = useState(false);
  const [mostrarPasosTransaccion, setMostrarPasosTransaccion] = useState(false);


  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  
  const imagenesCategorias = {
    Cerveza: '/cervezas.png',
    Aguardiente: '/aguardiente.png',
    Comida: '/comida.png',
    Gaseosa: '/gaseosa.png',
    vapers: '/vapers.png',
    Cigarrillo: '/cigarrillo.png',
    Wisky: '/wisky.png',
    Refrescos: '/refrescos.png',
    Dulces: '/dulces.png',
  };

  // Abrir modal de verificación
  const handleAbrirModalVerificacion = () => {
    if (pedido.length === 0) {
      alert('No hay productos seleccionados.');
      return;
    }
    setMostrarModalVerificacion(true);
  };

  // Cerrar modal de verificación
  const handleCerrarModalVerificacion = () => {
    setMostrarModalVerificacion(false);
  };

   // Confirmar y enviar el pedido al mesero
   const handleConfirmarPedido = async () => {
    if (pedido.length === 0) {
      alert('No hay productos seleccionados.');
      return;
    }
  
    const datosPedido = {
      mesa: `Mesa${encodeURIComponent(codigoMesa.trim())}`, // Asegura que sea "MesaX"
      productos: pedido,
    };
    try {
      const response = await axios.post(`http://localhost:3000/api/pedidos`, datosPedido);
      alert('Pedido enviado al mesero con éxito.');
      setPedido([]); // Limpia el pedido después de enviarlo
      fetchPedidosExistentes(codigoMesa); // Refresca los pedidos existentes
      setMostrarModalVerificacion(false); // Cierra el modal
    } catch (error) {
      console.error('Error al enviar el pedido:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      alert(errorMessage);
    }
  };

  const handleAbrirModalPago = () => {
    setMostrarModalPago(true);
    setMedioDePago(null);
    setMostrarPasosQR(false);
    setMostrarQR(false);
  };

  const handleSeleccionPago = (opcion) => {
    if (opcion === 'tanda') {
      setMostrarModalPago(false);
      setMostrarPagoTanda(true);
    } else if (opcion === 'completo') {
      setMostrarModalPago(false);
      setMostrarSeleccionMedio(true);
    }
    setOpcionPago(opcion);
  };

  const handleSeleccionMedio = (medio) => {
    setMedioDePago(medio);
    if (medio === 'Transacción') {
      setMostrarModalPago(false);
      setMostrarPasosQR(true);
    } else {
      setMostrarModalPago(false);
    }
  };
  const handleConfirmarTanda = () => {
    if (!idPedidoTanda || idPedidoTanda.trim() === "") {
      alert('Por favor, ingrese un ID de pedido válido.');
      return;
    }
  
    const pedido = pedidosMesa.find(p => p.id_pedido === parseInt(idPedidoTanda.trim(), 10));
    if (!pedido) {
      alert('El ID del pedido no es válido o no pertenece a esta mesa.');
      return;
    }
  
    setMostrarPagoTanda(false);
    setMostrarSeleccionMedio(true);
  };
  
  const calcularTotalPedido = (pedidoId) => {
    const pedido = pedidosMesa.find((p) => p.id_pedido === parseInt(pedidoId, 10));
    if (!pedido) return 0;
  
    const productos = pedido.productos || [];
    return productos.reduce((subtotal, producto) => subtotal + (producto.subtotal || 0), 0);
  };
  
  
  // Llamada inicial para obtener productos

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/productos`)
      .then((response) => {
        const productosPorTipo = response.data.reduce((acc, producto) => {
          acc[producto.tipo] = acc[producto.tipo] || [];
          acc[producto.tipo].push(producto);
          return acc;
        }, {});
        setProductos(productosPorTipo);
      })
      .catch((error) => console.error('Error al obtener productos:', error));
  }, []);

  const handleConfirmarMesa = () => {
    if (codigoMesa.trim() === '') {
      alert('Por favor, ingrese un código válido.');
      return;
    }
  
    // Asegúrate de concatenar el prefijo "Mesa"
    const mesaNombre = `Mesa${codigoMesa.trim()}`;
    console.log(`Nombre de la mesa enviado: Mesa${codigoMesa.trim()}`); // Depuración
    setMesaConfirmada(true);
    fetchPedidosExistentes(mesaNombre);
  };

  

  const fetchPedidosExistentes = (mesaCodigo) => {
    // Asegúrate de que mesaCodigo sea siempre "MesaX"
    const mesaNombre = mesaCodigo.startsWith("Mesa") ? mesaCodigo : `Mesa${mesaCodigo}`;
    console.log(`Intentando cargar pedidos para: ${mesaNombre}`); // Depuración
    setLoadingPedidos(true);
    axios
      .get(`http://localhost:3000/api/pedidos/mesa/${mesaNombre}`) // Aquí siempre usamos mesaNombre
      .then((response) => {
        console.log('Pedidos obtenidos:', response.data); // Depuración
        setPedidosExistentes(response.data);
        setPedidosMesa(response.data);
      })
      .catch((error) => {
        console.error('Error al obtener pedidos existentes:', error.response || error);
        
      })
      .finally(() => {
        setLoadingPedidos(false);
      });
  };
  


  const handleCantidadChange = (producto, cantidad) => {
    const nuevaCantidad = parseInt(cantidad, 10);
    setPedido((prevPedido) => {
      const existe = prevPedido.find((item) => item.id_producto === producto.id_producto);
      if (nuevaCantidad > 0) {
        if (existe) {
          return prevPedido.map((item) =>
            item.id_producto === producto.id_producto
              ? { ...item, cantidad: nuevaCantidad }
              : item
          );
        } else {
          return [...prevPedido, { ...producto, cantidad: nuevaCantidad }];
        }
      } else {
        return prevPedido.filter((item) => item.id_producto !== producto.id_producto);
      }
    });
  };

  
  
  const handlePagarTanda = (idPedido)=>{
    axios.get(`http://localhost:3000/api/detallespedido/${idPedido}`)
    .then(response => {
      const total = response.data[0]?.total || 0; // Acceder al total
      console.log('Total del pedido:', total);
      
      setIdPedidoTanda(idPedido)
      setTotalPagoTanda(total)
      setPagarTanda(true)
    })
    .catch(error => {
      console.error('Error al obtener el detalle del pedido:', error);
    });
  }


  const fethPagarPedido = (idPedido) => {
    return axios
      .put(`http://localhost:3000/api/detallespedido/estado/pagado/${idPedido}`)
      .then((response) => {
        setMensaje(response.data.message); // Guardar el mensaje de éxito
        setError(''); // Limpiar errores previos
      })
      .catch((error) => {
        console.error('Error al actualizar el estado del pedido:', error);
        setError('No se pudo actualizar el estado del pedido'); // Guardar mensaje de error
        setMensaje(''); // Limpiar mensajes previos
        throw error; // Lanza el error para manejarlo en `handleTerminarPago`
      });
  };
 

  const handleTerminarPago = async (idPedido) => {
    try {
      await fethPagarPedido(idPedido); // Espera a que se complete la actualización del estado del pedido
      fetchPedidosExistentes(`Mesa${codigoMesa}`); // Refresca los pedidos de la mesa actual
      alert('El pago se realizó con éxito.');
    } catch (error) {
      console.error('Error al finalizar el pago:', error);
      alert('Hubo un error al procesar el pago. Por favor, inténtelo nuevamente.');
    } finally {
      setPagarTanda(false); // Cierra el modal de pago
    }
  };
  
  

const handleCargarComprobante = (file) => {
  if (file) {
    setComprobante(file); // Guardar el archivo cargado
    setComprobanteCargado(true); // Habilitar el botón
  } else {
    setComprobante(null);
    setComprobanteCargado(false);
  }
};
const enviarComprobante = () => {
  if (!comprobante) {
    alert('No se ha cargado ningún comprobante.');
    return;
  }

  const formData = new FormData();
  formData.append('archivo', comprobante);
  formData.append('caja_id', 2); // Reemplaza con el valor real
  formData.append('tipo_pago_id', 2); // Reemplaza con el valor real
  formData.append('pedido_id', idPedidoTanda); // Reemplaza con el valor real

  axios
    .post('http://localhost:3000/api/pagoPedido', formData)
    .then((response) => {
      console.log('Comprobante cargado con éxito:', response.data);
      alert('Comprobante enviado correctamente.');
      fetchPedidosExistentes(`Mesa${codigoMesa}`); // Refrescar los pedidos
    })
    .catch((error) => {
      console.error('Error al cargar el comprobante:', error);
      alert('Error al cargar el comprobante. Intente nuevamente.');
    });
};



  return (
    <div className={styles.container}>
      
      {!mesaConfirmada ? (
        <div className="centerContainer">
          <div className="centerContent">
            <h3 id="input-label">Ingrese el Código de la Mesa:</h3>
            <input
              type="text"
              id="input-mesa"
              value={codigoMesa}
              onChange={(e) => setCodigoMesa(e.target.value)}
              placeholder="Código de mesa"
            />
            <button
              id="btn-confirmar-mesa"
              onClick={handleConfirmarMesa}
            >
              Confirmar Mesa
            </button>
            <div id="welcome-message">
              <h2 className="welcomeTitle">¡Bienvenidos a THE PUBS!</h2>
              <p>Estamos encantados de que nos acompañen. Este sistema está diseñado para
                que puedan disfrutar de una experiencia rápida y cómoda al realizar sus pedidos.</p>
              <p className="stepsTitle">💡 <b>¿Cómo funciona?</b></p>
              <ol className="stepsList">
                <li>Ingrese el <b>código de su mesa</b> en el campo de arriba.</li>
                <li>Navegue por las <b>categorías</b> y explore nuestro menú.</li>
                <li>Seleccione los <b>productos</b>, añada las cantidades y revise su pedido.</li>
                <li>Envíe su pedido, ¡y nosotros nos encargamos del resto!</li>
              </ol>
              <p className="footerMessage">
                Relájese, disfrute, y déjenos atenderlo como se merece. <br />
                <b>¡Estamos para servirle!</b>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
        <div className="pedidos-existentes">
  <h3>Pedidos existentes para la mesa {codigoMesa}:</h3>
  {loadingPedidos ? (
    <p>Cargando pedidos...</p>
  ) : pedidosExistentes.length > 0 ? (
    <div className='table-container'>
    <table className="table-pedidocliente">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Precio Unitario</th>
          <th>Subtotal</th>
          <th>Estado</th> 
        </tr>
      </thead>
      <tbody>
  {pedidosExistentes
    .sort((a, b) => a.id_pedido - b.id_pedido) // Ordenar por id_pedido
    .map((pedido, index) => (
      <React.Fragment key={index}>
        {/* Fila separadora por cada nuevo id_pedido */}
        {index === 0 || pedido.id_pedido !== pedidosExistentes[index - 1]?.id_pedido ? (
          <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
            <td colSpan="4">Pedido {pedido.id_pedido}</td>
            <td colSpan="1"><button onClick={() => handlePagarTanda(pedido.id_pedido)}>Pagar Tanda</button>
            </td>
          </tr>
        ) : null}
        {/* Fila para el detalle del producto con color condicional según el estado */}
        <tr className={
          pedido.estado === "Pagado" ? "estado-pagado" : 
          pedido.estado === "Pendiente" ? "estado-pendiente" : ""
        }>
          <td>{pedido.nombre || pedido.producto}</td>
          <td>{pedido.cantidad}</td>
          <td>${pedido.precio?.toFixed(2) || '0.00'}</td>
          <td>${(pedido.cantidad * pedido.precio).toFixed(2)}</td>
          <td>{pedido.estado}</td>
        </tr>
      </React.Fragment>
    ))}
</tbody>



    </table>
    </div>
  ) : (
    <p>No hay pedidos registrados para esta mesa.</p>
  )}
</div>


          {!categoriaSeleccionada && (
            <div className="categories-carousel d-flex overflow-auto">
              {Object.keys(productos).map((tipo) => (
                <div
                  key={tipo}
                  className="category-card text-center"
                  onClick={() => setCategoriaSeleccionada(tipo)}
                >
                  <img
                    src={imagenesCategorias[tipo] || '/default.png'}
                    alt={tipo}
                    className="category-img"
                  />
                  <h5>{tipo}</h5>
                  <button className="button-verde-cliente">Ver</button>
                </div>
              ))}
            </div>
          )}

          {categoriaSeleccionada && (
            <>
              <button
                className="button-verde-cliente"
                onClick={() => setCategoriaSeleccionada(null)}
              >
                Volver a Categorías
              </button>
              <div className="products-container">
                {productos[categoriaSeleccionada]?.map((producto) => (
                  <div key={producto.id_producto} className="product-card">
                    <div className="product-info">
                      <h5>{producto.nombre}</h5>
                      <p>Precio: ${producto.precio?.toFixed(2)}</p>
                      <input
                        type="number"
                        className="form-control"
                        min="0"
                        placeholder="Cantidad"
                        onChange={(e) => handleCantidadChange(producto, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Resumen del pedido */}
          <div className="card p-3 text-center mt-4">
            <h3>Resumen del Pedido:</h3>
            {pedido.length === 0 ? (
              <p>No hay productos seleccionados.</p>
            ) : (
              <ul className="list-group mb-3">
                {pedido.map((item, index) => (
                  <li key={index} className="list-group-item">
                    {item.nombre} - Cantidad: {item.cantidad} - Precio: $
                    {(item.precio * item.cantidad).toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
            <button
              className="button-verde-cliente"
              onClick={handleAbrirModalVerificacion}
            >
              Enviar Pedido al Mesero
            </button>
          </div>
        
          
          
          
          {mostrarModalVerificacion && (
              <div
                className="modal fade show"
                style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Confirmar Pedido</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={handleCerrarModalVerificacion}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <h6>Por favor, revise su pedido:</h6>
                      <ul>
                        {pedido.map((item, index) => (
                          <li key={index}>
                            {item.nombre} - Cantidad: {item.cantidad} - Precio: $
                            {(item.precio * item.cantidad).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="modal-footer">
                      <button className="button-verde-cliente" onClick={handleConfirmarPedido}>
                        Confirmar y Enviar
                      </button>
                      <button className="button-rojo-cliente" onClick={handleCerrarModalVerificacion}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
                
          
          {mostrarModalPago && (
            <div className="modal">
              <div className="modal-content">
                <h3>Seleccione la opción de pago</h3>
                <button onClick={() => handleSeleccionPago('completo')}>Pagar Completo</button>
                <button
                  className="btn btn-danger"
                onClick={() => setMostrarModalPago(false)}>Cancelar</button>
              </div>
            </div>
          )}

          {pagarTanda && (
            <div className="modal">
              <div className="modal-content">
                <h3 className='modal-title'>Pagar tanda</h3>
                <div>
                  {/* Radio para efectivo */}
                  <input
                    type="radio"
                    id="tipo_pago_efectivo"
                    name="tipo_pago"
                    value="Efectivo"
                    onChange={() => {
                      setMostrarQR(false); // Ocultar QR
                      setMostrarPasosEfectivo(true); // Mostrar pasos para efectivo
                      setMostrarPasosTransaccion(false); //ocultar pasos para transaccion
                    }}
                  />
                  <label htmlFor="tipo_pago_efectivo">Efectivo</label>

                  {/* Radio para transferencia */}
                  <input
                    type="radio"
                    id="tipo_pago_transferencia"
                    name="tipo_pago"
                    value="Transferencia"
                    onChange={() => {
                      setMostrarQR(true); // Mostrar QR
                      setMostrarPasosEfectivo(false); // Ocultar pasos para efectivo
                    }}
                  />
                  <label className='modal-title' htmlFor="tipo_pago_transferencia">Transferencia</label>
                </div>

      {mostrarQR && (
        <div className="qr-section">
          <img
            src="/codigoqr.png" //  imagen QR vista
            alt="QR Code"
            style={{ width: '300px', height: '400px', marginTop: '10px' }}
          />
          <h1>Total a pagar: ${totalPagoTanda}</h1>


          <button
            
            onClick={() => {
              const link = document.createElement('a');
              link.href = '/codigoqr.png'; // imagen QR descarga
              link.download = 'codigo-qr.png';
              link.click();
            }}
          >
            Descargar QR
          </button>
          
          <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(e) => handleCargarComprobante(e.target.files[0])}
          style={{ marginTop: '10px' }}
        />
        <button
          className="button-verde-cliente"
          disabled={!comprobanteCargado}
          onClick={enviarComprobante}
        >
          Cargar Comprobante
        </button>
        </div>
      )}


        {/* Mostrar pasos para efectivo */}
        {mostrarPasosEfectivo && (

        <div className="efectivo-section">
          <h5>¿Cómo pagar en efectivo?</h5>
          <p>Para realizar el pago en efectivo:</p>
          <ol>
            <li>Llame al mesero para informar sobre el pago.</li>
            <li>Acérquese a la caja para completar su pago.</li>
            <li>Guarde su recibo como comprobante.</li>
          </ol>
        </div>
      )}
      
      <button 
        className='button-verde-cliente'
        disabled={!comprobanteCargado} // El botón estará deshabilitado a menos que se haya cargado el comprobante
        onClick={() => handleTerminarPago(idPedidoTanda)}
      >
        Confirmar Pago
      </button>

            <button 
              className='button-rojo-cliente'
              onClick={() => {
                setPagarTanda(false);
                fetchPedidosExistentes(`Mesa${codigoMesa}`);}}
                >
                Cancelar</button>
          </div>
        </div>
      )}
  
        </>
      )}

    </div>
    
  );
}

export default Pedidocliente;

