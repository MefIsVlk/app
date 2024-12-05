import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';

import './Alertas.css';

function Alertas() {
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState('');
  const [link, setLink] = useState('');
  const [codigo, setCodigo] = useState('');
  const qrRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'link') {
      setLink(value);
    } else if (name === 'codigo') {
      setCodigo(value);
    }
  };

  useEffect(() => {
    if (link && codigo && qrRef.current) {
      // Usar setTimeout para asegurarse de que el QR se ha renderizado antes de dibujar el texto
      setTimeout(() => {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.font = '16px Arial';
          ctx.fillText(`Código: ${codigo}`, 10, 160); // Ajustar la posición según necesidades
        }
      }, 100); // Ajustar el tiempo si es necesario
    }
  }, [link, codigo]);

  const downloadQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'qr-code.png';
      link.href = image;
      link.click();
    }
  };
  // Cargar las mesas al montar el componente
  useEffect(() => {
    cargarMesas();
  }, []);

  

  const cargarMesas = () => {
    axios.get('http://localhost:3000/api/mesas')
      .then(response => {
        setMesas(response.data);
        response.data.forEach(mesa => verificarEstadoMesa(mesa.id_mesa)); // Verificar cada mesa
      })
      .catch(error => console.error('Error al obtener mesas:', error));
  };
  

  const handleAgregarMesa = (e) => {
    e.preventDefault();
    const nombre = e.target.nombre.value;

    axios.post('http://localhost:3000/api/mesas', { nombre })
      .then(() => {
        cargarMesas();
        e.target.reset();
      })
      .catch(error => console.error('Error al agregar la mesa:', error));
  };

  const handleEliminarMesa = () => {
    if (!mesaSeleccionada) {
      alert('Por favor, selecciona una mesa para eliminar.');
      return;
    }
  
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar la mesa seleccionada?`);
    if (!confirmar) return;
  
    axios.delete(`http://localhost:3000/api/mesas/${mesaSeleccionada}`)
      .then(() => {
        alert('Mesa eliminada correctamente.');
        cargarMesas();
        setMesaSeleccionada(''); // Limpia la selección
      })
      .catch((error) => {
        console.error('Error al eliminar la mesa:', error);
        if (error.response?.status === 400) {
          alert('No se puede eliminar la mesa porque está asociada a pedidos.');
        } else {
          alert('Error al eliminar la mesa. Intenta nuevamente.');
        }
      });
  };


  const handleEliminarTodasMesas = () => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar todas las mesas?');
    if (!confirmar) return;
  
    axios
      .delete('http://localhost:3000/api/mesas')
      .then(() => {
        alert('Todas las mesas han sido eliminadas.');
        cargarMesas(); // Refrescar la lista de mesas
      })
      .catch((error) => {
        console.error('Error al eliminar todas las mesas:', error);
        alert('Error al eliminar todas las mesas. Intenta nuevamente.');
      });
  };

  const verificarEstadoMesa = (idMesa) => {
    axios.put(`http://localhost:3000/api/mesas/${idMesa}/verificar`)
      .then(response => console.log(response.data))
      .catch(error => console.error('Error al verificar estado de la mesa:', error));
  };
  
 

  return (
    <div className="alertas-container">
        <div className="qr-generator">
        <input
          type="text"
          name="codigo"
          value={codigo}
          onChange={handleInputChange}
          placeholder="Ingrese el código"
        />
        <input
          type="text"
          name="link"
          value={link}
          onChange={handleInputChange}
          placeholder="Ingrese el enlace para el QR"
        />
        <div ref={qrRef}>
          {link && <QRCodeCanvas value={link} size={128} level="H" includeMargin={true} />}
        </div>
        <button onClick={downloadQR}>Descargar QR</button>
      </div>
      <h2>Gestión de Mesas</h2>

      {/* Formulario para agregar una nueva mesa */}
      <form onSubmit={handleAgregarMesa} className="alertas-form">
        <input type="text" name="nombre" placeholder="Nombre de la mesa" required />
        <button type="submit">Agregar Mesa</button>
      </form>

      {/* Select para seleccionar una mesa y botón para eliminar */}
      <div className="gestionar-mesas">
        <h3>Eliminar Mesa</h3>
        <select
          value={mesaSeleccionada}
          onChange={(e) => setMesaSeleccionada(e.target.value)}
          className="mesa-select"
        >
          <option value="">Seleccionar mesa</option>
          {mesas.map((mesa) => (
            <option key={mesa.id_mesa} value={mesa.id_mesa}>
              {mesa.nombre}
            </option>
          ))}
        </select>
        <button onClick={handleEliminarMesa} className="btn-eliminar">
          Eliminar Mesa
        </button>
        <button onClick={handleEliminarTodasMesas} className="btn-eliminar-todas">
          Eliminar Todas las Mesas
        </button>

      </div>

      {/* Visualización de las mesas */}
      <div className="mesas-grid">
        {mesas.map((mesa) => (
          <div
            key={mesa.id_mesa}
            className={`mesa ${mesa.estado === 1 ? 'debe' : 'pagado'}`}
          >
            <div className="mesa-icono">
              <img src="https://cdn-icons-png.flaticon.com/512/282/282675.png" alt="Ícono de mesa" />
            </div>
            <div className="mesa-nombre">{mesa.nombre}</div>
            <div className="mesa-estado">
              {mesa.estado === 1 ? 'Ocupado' : 'Disponible'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Alertas;
