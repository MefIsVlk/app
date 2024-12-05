const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcrypt'); // Asegúrate de escribirlo correctamente



const multer = require('multer');
const upload = multer({ dest: 'uploads/' });  // Puedes definir un directorio donde guardar los archivos
const fs = require('fs'); // Aquí comienza la configuración del almacenamiento
const path = require('path');
const axios = require('axios');



const app = express();
const port = 3000;
app.use(express.json());

// Configurar CORS
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      fontSrc: ["'self'", "data:", "https:"],
      mediaSrc: ["'self'", "data:"]
    }
  }
}));

// Configuración de la base de datos MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'barr',
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conexión a la base de datos exitosa');
  }
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// El endpoint que ya tienes
app.get('/api/comprobantes', (req, res) => {
    const directoryPath = path.join(__dirname, 'uploads/comprobantes');

    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            return res.status(500).send({
                message: "Unable to scan files!",
                error: err
            });
        }
        // Puedes optar por enviar la URL completa o solo el nombre del archivo
        const filesWithPaths = files.map(file => `http://localhost:3000/uploads/comprobantes/${file}`);
        res.send(filesWithPaths);
    });
});
// Configuración de multer para comprobantes (incluye el código aquí)
const comprobanteStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads/comprobantes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const comprobanteUpload = multer({
  storage: comprobanteStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
});

// Rutas de la API
// Ruta para obtener el inventario con detalles del producto
app.get('/api/inventario', (req, res) => {
  const query = `
    SELECT 
      inventario.id_inventario, 
      productos.id_producto, 
      productos.nombre, 
      COALESCE(tipos.nombre, 'Sin tipo') AS tipo, 
      COALESCE(inventario.cantidad, 0) AS cantidad, 
      DATE(inventario.fecha_actualizacion) AS fecha_actualizacion
    FROM productos
    LEFT JOIN inventario ON productos.id_producto = inventario.id_producto
    LEFT JOIN tipos ON productos.id_tipo = tipos.id_tipo
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener inventario:', err);
      return res.status(500).json({ message: 'Error al obtener inventario' });
    }
    res.json(results);
  });
});


app.post('/api/inventario', (req, res) => {
  const { id_producto, nombre, id_tipo, cantidad } = req.body;

  if (!nombre || !id_tipo || cantidad == null) {
    return res.status(400).json({ message: 'Faltan datos requeridos' });
  }

  if (id_producto) {
    // Actualizar producto existente
    const updateProductQuery = `UPDATE productos SET nombre = ?, id_tipo = ? WHERE id_producto = ?`;
    connection.query(updateProductQuery, [nombre, id_tipo, id_producto], (err, result) => {
      if (err) {
        console.error('Error al actualizar producto:', err);
        return res.status(500).json({ message: 'Error al actualizar producto' });
      }

      const updateInventoryQuery = `
        INSERT INTO inventario (id_producto, cantidad, fecha_actualizacion)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE cantidad = VALUES(cantidad), fecha_actualizacion = NOW()
      `;
      connection.query(updateInventoryQuery, [id_producto, cantidad], (err, result) => {
        if (err) {
          console.error('Error al actualizar inventario:', err);
          return res.status(500).json({ message: 'Error al actualizar inventario' });
        }
        res.status(200).json({ message: 'Producto actualizado correctamente' });
      });
    });
  } else {
    // Insertar nuevo producto
    const insertProductQuery = `INSERT INTO productos (nombre, id_tipo) VALUES (?, ?)`;
    connection.query(insertProductQuery, [nombre, id_tipo], (err, result) => {
      if (err) {
        console.error('Error al insertar producto:', err);
        return res.status(500).json({ message: 'Error al insertar producto' });
      }

      const newIdProducto = result.insertId;
      const insertInventoryQuery = `
        INSERT INTO inventario (id_producto, cantidad, fecha_actualizacion)
        VALUES (?, ?, NOW())
      `;
      connection.query(insertInventoryQuery, [newIdProducto, cantidad], (err, result) => {
        if (err) {
          console.error('Error al insertar inventario:', err);
          return res.status(500).json({ message: 'Error al insertar inventario' });
        }
        res.status(201).json({ message: 'Producto agregado correctamente' });
      });
    });
  }
});

// Endpoint para eliminar un producto
app.delete('/api/inventario/:id', (req, res) => {
  const { id } = req.params;
  console.log('ID recibido para eliminar:', id);

  const deleteInventoryQuery = `DELETE FROM inventario WHERE id_producto = ?`;
  connection.query(deleteInventoryQuery, [id], (err, result) => {
    if (err) {
      console.error("Error al eliminar inventario:", err);
      return res.status(500).json({ message: 'Error al eliminar inventario' });
    }
    console.log('Resultado de eliminación en inventario:', result);

    const deleteProductQuery = `DELETE FROM productos WHERE id_producto = ?`;
    connection.query(deleteProductQuery, [id], (err, result) => {
      if (err) {
        console.error("Error al eliminar producto:", err);
        return res.status(500).json({ message: 'Error al eliminar producto' });
      }
      console.log('Resultado de eliminación en productos:', result);

      res.status(200).json({ message: 'Producto eliminado correctamente' });
    });
  });
});




// Obtener todos los productos con detalles de tipo y precio
app.get('/api/productos', (req, res) => {
  const query = `
    SELECT p.id_producto, p.nombre, t.nombre AS tipo, p.precio
    FROM productos p
    JOIN tipos t ON p.id_tipo = t.id_tipo
  `;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ message: 'Error al obtener productos', error: err.message });
    }
    res.json(results);
  });
});



app.post('/api/productos', (req, res) => {
  const { nombre, id_tipo, precio, precio_compra } = req.body;
  const query = 'INSERT INTO productos (nombre, id_tipo, precio, precio_compra) VALUES (?, ?, ?, ?)';
  connection.query(query, [nombre, id_tipo, precio, precio_compra], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error al agregar producto', error: err.message });
    }
    res.status(201).json({ id_producto: result.insertId, nombre, id_tipo, precio, precio_compra });
  });
});

app.post('/api/productos/:id', (req, res) => {
  const { nombre, id_tipo, precio, precio_compra } = req.body;
  const id_producto = req.params.id;
  const query = 'UPDATE productos SET nombre = ?, id_tipo = ?, precio = ?, precio_compra = ? WHERE id_producto = ?';
  connection.query(query, [nombre, id_tipo, precio, precio_compra, id_producto], (err, result) => {
    if (err) {
      console.error('Error al actualizar producto:', err);
      return res.status(500).json({ message: 'Error al actualizar producto', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto actualizado correctamente' });
  });
});

app.delete('/api/productos/:id', (req, res) => {
  const id_producto = req.params.id;
  const query = 'DELETE FROM productos WHERE id_producto = ?';
  connection.query(query, [id_producto], (err, result) => {
    if (err) {
      console.error('Error al eliminar producto:', err);
      return res.status(500).json({ message: 'Error al eliminar producto', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  });
});

// Nueva ruta para obtener ganancias
app.get('/api/ganancias', (req, res) => {
  const query = `
    SELECT 
      productos.id_producto, 
      productos.nombre, 
      productos.precio, 
      productos.precio_compra, 
      (productos.precio - productos.precio_compra) AS ganancia
    FROM productos
  `;
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener ganancias', error: err.message });
    }
    res.json(results);
  });
});



// Ruta para eliminar todos los productos y reiniciar el ID auto-incremental
app.delete('/api/productos/todos/eliminar', (req, res) => {
  console.log("Solicitud DELETE recibida");

  // Query para eliminar productos
  const deleteProductosQuery = 'DELETE FROM productos';

  connection.query(deleteProductosQuery, (err) => {
    if (err) {
      console.error('Error al eliminar todos los productos:', err);
      return res.status(500).json({ message: 'Error al eliminar los productos', error: err.message });
    }

    // Reiniciar el contador auto-incremental
    const resetAutoIncrementQuery = 'ALTER TABLE productos AUTO_INCREMENT = 1';

    connection.query(resetAutoIncrementQuery, (err) => {
      if (err) {
        console.error('Error al reiniciar el auto-incremento:', err);
        return res.status(500).json({ message: 'Error al reiniciar el auto-incremento', error: err.message });
      }

      console.log("Todos los productos eliminados y AUTO_INCREMENT reiniciado");
      res.status(200).json({ message: 'Todos los productos eliminados y el ID reiniciado.' });
    });
  });
});

//ruta para tipos
app.post('/api/tipos', (req, res) => {
  const { nombre } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: 'El nombre del tipo es obligatorio' });
  }

  const query = 'INSERT INTO tipos (nombre) VALUES (?)';
  connection.query(query, [nombre], (err, result) => {
    if (err) {
      console.error('Error al insertar tipo:', err);
      return res.status(500).json({ message: 'Error al insertar tipo', error: err.message });
    }

    res.status(201).json({ id_tipo: result.insertId, nombre });
  });
});


// Nueva ruta para obtener los tipos
app.get('/api/tipos', (req, res) => {
  const query = 'SELECT * FROM tipos';
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener tipos', error: err.message });
    }
    res.json(results);
  });
});

app.delete("/api/tipos/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM tipos WHERE id_tipo = ?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error al eliminar la categoría:", err);
      return res.status(500).json({ message: "Error al eliminar la categoría" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.status(200).json({ message: "Categoría eliminada correctamente" });
  });
});



// Rutas para mesas
app.get('/api/mesas', (req, res) => {
  connection.query('SELECT * FROM mesas', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error al obtener mesas' });
    }
    res.json(results);
  });
});



// ruta para eliminar una mesa especifica

app.delete('/api/mesas/:id', (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'El ID de la mesa debe ser un número.' });
  }

  // Verificar si la mesa está asociada a pedidos
  connection.query('SELECT * FROM pedidos WHERE id_mesa = ?', [id], (err, results) => {
    if (err) {
      console.error('Error al verificar pedidos relacionados:', err);
      return res.status(500).json({ error: 'Error al verificar pedidos relacionados' });
    }

    if (results.length > 0) {
      return res.status(400).json({
        message: 'No se puede eliminar la mesa porque está asociada a pedidos existentes.',
      });
    }

    // Eliminar la mesa
    connection.query('DELETE FROM mesas WHERE id_mesa = ?', [id], (err, results) => {
      if (err) {
        console.error('Error al eliminar la mesa:', err);
        return res.status(500).json({ error: 'Error al eliminar la mesa.' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'La mesa no existe.' });
      }

      res.status(200).json({ message: 'Mesa eliminada correctamente.' });
    });
  });
});

// ruta para eliminar todas las mesas y reiniciar id

app.delete('/api/mesas', (req, res) => {
  const queryDeletePedidos = 'DELETE FROM pedidos';
  const queryDeleteMesas = 'DELETE FROM mesas';
  const queryResetAutoIncrement = 'ALTER TABLE mesas AUTO_INCREMENT = 1';

  // Eliminar todos los pedidos primero (si es necesario)
  connection.query(queryDeletePedidos, (err) => {
    if (err) {
      console.error('Error al eliminar pedidos:', err);
      return res.status(500).json({ error: 'Error al eliminar pedidos asociados.' });
    }

    // Luego eliminar las mesas
    connection.query(queryDeleteMesas, (err) => {
      if (err) {
        console.error('Error al eliminar mesas:', err);
        return res.status(500).json({ error: 'Error al eliminar las mesas.' });
      }

      // Reiniciar el contador AUTO_INCREMENT
      connection.query(queryResetAutoIncrement, (err) => {
        if (err) {
          console.error('Error al reiniciar AUTO_INCREMENT:', err);
          return res.status(500).json({ error: 'Error al reiniciar el contador AUTO_INCREMENT.' });
        }

        res.status(200).json({ message: 'Todas las mesas y pedidos asociados han sido eliminados.' });
      });
    });
  });
});



//ruta para limpiar mesas
// Ruta para limpiar mesas
app.delete('/api/limpiar-mesa/:nombreMesa', async (req, res) => {
  const { nombreMesa } = req.params;

  try {
    // Llama al procedimiento almacenado para eliminar los pedidos
    await db.query('CALL LimpiarMesa(?)', [nombreMesa]);

    // Obtener los pedidos eliminados para moverlos al historial
    const pedidos = await db.query(`
      SELECT p.id_pedido, p.id_mesa, p.total, p.fecha, dp.id_producto, dp.cantidad, dp.subtotal
      FROM pedidos_archivados p
      LEFT JOIN detalles_pedido_archivados dp ON p.id_pedido = dp.id_pedido
      WHERE p.id_mesa = (SELECT id_mesa FROM mesas WHERE nombre = ?)
    `, [nombreMesa]);

    if (!pedidos || pedidos.length === 0) {
      return res.status(404).json({ message: `No se encontraron pedidos asociados a la mesa "${nombreMesa}" para archivar.` });
    }

    // Mover pedidos al historial
    for (const pedido of pedidos) {
      const { id_pedido, id_mesa, total, fecha } = pedido;

      // Insertar el pedido en el historial
      await db.query(`
        INSERT INTO historial_pedidos (id_pedido, id_mesa, total, fecha)
        VALUES (?, ?, ?, ?)
      `, [id_pedido, id_mesa, total, fecha]);

      // Insertar los detalles del pedido en el historial
      await db.query(`
        INSERT INTO historial_detalles_pedido (id_pedido, id_producto, cantidad, subtotal)
        SELECT ?, id_producto, cantidad, subtotal
        FROM detalles_pedido_archivados
        WHERE id_pedido = ?
      `, [id_pedido, id_pedido]);
    }

    res.status(200).json({ message: `Mesa "${nombreMesa}" limpiada y pedidos movidos al historial correctamente.` });
  } catch (error) {
    console.error('Error al limpiar la mesa:', error);
    res.status(500).json({ message: 'Error interno al limpiar la mesa.', error: error.message });
  }
});






app.put('/api/mesas/:id/ocupar', (req, res) => {
  const mesaId = req.params.id;
  const nuevoEstado = 1;
  const query = 'UPDATE mesas SET estado = ? WHERE id_mesa = ?';
  connection.query(query, [nuevoEstado, mesaId], (error, result) => {
    if (error) {
      console.error('Error al actualizar el estado de la mesa:', error);
      res.status(500).send('Error al actualizar el estado de la mesa');
    } else {
      res.send({ mensaje: 'Estado de la mesa actualizado a ocupado' });
    }
  });
});



// Crear un nuevo pedido y sus detalles
app.post('/api/pedidos', (req, res) => {

  console.log("Datos recibidos en /api/pedidos:", req.body);
  
  const { mesa, productos } = req.body;


  if (!mesa || !productos || productos.length === 0) {
    console.log("Error: Datos inválidos")
    return res.status(400).json({ error: 'Datos inválidos. Mesa y productos son obligatorios.' });
  }

  // Obtener el ID de la mesa
  
  const obtenerMesaQuery = 'SELECT id_mesa FROM mesas WHERE nombre = ?';
  console.log("Buscando mesa:", mesa);
  connection.query(obtenerMesaQuery, [mesa], (err, mesaData) => {
    if (err) {
      console.error('Error al buscar la mesa:', err);
      return res.status(500).json({ error: 'Error interno al buscar la mesa.' });
    }

    if (mesaData.length === 0) {
      console.log("Error: Mesa no encontrada");
      return res.status(404).json({ error: 'Mesa no encontrada.' });
    }

    const idMesa = mesaData[0].id_mesa;
    console.log("Mesa encontrada, ID:", idMesa);
    let total = 0;

    // Insertar el pedido en la tabla "pedidos"
    const insertarPedidoQuery = 'INSERT INTO pedidos (id_mesa, fecha, total) VALUES (?, CURDATE(), ?)';
    connection.query(insertarPedidoQuery, [idMesa, total], (err, pedidoResult) => {
      if (err) {
        console.error('Error al insertar el pedido:', err);
        return res.status(500).json({ error: 'Error interno al registrar el pedido.' });
      }

      const idPedido = pedidoResult.insertId;

      // Obtener los precios de los productos
      const idsProductos = productos.map((item) => item.id_producto);
      const obtenerPreciosQuery = 'SELECT id_producto, precio FROM productos WHERE id_producto IN (?)';
      connection.query(obtenerPreciosQuery, [idsProductos], (err, precios) => {
        console.log("IDs de productos enviados:", idsProductos);

        if (err) {
          console.error('Error al obtener los precios de los productos:', err);
          return res.status(500).json({ error: 'Error interno al obtener los precios.' });
        }

        const detallesPedido = [];
        productos.forEach((item) => {
          const producto = precios.find((p) => p.id_producto === item.id_producto);
          if (!producto) {
            return res.status(400).json({ error: `Producto con ID ${item.id_producto} no encontrado.` });
          }

          const subtotal = producto.precio * item.cantidad;
          total += subtotal;
          detallesPedido.push([idPedido, item.id_producto, item.cantidad, subtotal]);
        });

        // Insertar detalles del pedido
        const insertarDetallesQuery =
          'INSERT INTO detallespedido (id_pedido, id_producto, cantidad, subtotal) VALUES ?';
        connection.query(insertarDetallesQuery, [detallesPedido], (err) => {
          if (err) {
            console.error('Error al insertar los detalles del pedido:', err);
            return res.status(500).json({ error: 'Error interno al registrar los detalles del pedido.' });
          }

          // Actualizar el total del pedido
          const actualizarTotalQuery = 'UPDATE pedidos SET total = ? WHERE id_pedido = ?';
          connection.query(actualizarTotalQuery, [total, idPedido], (err) => {
            if (err) {
              console.error('Error al actualizar el total del pedido:', err);
              return res.status(500).json({ error: 'Error interno al actualizar el total del pedido.' });
            }

             // Llamar al nuevo endpoint para verificar el estado de la mesa
             axios.put(`http://localhost:3000/api/mesas/${idMesa}/verificar`)
             .then(() => {
               res.status(201).json({ message: 'Pedido registrado con éxito.', id_pedido: idPedido });
             })
             .catch(error => {
               console.error('Error al actualizar el estado de la mesa:', error);
               res.status(500).json({ error: 'Error al actualizar el estado de la mesa.' });
             });
          });
        });
      });
    });
  });
});

// Crear un nuevo pedido y sus detalles
app.post('/api/pedidosadmin', (req, res) => {
  const { mesa, productos } = req.body;
  let total = 0;

  connection.query('INSERT INTO pedidos (id_mesa, fecha, total) VALUES (?, CURDATE(), ?)', [mesa, total], (err, resultPedido) => {
    if (err) {
      console.error('Error al registrar el pedido:', err);
      return res.status(500).json({ error: 'Error al registrar el pedido' });
    }
    const id_pedido = resultPedido.insertId;

    productos.forEach((item, index) => {
      const { id_producto, cantidad } = item;

      connection.query('SELECT precio FROM productos WHERE id_producto = ?', [id_producto], (err, producto) => {
        if (err) {
          console.error('Error al obtener el precio del producto:', err);
          return res.status(500).json({ error: 'Error al obtener el precio del producto' });
        }

        const subtotal = producto[0].precio * cantidad;
        total += subtotal;

        connection.query('INSERT INTO detallespedido (id_pedido, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)', [id_pedido, id_producto, cantidad, subtotal], (err) => {
          if (err) {
            console.error('Error al insertar en detallespedido:', err);
            return res.status(500).json({ error: 'Error al registrar el detalle del pedido' });
          }

          if (index === productos.length - 1) {
            connection.query('UPDATE pedidos SET total = ? WHERE id_pedido = ?', [total, id_pedido], (err) => {
              if (err) {
                console.error('Error al actualizar total del pedido:', err);
                return res.status(500).json({ error: 'Error al actualizar total del pedido' });
              }
              res.status(201).json({ message: 'Pedido registrado con éxito' });
            });
          }
        });
      });
    });
  });
});





//consultar detalle pedido
app.get('/api/detallespedido/:idPedido', (req, res) => {
  const idPedido = req.params.idPedido;

  const query = `SELECT SUM(subtotal) as total 
                FROM detallespedido 
                WHERE id_pedido = ? `;
  
  connection.query(query, [idPedido], (error, results) => {
    if (error) {
      console.error('Error al obtener los detalles del pedido:', error);
      res.status(500).send('Error al obtener los detalles del pedido');
    } else {
      res.send(results);
    }
  });
});

/// ruta para cambiar el estado a pagado
app.put('/api/detallespedido/estado/pagado/:idPedido', (req, res) => {
  const idPedido = req.params.idPedido;

  const updateEstadoQuery = `
    UPDATE detallespedido
    SET estado = 'Pagado'
    WHERE id_pedido = ?
  `;

  connection.query(updateEstadoQuery, [idPedido], (error, results) => {
    if (error) {
      console.error('Error al actualizar el estado del pedido:', error);
      res.status(500).send('Error al actualizar el estado del pedido');
    } else if (results.affectedRows === 0) {
      res.status(404).send('No se encontró un pedido con ese ID');
    } else {
      res.send({ message: 'El estado del pedido ha sido actualizado a "Pagado"' });
    }
  });
});







app.put("/api/actualizarpedido", (req, res) => {
  const { idPedido, estado } = req.body;

  if (!idPedido || !estado) {
    return res.status(400).json({ message: "ID del pedido y estado son requeridos." });
  }

  const query = `UPDATE pedidos SET estado = ? WHERE id_pedido = ?`;

  connection.query(query, [estado, idPedido], (err, result) => {
    if (err) {
      console.error("Error al actualizar el estado del pedido:", err);
      return res.status(500).json({ message: "Error al actualizar el estado del pedido." });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pedido no encontrado." });
    }

    res.status(200).json({ message: "Estado del pedido actualizado correctamente." });
  });
});

// Ruta para obtener productos por tipo
app.get('/api/productos/tipo/:tipo', (req, res) => {
  const { tipo } = req.params;
  const query = 'SELECT * FROM productos WHERE tipo = ?';
  
  connection.query(query, [tipo], (err, results) => {
    if (err) {
      console.error('Error al obtener productos por tipo:', err);
      return res.status(500).json({ message: 'Error al obtener productos por tipo' });
    }
    res.json(results);
  });
});

//rutas cajas
app.get('/api/cajas', (req, res) => {
  const query = 'SELECT * FROM cajas';
  connection.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener cajas' });
    res.json(results);
  });
});

// Crear una nueva caja
app.post('/api/cajas', (req, res) => {
  const { nombre } = req.body;
  const query = 'INSERT INTO cajas (nombre) VALUES (?)';
  connection.query(query, [nombre], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al crear caja' });
    res.status(201).json({ id: result.insertId, nombre });
  });
});

// Editar caja
app.put('/api/cajas/:id', (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  const query = 'UPDATE cajas SET nombre = ? WHERE id = ?';
  connection.query(query, [nombre, id], (err) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar caja' });
    res.json({ message: 'Caja actualizada correctamente' });
  });
});

// Eliminar caja
app.delete('/api/cajas/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM cajas WHERE id = ?';
  connection.query(query, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar caja' });
    res.json({ message: 'Caja eliminada correctamente' });
  });
  // tabla de pedidos de cliente segun su mesa
});// Tabla de pedidos de cliente según su mesa
// Obtener pedidos realizados para una mesa específica


// Tabla de pedidos de cliente según su mesa
// Obtener pedidos realizados para una mesa específica

app.get('/api/pedidos/mesa/:nombre', (req, res) => {
  const { nombre } = req.params;
  console.log(`Consulta recibida para mesa: ${nombre}`);

  const query = `
    SELECT 
      p.id_pedido,
      m.nombre AS mesa,
      pr.nombre AS producto,
      dp.cantidad,
      pr.precio,
      (dp.cantidad * pr.precio) AS subtotal,
      dp.estado
    FROM pedidos p
    INNER JOIN mesas m ON p.id_mesa = m.id_mesa
    INNER JOIN detallespedido dp ON p.id_pedido = dp.id_pedido
    INNER JOIN productos pr ON dp.id_producto = pr.id_producto
    WHERE LOWER(m.nombre) = LOWER(?) AND dp.estado = 'pendiente';
  `;

  connection.query(query, [nombre], (err, results) => {
    if (err) {
      console.error('Error al obtener los pedidos:', err);
      return res.status(500).json({ message: 'Error al obtener los pedidos' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron pedidos pendientes para esta mesa.' });
    }

    res.json(results);
  });
});



app.get('/api/pedidos/pendientes', (req, res) => {
  const query = `SELECT * FROM pedidos WHERE estado = 'pendiente'`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener pedidos pendientes:', err);
      return res.status(500).json({ error: 'Error al obtener pedidos.' });
    }
    res.json(results);
  });
});





//verifica si la mesa esta ocupada
app.get('/api/mesas/:id/estado', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT estado 
    FROM mesas 
    WHERE id_mesa = ?
  `;

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al consultar estado de la mesa:', err);
      return res.status(500).json({ error: 'Error al consultar estado de la mesa' });
    }
    if (!results.length) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }
    res.json({ estado: results[0].estado });
  });
});






app.get('/api/mesas-con-pedidos', async (req, res) => {
  try {
    const mesas = await db.query(`
      SELECT m.id_mesa, m.nombre, p.id_pedido, p.estado, dp.id_producto, dp.cantidad, pr.nombre AS nombre_producto
      FROM mesas m
      LEFT JOIN pedidos p ON p.id_mesa = m.id_mesa
      LEFT JOIN detallespedido dp ON dp.id_pedido = p.id_pedido
      LEFT JOIN productos pr ON dp.id_producto = pr.id_producto
    `);

    const mesasAgrupadas = mesas.reduce((acc, row) => {
      const mesa = acc.find(m => m.id_mesa === row.id_mesa);
      if (!mesa) {
        acc.push({
          id_mesa: row.id_mesa,
          nombre: row.nombre,
          pedidos: [],
        });
      }
      if (row.id_pedido) {
        const mesaActual = acc.find(m => m.id_mesa === row.id_mesa);
        const pedidoExistente = mesaActual.pedidos.find(p => p.id_pedido === row.id_pedido);
        if (!pedidoExistente) {
          mesaActual.pedidos.push({
            id_pedido: row.id_pedido,
            estado: row.estado,
            productos: [],
          });
        }
        if (row.id_producto) {
          const pedidoActual = mesaActual.pedidos.find(p => p.id_pedido === row.id_pedido);
          pedidoActual.productos.push({
            id_producto: row.id_producto,
            nombre_producto: row.nombre_producto,
            cantidad: row.cantidad,
          });
        }
      }
      return acc;
    }, []);

    res.json(mesasAgrupadas);
  } catch (error) {
    console.error('Error al obtener mesas con pedidos:', error);
    res.status(500).send('Error al obtener mesas con pedidos');
  }
});
//para inserta  mesas

app.post('/api/mesas', (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre de la mesa es requerido.' });
  }

  const query = `INSERT INTO mesas (nombre, estado) VALUES (?, 0)`; // Estado predeterminado: Libre (0)

  connection.query(query, [nombre], (err, result) => {
    if (err) {
      console.error('Error al agregar mesa:', err);
      return res.status(500).json({ message: 'Error al agregar mesa.' });
    }

    res.status(201).json({ message: 'Mesa agregada correctamente.' });
  });
});

// pra cambiar el estado de la mesa si esta tine un pedido
app.get('/api/mesas', async (req, res) => {
  try {
    const mesas = await db.query(`
      SELECT 
        m.id_mesa, 
        m.nombre, 
        CASE 
          WHEN EXISTS (
            SELECT 1 
            FROM pedidos 
            WHERE pedidos.id_mesa = m.id_mesa 
            AND pedidos.estado = 'pendiente'
          ) THEN 1 
          ELSE 0 
        END AS estado
      FROM mesas m
    `);

    res.json(mesas);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ message: 'Error al obtener mesas.' });
  }
});



app.get("/api/mesas", async (req, res) => {
  try {
    const mesas = await db.query("SELECT * FROM mesas");
    res.json(mesas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las mesas" });
  }
});
app.get("/api/mesas/:id_mesa/pedidos", async (req, res) => {
  const { id_mesa } = req.params;

  try {
    const pedidos = await db.query(
      "SELECT * FROM pedidos WHERE id_mesa = ?",
      [id_mesa]
    );

    // Obtener productos de cada pedido
    const pedidosConProductos = await Promise.all(
      pedidos.map(async (pedido) => {
        const productos = await db.query(
          "SELECT p.id_producto, p.nombre_producto, dp.cantidad FROM detallespedido dp INNER JOIN productos p ON dp.id_producto = p.id_producto WHERE dp.id_pedido = ?",
          [pedido.id_pedido]
        );
        return { ...pedido, productos };
      })
    );

    res.json(pedidosConProductos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los pedidos de la mesa" });
  }
});

app.get('/api/vista-pedidos', (req, res) => {
  const query = 'SELECT * FROM vista_pedidos_por_mesa';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar la vista de pedidos por mesa:', err);
      return res.status(500).json({ error: 'Error al consultar la vista de pedidos por mesa' });
    }

    res.json(results);
  });
});


// Ruta para hacer llegar los pedidos pendientes ha pedidos de amini y aprobarlos o rechazarlos
app.get('/api/vistapedidos', (req, res) => {
  console.log('Ruta /api/vistapedidos alcanzada');
  const query = `
    SELECT  
      p.id_pedido,
      p.id_mesa,
      p.fecha,
      p.total,
      dp.id_producto,
      dp.cantidad,
      pr.nombre AS nombre_producto,
      pr.precio
    FROM pedidos p
    JOIN detallespedido dp ON p.id_pedido = dp.id_pedido
    JOIN productos pr ON dp.id_producto = pr.id_producto
    WHERE p.estado = 'pendiente'
    ORDER BY p.fecha DESC;
  `;

  // Ejecutar la consulta
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar los pedidos pendientes:', err);
      return res.status(500).json({ error: 'Error al consultar los pedidos pendientes' });
    }

    res.json(results);
  });
});

app.put('/api/actualizarpedido', (req, res) => {
  const { idPedido, accion } = req.body; // Datos enviados desde el frontend

  const query = `
    UPDATE pedidos 
    SET estado = ? 
    WHERE id_pedido = ?;
  `;

  connection.query(query, [accion, idPedido], (err, results) => {
    if (err) {
      console.error('Error al actualizar el estado del pedido:', err);
      return res.status(500).json({ error: 'Error al actualizar el pedido' });
    }

    if (results.affectedRows > 0) {
      res.json({ message: 'Pedido ${idPedido} actualizado a ${accion}' });
    } else {
      res.status(404).json({ error: 'Pedido no encontrado' });
    }
  });
});


// Puede ser "diario", "mensual" o "anual"
app.get('/api/ventas-periodo', (req, res) => {
  console.log('Ruta /api/ventas-periodo alcanzada');
  const { periodo } = req.query;

  let query = '';
  if (periodo === 'diario') {
    query = `
      SELECT 
        fecha AS Dia, 
        SUM(total) AS TotalVentas 
      FROM pedidos 
      WHERE estado = 'entregado' 
      GROUP BY fecha 
      ORDER BY fecha DESC
    `;
  } else if (periodo === 'mensual') {
    query = `
      SELECT 
        DATE_FORMAT(fecha, '%Y-%m') AS Mes, 
        SUM(total) AS TotalVentas 
      FROM pedidos 
      WHERE estado = 'entregado' 
      GROUP BY DATE_FORMAT(fecha, '%Y-%m') 
      ORDER BY Mes DESC
    `;
  } else if (periodo === 'anual') {
    query = `
      SELECT 
        YEAR(fecha) AS Año, 
        SUM(total) AS TotalVentas 
      FROM pedidos 
      WHERE estado = 'entregado' 
      GROUP BY YEAR(fecha) 
      ORDER BY Año DESC
    `;
  } else {
    return res.status(400).json({ error: 'Período no válido' });
  }

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar las ventas por periodo:', err);
      return res.status(500).json({ error: 'Error al consultar las ventas por periodo' });
    }

    // Adaptar la respuesta para incluir los nombres correctos de los períodos
    const formattedResults = results.map((row) => {
      if (periodo === 'diario') {
        return { periodo: row.Dia, total_ventas: row.TotalVentas };
      } else if (periodo === 'mensual') {
        return { periodo: row.Mes, total_ventas: row.TotalVentas };
      } else if (periodo === 'anual') {
        return { periodo: row.Año.toString(), total_ventas: row.TotalVentas };
      }
    });

    res.json(formattedResults);
  });
});



app.get('/api/resumen-productos', (req, res) => {
  console.log('Ruta /api/resumen-productos alcanzada');

  const query = `
    SELECT 
      id_producto, 
      nombre_producto, 
      total_vendido, 
      total_ventas 
    FROM vista_resumen_ventas_producto
    ORDER BY total_ventas DESC;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar el resumen de ventas por producto:', err);
      return res.status(500).json({ error: 'Error al consultar el resumen de ventas por producto' });
    }

    res.json(results);
  });
});
//ventas por mesa

app.get('/api/ventas-mesa', (req, res) => {
  console.log('Ruta /api/ventas-mesa alcanzada');

  const query = 'SELECT * FROM vista_resumen_ventas_mesa';

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar las ventas por mesa:', err);
      return res.status(500).json({ error: 'Error al consultar las ventas por mesa' });
    }

    res.json(results);
  });
});
// administrar caja 
app.get('/api/ventas-dia', (req, res) => {
  const query = `
    SELECT dia AS fecha, total_ventas 
    FROM vista_ventas_periodo
    WHERE dia = CURDATE();
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar las ventas del día:', err);
      return res.status(500).json({ error: 'Error al consultar las ventas del día' });
    }

    if (results.length > 0) {
      res.json(results[0]); // Enviar la primera fila como resultado
    } else {
      res.json({ fecha: new Date().toISOString().split('T')[0], total_ventas: 0 }); // Si no hay ventas, retorna total_ventas: 0
    }
  });
});


//tipos de cajas y trans
app.get('/api/cajas', (req, res) => {
  const query = 'SELECT `id`, `nombre`, `fecha_creacion` FROM `cajas` WHERE 1';
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener las cajas' });
    }
    res.json(results);
  });
});
app.get('/api/transacciones/:cajaId', (req, res) => {
  const { cajaId } = req.params;
  const query = 'SELECT `id`, `caja_id`, `tipo`, `monto`, `descripcion`, `fecha`, `tipo_pago_id` FROM `transacciones` WHERE `caja_id` = ?';
  connection.query(query, [cajaId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener las transacciones' });
    }
    res.json(results);
  });
});
app.get('/api/tipos_pago', (req, res) => {
  const query = 'SELECT `id`, `metodo` FROM `tipos_pago` WHERE 1';
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los tipos de pago' });
    }
    res.json(results);
  });
});
// insertar transacion
app.post('/api/transacciones', (req, res) => {
  const { caja_id, tipo_pago_id, monto, descripcion } = req.body;

  // Validar que todos los campos requeridos están presentes
  if (!caja_id || !tipo_pago_id || monto == null || !descripcion) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // Determinar si la transacción es un ingreso o un egreso basado en el signo del monto
  const tipo = monto >= 0 ? 'ingreso' : 'egreso';

  const query = `
    INSERT INTO transacciones (caja_id, tipo_pago_id, tipo, monto, descripcion, fecha)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  // Usar el tipo determinado arriba para la inserción
  connection.query(query, [caja_id, tipo_pago_id, tipo, monto, descripcion], (err, result) => {
    if (err) {
      console.error('Error al insertar transacción:', err);
      return res.status(500).json({ error: 'Error al insertar la transacción' });
    }
    res.status(201).json({ message: 'Transacción agregada exitosamente', id: result.insertId });
  });
});


///
// Middleware para filtros de archivos y configuración de almacenamiento
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const comprobanteStoragePago = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/comprobantes'); // Carpeta donde se guardará el archivo
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
    cb(null, uniqueName); // Nombre único para evitar colisiones
  },
});

const comprobanteUploadPago = multer({
  storage: comprobanteStoragePago,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Tamaño máximo: 2MB
});

// Ruta para procesar el pago y guardar el archivo
app.post('/api/pagoPedido', comprobanteUpload.single('archivo'), (req, res) => {
  const { caja_id, tipo_pago_id, pedido_id } = req.body;
  const archivo = req.file;

  if (!caja_id || !tipo_pago_id || !pedido_id) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const comprobantePath = archivo ? `uploads/comprobantes/${archivo.filename}` : null; // Ruta relativa

  // Iniciar la transacción
  connection.beginTransaction((err) => {
    if (err) {
      console.error('Error al iniciar la transacción:', err);
      return res.status(500).json({ error: 'Error al procesar el pago' });
    }

    // Insertar el pago en la tabla transacciones
    const insertPagoQuery = `
      INSERT INTO transacciones (caja_id, tipo, monto, descripcion, tipo_pago_id, pedido_id, comprobante, fecha)
      VALUES (?, 'ingreso', (SELECT total FROM pedidos WHERE id_pedido = ?), 'Pago de pedido', ?, ?, ?, NOW())
    `;
    connection.query(
      insertPagoQuery,
      [caja_id, pedido_id, tipo_pago_id, pedido_id, comprobantePath],
      (err, result) => {
        if (err) {
          console.error('Error al registrar el pago:', err);
          return connection.rollback(() => {
            res.status(500).json({ error: 'Error al registrar el pago' });
          });
        }

        // Confirmar la transacción
        connection.commit((err) => {
          if (err) {
            console.error('Error al confirmar la transacción:', err);
            return connection.rollback(() => {
              res.status(500).json({ error: 'Error al completar el pago' });
            });
          }

          res.status(201).json({
            message: 'Pago registrado exitosamente',
            pagoId: result.insertId,
            comprobante: comprobantePath, // Retorna la ruta del comprobante
          });
        });
      }
    );
  });
});











app.use((req, res, next) => {
  console.log(`Solicitud recibida: ${req.method} ${req.url}`);
  next();
});


// Ruta de registro


app.post('/register', async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  if (!nombre || !correo || !contraseña) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  try {
    // Generar el hash de la contraseña
    const saltRounds = 10; // Número de rondas para generar el salt
    const hashedPassword = await bcrypt.hash(contraseña, saltRounds);

    const query = 'INSERT INTO usuarios_login (nombre, correo, contraseña) VALUES (?, ?, ?)';
    connection.query(query, [nombre, correo, hashedPassword], (err, result) => {
      if (err) {
        console.error('Lo sentimos, no se aceptan mas regitros:', err);
        return res.status(500).json({ message: 'Lo sentimos, no se aceptan mas regitros.' });
      }

      res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    });
  } catch (error) {
    console.error('Error al encriptar la contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

// Ruta de inicio de sesión
app.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
  }

  const query = 'SELECT * FROM usuarios_login WHERE correo = ?';
  connection.query(query, [correo], async (err, results) => {
    if (err) {
      console.error('Error al iniciar sesión:', err);
      return res.status(500).json({ message: 'Error al iniciar sesión.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const user = results[0];

    // Comparar la contraseña ingresada con la encriptada
    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (isMatch) {
      res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    } else {
      res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }
  });
});


app.post('/recover', async (req, res) => {
  const { correo, nuevaContraseña } = req.body;

  if (!correo || !nuevaContraseña) {
    return res.status(400).json({ message: 'Correo y nueva contraseña son requeridos.' });
  }

  try {
    // Generar el hash de la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nuevaContraseña, saltRounds);

    const query = 'UPDATE usuarios_login SET contraseña = ? WHERE correo = ?';
    connection.query(query, [hashedPassword, correo], (err, result) => {
      if (err) {
        console.error('Error al actualizar contraseña:', err);
        return res.status(500).json({ message: 'Error al actualizar contraseña.' });
      }

      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
      } else {
        res.status(404).json({ message: 'Usuario no encontrado.' });
      }
    });
  } catch (error) {
    console.error('Error al encriptar la nueva contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Errores específicos de Multer
    return res.status(400).json({ error: 'Error al subir el archivo', details: err.message });
  } else if (err) {
    // Otros errores generales
    return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
  next(); // Continúa si no hay errores
});

app.get('/productos/ganancias', (req, res) => {
  const query = `
    SELECT 
        p.nombre AS producto,
        SUM((p.precio - p.precio_compra) * dp.cantidad) AS ganancia_total,
        SUM(dp.cantidad) AS numero_ventas
    FROM detallespedido dp
    JOIN productos p ON dp.id_producto = p.id_producto
    GROUP BY p.nombre
    ORDER BY ganancia_total DESC;
  `;

  const totalQuery = `
    SELECT 
        SUM((p.precio - p.precio_compra) * dp.cantidad) AS total_ganancia,
        SUM(dp.cantidad) AS total_ventas
    FROM detallespedido dp
    JOIN productos p ON dp.id_producto = p.id_producto;
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener ganancias y ventas:', err);
      return res.status(500).json({ message: 'Error al obtener los datos.' });
    }

    connection.query(totalQuery, (err2, totals) => {
      if (err2) {
        console.error('Error al obtener totales:', err2);
        return res.status(500).json({ message: 'Error al obtener los totales.' });
      }

      res.status(200).json({
        productos: results,
        totales: totals[0], // Enviamos los totales
      });
    });
  });
});


// Endpoint para verificar y actualizar el estado de una mesa
app.put('/api/mesas/:id/verificar', (req, res) => {
  const idMesa = req.params.id;

  // Verificar si hay pedidos pendientes en la mesa
  const query = `
    SELECT COUNT(*) AS pedidosPendientes
    FROM pedidos
    WHERE id_mesa = ? AND estado = 'pendiente';
  `;

  connection.query(query, [idMesa], (err, results) => {
    if (err) {
      console.error('Error al verificar pedidos pendientes:', err);
      return res.status(500).json({ error: 'Error al verificar pedidos pendientes' });
    }

    const pedidosPendientes = results[0].pedidosPendientes;

    // Si hay pedidos pendientes, el estado será 1 (ocupado), de lo contrario 0 (disponible)
    const nuevoEstado = pedidosPendientes > 0 ? 1 : 0;

    const updateQuery = `
      UPDATE mesas
      SET estado = ?
      WHERE id_mesa = ?;
    `;

    connection.query(updateQuery, [nuevoEstado, idMesa], (err) => {
      if (err) {
        console.error('Error al actualizar el estado de la mesa:', err);
        return res.status(500).json({ error: 'Error al actualizar el estado de la mesa' });
      }

      res.json({
        message: `Estado de la mesa actualizado a ${
          nuevoEstado === 1 ? 'ocupado' : 'disponible'
        }`,
      });
    });
  });
});

// Ruta para obtener información de un usuario por ID
app.get('/usuario/:id', (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'El ID de usuario es requerido.' });
  }

  const query = 'SELECT nombre, correo FROM usuarios_login WHERE id = ?';
  
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error al obtener información del usuario:', err);
      return res.status(500).json({ message: 'Error interno del servidor.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    res.status(200).json(results[0]);
  });
});


// Endpoint para obtener datos del usuario
app.get('/usuario/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT nombre, correo FROM Usuarios WHERE id = ?', [id]);
    connection.end();

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener datos del usuario' });
  }
});

// Endpoint para cambiar la contraseña por correo
app.post('/usuario/cambiar-contrasena', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ mensaje: 'Se requieren todos los campos' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Buscar al usuario por su correo
    const [rows] = await connection.execute('SELECT contraseña FROM Usuarios WHERE correo = ?', [email]);

    if (rows.length === 0) {
      connection.end();
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const user = rows[0];

    // Verificar la contraseña actual
    const passwordMatch = await bcrypt.compare(currentPassword, user.contrasena);
    if (!passwordMatch) {
      connection.end();
      return res.status(401).json({ mensaje: 'Contraseña actual incorrecta' });
    }

    // Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña en la base de datos
    await connection.execute('UPDATE Usuarios SET contraseña = ? WHERE correo = ?', [hashedPassword, email]);
    connection.end();

    res.json({ mensaje: 'Contraseña cambiada exitosamente' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
});



// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = connection;