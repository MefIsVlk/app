import React, { useState, useEffect } from 'react';
import { utils, writeFile } from 'xlsx';
import axios from 'axios';
import styles from './Administracaja.css';


function Administrarcaja() {
  const [ventasDia, setVentasDia] = useState({ fecha: '', total_ventas: 0 });
  const [cajas, setCajas] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [selectedCaja, setSelectedCaja] = useState(null);
  const [tiposPago, setTiposPago] = useState([]);
  const [nuevaTransaccion, setNuevaTransaccion] = useState({
    caja_id: '',
    tipo_pago_id: '',
    monto: '',
    descripcion: '',
  });
  const [comprobantes, setComprobantes] = useState([]);
  const [idPedido, setIdPedido] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
 

  const handleInputChangee = (e) => {
    const value = e.target.value;
    // Asegurarse de que solo se ingresen números
    if (value === '' || /^[0-9\b]+$/.test(value)) {
      setIdPedido(value);
    }
  };

  const cambiarEstadoPedido = async () => {
    if (!idPedido) {
      setError('Por favor, ingrese un ID de pedido válido.');
      setMensaje('');
      return;
    }
    try {
      const response = await axios.put(`http://localhost:3000/api/detallespedido/estado/pagado/${idPedido}`);
      setMensaje(response.data.message); // Mensaje de éxito desde el servidor
      setError(''); // Limpiar errores previos
      setIdPedido(''); // Limpiar el campo de entrada
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error);
      setError('No se pudo actualizar el estado del pedido'); // Guardar mensaje de error
      setMensaje(''); // Limpiar mensajes previos
    }
  };

  useEffect(() => {
    cargarComprobantes();
  }, []);

  const cargarComprobantes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/comprobantes');
      setComprobantes(response.data);
    } catch (error) {
      console.error('Error al cargar los comprobantes:', error);
    }
  };

  // Obtener ventas del día
  const obtenerVentasDia = async () => {
    try {
      // Llamar a la ruta existente con el parámetro 'diario'
      const response = await axios.get('http://localhost:3000/api/ventas-periodo', {
        params: { periodo: 'diario' }
      });
      if (response.data && response.data.length > 0) {
        // Asumiendo que la respuesta contiene la fecha y el total, y tomamos el primer elemento
        const fechaFormateada = new Date(response.data[0].periodo).toISOString().split('T')[0];
        setVentasDia({ fecha: fechaFormateada, total_ventas: response.data[0].total_ventas });
      } else {
        // Manejar el caso en que no hay ventas ese día
        setVentasDia({ fecha: new Date().toISOString().split('T')[0], total_ventas: 0 });
      }
    } catch (error) {
      console.error('Error al obtener las ventas del día:', error);
      setVentasDia({ fecha: new Date().toISOString().split('T')[0], total_ventas: 0 });
    }
  };
  

  // Obtener todas las cajas
  const obtenerCajas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/cajas');
      setCajas(response.data);
    } catch (error) {
      console.error('Error al obtener las cajas:', error);
    }
  };

  // Obtener transacciones por caja
  const obtenerTransacciones = async (cajaId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/transacciones/${cajaId}`);
      const todasLasTransacciones = response.data;
      setTransacciones(todasLasTransacciones);
    } catch (error) {
      console.error('Error al obtener transacciones:', error);
    }
  };
  
  const filtrarTransaccionesDelDia = () => {
    const hoy = new Date().toISOString().split('T')[0]; // Obtener la fecha actual en formato YYYY-MM-DD
    const transaccionesDelDia = transacciones.filter(transaccion =>
      transaccion.fecha.split('T')[0] === hoy
    );
    setTransacciones(transaccionesDelDia);
  };
  
  const verTodasLasTransacciones = () => {
    obtenerTransacciones(selectedCaja);
  };
  

  // Obtener tipos de pago
  const obtenerTiposPago = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/tipos_pago');
      setTiposPago(response.data);
    } catch (error) {
      console.error('Error al obtener tipos de pago:', error);
    }
  };

  // Manejar selección de caja
  const handleCajaSelect = (cajaId) => {
    setSelectedCaja(cajaId);
    obtenerTransacciones(cajaId);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevaTransaccion({ ...nuevaTransaccion, [name]: value });
  };

  // Agregar una nueva transacción
  const agregarTransaccion = async () => {
    try {
      await axios.post('http://localhost:3000/api/transacciones', nuevaTransaccion);
      obtenerTransacciones(selectedCaja);
      setNuevaTransaccion({
        caja_id: '',
        tipo_pago_id: '',
        monto: '',
        descripcion: '',
      });
    } catch (error) {
      console.error('Error al agregar transacción:', error);
    }
  };

  useEffect(() => {
    obtenerVentasDia();
    obtenerCajas();
    obtenerTiposPago();
  }, []);
  useEffect(() => {
    obtenerVentasDia();
    obtenerCajas();
    obtenerTiposPago();
  }, []);

  // Función para calcular el total de las transacciones del día
  const calcularTotalTransaccionesDia = () => {
    const hoy = new Date().toISOString().split('T')[0];
    return transacciones.reduce((total, transaccion) => {
      if (transaccion.fecha.split('T')[0] === hoy) {
        return total + parseFloat(transaccion.monto);
      }
      return total;
    }, 0);
  };

  // Función para realizar el cierre de caja
  const realizarCierreCaja = () => {
    const totalTransaccionesDia = calcularTotalTransaccionesDia();
    const diferencia = totalTransaccionesDia - ventasDia.total_ventas;

    if (diferencia === 0) {
      alert('Las cuentas cuadran perfectamente.');
    } else {
      alert(`Hay una diferencia de S/${diferencia.toFixed(2)}. Verifica las transacciones y ventas.`);
    }
  };
  const obtenerTransaccionesDelDia = async () => {
    const hoy = new Date().toISOString().split('T')[0];
    try {
      const response = await axios.get(`http://localhost:3000/api/transacciones/dia/${hoy}`);
      setTransacciones(response.data);
    } catch (error) {
      console.error('Error al obtener transacciones del día:', error);
    }
  };
    // Calcular ventas en efectivo
    const totalEnEfectivo = () => {
      return transacciones.reduce((total, item) => {
        if (item.metodo_pago === 'Efectivo') {
          return total + parseFloat(item.monto);
        }
        return total;
      }, 0).toFixed(2);
    };
  
    // Calcular ventas por QR
    const totalPorQR = () => {
      return transacciones.reduce((total, item) => {
        if (item.metodo_pago === 'QR') {
          return total + parseFloat(item.monto);
        }
        return total;
      }, 0).toFixed(2);
    };
  
    const obtenerTransaccionesPorTipo = (tipoPago) => {
      const transaccionesFiltradas = transacciones.filter((item) => {
        const metodo = tiposPago.find(tp => tp.id === item.tipo_pago_id)?.metodo;
        return metodo === tipoPago;
      }).map(trans => ({
        Tipo: trans.tipo,
        Monto: trans.monto.toFixed(2),
        Descripción: trans.descripcion,
        Fecha: new Date(trans.fecha).toLocaleString(),
        'Tipo de Pago': tipoPago
      }));
      return transaccionesFiltradas;
    };
  
    // Función para exportar los datos a Excel
    const exportarDatosExcel = () => {
      const wb = utils.book_new();
  
      // Preparar las hojas de Excel para cada tipo de pago
      const tiposDePago = ['Efectivo', 'Transferencia']; // Agrega más métodos aquí si necesario
      tiposDePago.forEach(tipo => {
        const datos = obtenerTransaccionesPorTipo(tipo);
        const ws = utils.json_to_sheet(datos);
        utils.book_append_sheet(wb, ws, tipo);
      });
  
      // Guardar el archivo
      writeFile(wb, "Cierre_de_Caja.xlsx");
    };
  
  

  return (
    <div className="container-administracaja">
      
        <h1>Administrar Caja</h1>
      

      <div className="card">
        <div className="card-title">Ventas del Día</div>
        <div>{ventasDia.fecha}</div>
        <div>S/{ventasDia.total_ventas.toFixed(2)}</div>
      </div>

      <section className="select-caja">
        <h2>Seleccionar Caja</h2>
        <select onChange={(e) => handleCajaSelect(e.target.value)} className="dropdown">
          <option value="">Selecciona una caja</option>
          {cajas.map((caja) => (
            <option key={caja.id} value={caja.id}>
              {caja.nombre} - {new Date(caja.fecha_creacion).toLocaleDateString()}
            </option>
          ))}
        </select>
      </section>

      <button onClick={verTodasLasTransacciones}>Ver Todas las Transacciones</button>
      <button onClick={filtrarTransaccionesDelDia}>Ver Transacciones del Día</button>

      {selectedCaja && (
        <section className="transacciones">
          <h2>Transacciones</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Tipo de Pago</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map((transaccion) => (
                <tr key={transaccion.id}>
                  <td>{transaccion.tipo}</td>
                  <td>S/{transaccion.monto.toFixed(2)}</td>
                  <td>{transaccion.descripcion}</td>
                  <td>{new Date(transaccion.fecha).toLocaleString()}</td>
                  <td>{tiposPago.find((tp) => tp.id === transaccion.tipo_pago_id)?.metodo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
      <div>
      <h1>Comprobantes</h1>
      {comprobantes.length > 0 ? (
        <table className="comprobantes-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre del Archivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comprobantes.map((comprobante, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{comprobante.split('/').pop()}</td>
                <td>
                  <a href={comprobante} target="_blank" rel="noopener noreferrer">Ver</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay comprobantes disponibles.</p>
      )}
    </div>


      <section className="nueva-transaccion">
        <h2>Agregar Nueva Transacción</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            agregarTransaccion();
          }}
        >
          <div className="form-group">
            <label>Caja:</label>
            <select
              name="caja_id"
              value={nuevaTransaccion.caja_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona una caja</option>
              {cajas.map((caja) => (
                <option key={caja.id} value={caja.id}>
                  {caja.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tipo de Pago:</label>
            <select
              name="tipo_pago_id"
              value={nuevaTransaccion.tipo_pago_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona un tipo de pago</option>
              {tiposPago.map((tp) => (
                <option key={tp.id} value={tp.id}>
                  {tp.metodo}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Monto:</label>
            <input
              type="number"
              name="monto"
              value={nuevaTransaccion.monto}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={nuevaTransaccion.descripcion}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
      
      <input
        type="number"
        value={idPedido}
        onChange={handleInputChangee}
        placeholder="ID del Pedido"
      />
   
      {mensaje && <p>{mensaje}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
          <button type="submit" className="btn"  onClick={cambiarEstadoPedido}>Agregar Transacción</button>
        </form>
      </section>
     
      <button onClick={exportarDatosExcel} className="btn btn-success">Exportar a Excel</button>
     
    </div>
    
  );
}

export default Administrarcaja;
