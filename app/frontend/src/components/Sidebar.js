import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'space-between' }}>
      <div>
        <ul>
          <li>
            <Link to="/">
              <i className="fas fa-home"></i> Principal
            </Link>
          </li>
          <li>
            <Link to="/Productos">
              <i className="fas fa-shopping-cart"></i> Productos
            </Link>
          </li>
          <li>
            <Link to="/Reportes">
              <i className="fas fa-chart-bar"></i> Reportes
            </Link>
          </li>
          <li>
            <Link to="/Pedidos">
              <i className="fas fa-clipboard-list"></i> Pedidos
            </Link>
          </li>
          <li>
            <Link to="/Inventario">
              <i className="fas fa-box-open"></i> Inventario
            </Link>
          </li>
          <li>
            <Link to="/Alertas">
              <i className="fas fa-bell"></i> Mesas
            </Link>
          </li>
          <li>
            <Link to="/Administracaja">
              <i className="fas fa-wallet"></i> Administracaja
            </Link>
          </li>
          <li>
            <Link to="/Cliente">
              <i className="fas fa-wallet"></i> Cliente
            </Link>
          </li>
          <li>
            <Link to="/cliente/Pedidocliente">
              <i className="fas fa-wallet"></i> Pedido Cliente
            </Link>
          </li>
          <li>
            <Link to="/Configuracion">
              <i className="fas fa-cog"></i> Configuración
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
