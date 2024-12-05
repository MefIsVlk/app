import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Principal from './components/Principal';
import Ventas from './components/Ventas';
import Productos from './components/Productos';
import TerminalPost from './components/TerminalPost';
import Reportes from './components/Reportes';
import Pedidos from './components/Pedidos';
import Inventario from './components/Inventario';
import Compras from './components/Compras';
import Alertas from './components/Alertas';
import Administracaja from './components/Administracaja';
import Cliente from './components/Cliente';
import Pedidocliente from './components/cliente/Pedidocliente';
import { PedidoProvider } from './components/cliente/PedidoContext';
import './App.css';
import './components/Principal.css';

function App() {
  const location = useLocation();

  // Define las rutas donde el Sidebar no debería aparecer
  const hideSidebarRoutes = ['/cliente/Pedidocliente'];

  return (
    <div style={{ display: 'flex' }}>
      {/* Renderiza el Sidebar solo si la ruta actual no está en hideSidebarRoutes */}
      {!hideSidebarRoutes.includes(location.pathname) && <Sidebar />}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Principal />} />
          <Route path="/Productos" element={<Productos />} />
          <Route path="/Reportes" element={<Reportes />} />
          <Route path="/Pedidos" element={<Pedidos />} />
          <Route path="/Inventario" element={<Inventario />} />
          <Route path="/Alertas" element={<Alertas />} />
          <Route path="/Administracaja" element={<Administracaja />} />
          <Route path="/Cliente" element={<Cliente />} />
          <Route path="/cliente/Pedidocliente" element={<PedidoCliente />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
