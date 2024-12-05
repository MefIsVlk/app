import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
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
import Configuracion from './components/Configuracion'; // Importa el componente Configuración
import { PedidoProvider } from './components/cliente/PedidoContext';
import AuthForm from './components/AuthForm';
import './App.css';
import './components/Principal.css';

function Layout({ children }) {
  const location = useLocation();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const shouldHideSidebar = location.pathname === '/cliente/pedidocliente';

  return (
    <div className={`app ${isSidebarVisible && !shouldHideSidebar ? 'sidebar-visible' : 'sidebar-hidden'}`}>
      {!shouldHideSidebar && (
        <div className={`sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
          <Sidebar />
        </div>
      )}
      <div className={`content ${isSidebarVisible && !shouldHideSidebar ? '' : 'content-expanded'}`}>
        {children}
      </div>
      {!shouldHideSidebar && (
        <div className="sidebar-toggle-container">
          <label className="switch">
            <input
              type="checkbox"
              className="input__check"
              checked={isSidebarVisible}
              onChange={() => setIsSidebarVisible(!isSidebarVisible)}
            />
            <span className="slider"></span>
          </label>
        </div>
      )}
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuthState = sessionStorage.getItem('isAuthenticated');
    const isClientAccess = sessionStorage.getItem('isClientAccess');
    return isClientAccess === 'true' || savedAuthState === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('isClientAccess');
  };

  const handleClientAccess = () => {
    sessionStorage.setItem('isClientAccess', 'true');
    setIsAuthenticated(true);
  };

  return (
    <PedidoProvider>
      <Router>
        <Routes>
          {isAuthenticated ? (
            <>
              <Route
                path="/"
                element={
                  <Layout>
                    <Principal />
                  </Layout>
                }
              />
              <Route
                path="/ventas"
                element={
                  <Layout>
                    <Ventas />
                  </Layout>
                }
              />
              <Route
                path="/productos"
                element={
                  <Layout>
                    <Productos />
                  </Layout>
                }
              />
              <Route
                path="/terminalpost"
                element={
                  <Layout>
                    <TerminalPost />
                  </Layout>
                }
              />
              <Route
                path="/reportes"
                element={
                  <Layout>
                    <Reportes />
                  </Layout>
                }
              />
              <Route
                path="/pedidos"
                element={
                  <Layout>
                    <Pedidos />
                  </Layout>
                }
              />
              <Route
                path="/inventario"
                element={
                  <Layout>
                    <Inventario />
                  </Layout>
                }
              />
              <Route
                path="/compras"
                element={
                  <Layout>
                    <Compras />
                  </Layout>
                }
              />
              <Route
                path="/alertas"
                element={
                  <Layout>
                    <Alertas />
                  </Layout>
                }
              />
              <Route
                path="/administracaja"
                element={
                  <Layout>
                    <Administracaja />
                  </Layout>
                }
              />
              <Route
                path="/cliente"
                element={
                  <Layout>
                    <Cliente />
                  </Layout>
                }
              />
              <Route
                path="/cliente/pedidocliente"
                element={<Pedidocliente />}
              />
              <Route
                path="/configuracion"
                element={
                  <Layout>
                    <Configuracion onLogout={handleLogout} />
                  </Layout>
                }
              />
            </>
          ) : (
            <>
              <Route path="/" element={<AuthForm onLogin={handleLogin} />} />
              <Route
                path="/cliente/pedidocliente"
                element={<Pedidocliente />}
                onEnter={handleClientAccess}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </Router>
    </PedidoProvider>
  );
}

export default App;
