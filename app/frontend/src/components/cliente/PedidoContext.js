// PedidoContext.js
import React, { createContext, useState } from 'react';

export const PedidoContext = createContext();

export const PedidoProvider = ({ children }) => {
  const [pedidosPendientes, setPedidosPendientes] = useState([]);

  const agregarPedidoPendiente = (nuevoPedido) => {
    setPedidosPendientes((prev) => [...prev, nuevoPedido]);
  };

  const aprobarPedido = (index) => {
    setPedidosPendientes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <PedidoContext.Provider value={{ pedidosPendientes, agregarPedidoPendiente, aprobarPedido }}>
      {children}
    </PedidoContext.Provider>
  );
};
