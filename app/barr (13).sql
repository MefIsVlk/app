-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 03-12-2024 a las 21:25:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `barr`
--

DELIMITER $$
--
-- Procedimientos
--
CREATE PROCEDURE `sp_actualizar_producto` (IN `id_producto` INT, IN `nombre_producto` VARCHAR(100), IN `tipo_producto` VARCHAR(50), IN `precio` DECIMAL(10,2))   BEGIN
    UPDATE productos
    SET nombre = nombre_producto,
        tipo = tipo_producto,
        precio = precio
    WHERE id_producto = id_producto;
END$$

CREATE PROCEDURE `sp_insertar_inventario` (IN `id_producto` INT, IN `cantidad` INT, IN `fecha_actualizacion` DATE)   BEGIN
    INSERT INTO inventario (id_producto, cantidad, fecha_actualizacion)
    VALUES (id_producto, cantidad, fecha_actualizacion);
END$$

CREATE PROCEDURE `sp_insertar_mesa` (IN `nombre_mesa` VARCHAR(100), IN `estado` TINYINT)   BEGIN
    INSERT INTO mesas (nombre, estado)
    VALUES (nombre_mesa, estado);
END$$

CREATE PROCEDURE `sp_insertar_producto` (IN `nombre_producto` VARCHAR(100), IN `tipo_producto` VARCHAR(50), IN `precio` DECIMAL(10,2))   BEGIN
    INSERT INTO productos (nombre, tipo, precio)
    VALUES (@nombre_producto, @tipo_producto, @precio);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cajas`
--

CREATE TABLE `cajas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cajas`
--

INSERT INTO `cajas` (`id`, `nombre`, `fecha_creacion`) VALUES
(1, 'Caja Principa', '2024-11-08 20:16:27'),
(2, 'Caja de Transacciones', '2024-11-08 20:16:27'),
(3, 'Caja Base', '2024-11-08 20:16:27');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detallespedido`
--

CREATE TABLE `detallespedido` (
  `id_detalle` int(11) NOT NULL,
  `id_pedido` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `estado` varchar(50) NOT NULL DEFAULT 'Pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detallespedido`
--

INSERT INTO `detallespedido` (`id_detalle`, `id_pedido`, `id_producto`, `cantidad`, `subtotal`, `estado`) VALUES
(1, 1, 1, 1, 3000.00, 'Pagado'),
(2, 2, 1, 1, 3000.00, 'Pendiente'),
(3, 3, 5, 1, 4000.00, 'Pagado'),
(4, 4, 3, 1, 3000.00, 'Pagado'),
(5, 5, 3, 2, 6000.00, 'Pagado'),
(6, 6, 8, 2, 8000.00, 'Pagado'),
(7, 7, 5, 1, 4000.00, 'Pagado'),
(8, 8, 8, 1, 4000.00, 'Pagado'),
(9, 9, 6, 1, 300.00, 'Pagado'),
(10, 10, 2, 1, 3000.00, 'Pagado'),
(11, 11, 6, 2, 600.00, 'Pagado'),
(12, 12, 1, 1, 3000.00, 'Pagado'),
(13, 13, 6, 10, 3000.00, 'Pagado'),
(14, 14, 5, 2, 8000.00, 'Pendiente'),
(15, 15, 1, 1, 3000.00, 'Pagado'),
(16, 15, 5, 1, 4000.00, 'Pagado'),
(17, 16, 2, 1, 3000.00, 'Pagado'),
(18, 17, 4, 1, 70000.00, 'Pagado'),
(19, 18, 4, 1, 70000.00, 'Pendiente'),
(20, 19, 1, 1, 3000.00, 'Pendiente'),
(21, 23, 8, 2, 8000.00, 'Pendiente'),
(22, 24, 5, 1, 4000.00, 'Pendiente'),
(23, 25, 8, 2, 8000.00, 'Pendiente'),
(24, 26, 1, 1, 3000.00, 'Pendiente'),
(25, 27, 1, 1, 3000.00, 'Pendiente'),
(26, 28, 6, 10, 3000.00, 'Pendiente'),
(27, 29, 2, 1, 3000.00, 'Pendiente'),
(28, 30, 5, 1, 4000.00, 'Pendiente'),
(29, 31, 1, 1, 3000.00, 'Pendiente');

--
-- Disparadores `detallespedido`
--
DELIMITER $$
CREATE TRIGGER `after_insert_detallespedido` AFTER INSERT ON `detallespedido` FOR EACH ROW BEGIN
    UPDATE inventario
    SET cantidad = cantidad - NEW.cantidad
    WHERE id_producto = NEW.id_producto;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_pedidos`
--

CREATE TABLE `historial_pedidos` (
  `id_historial` int(11) NOT NULL,
  `id_pedido` int(11) DEFAULT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id_inventario` int(11) NOT NULL,
  `id_producto` int(11) DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `fecha_actualizacion` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id_inventario`, `id_producto`, `cantidad`, `fecha_actualizacion`) VALUES
(75, 1, 9, '2024-11-26'),
(76, 2, 65, '2024-11-26'),
(77, 3, 64, '2024-11-26'),
(78, 4, 115, '2024-11-26'),
(79, 5, 126, '2024-11-26'),
(80, 6, 381, '2024-11-26'),
(81, 7, 146, '2024-11-26'),
(82, 8, 136, '2024-11-26'),
(83, 9, 148, '2024-11-26'),
(84, 10, 142, '2024-11-26'),
(85, 12, 12, '2024-12-02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mesas`
--

CREATE TABLE `mesas` (
  `id_mesa` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `estado` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mesas`
--

INSERT INTO `mesas` (`id_mesa`, `nombre`, `estado`) VALUES
(1, 'Mesa1', 0),
(2, 'Mesa2', 0),
(3, 'Mesa3', 0),
(30, 'Mesa4', 0),
(32, 'Mesa5', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id_pedido` int(11) NOT NULL,
  `id_mesa` int(11) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id_pedido`, `id_mesa`, `fecha`, `total`, `estado`) VALUES
(1, 1, '2024-12-02', 3000.00, 'entregado'),
(2, 32, '2024-12-02', 3000.00, 'entregado'),
(3, 30, '2024-12-02', 4000.00, 'entregado'),
(4, 30, '2024-12-02', 3000.00, 'entregado'),
(5, 30, '2024-12-02', 6000.00, 'entregado'),
(6, 30, '2024-12-02', 8000.00, 'entregado'),
(7, 1, '2024-12-02', 4000.00, 'entregado'),
(8, 1, '2024-12-02', 4000.00, 'entregado'),
(9, 2, '2024-12-02', 300.00, 'entregado'),
(10, 2, '2024-12-02', 3000.00, 'entregado'),
(11, 30, '2024-12-02', 600.00, 'entregado'),
(12, 1, '2024-12-02', 3000.00, 'entregado'),
(13, 1, '2024-12-03', 3000.00, 'entregado'),
(14, 30, '2024-12-03', 8000.00, 'entregado'),
(15, 1, '2024-12-03', 7000.00, 'entregado'),
(16, 1, '2024-12-03', 3000.00, 'entregado'),
(17, 1, '2024-12-03', 70000.00, 'entregado'),
(18, 1, '2024-12-03', 70000.00, 'entregado'),
(19, 1, '2024-12-03', 3000.00, 'entregado'),
(23, 1, '2024-12-03', 8000.00, 'entregado'),
(24, 1, '2024-12-03', 4000.00, 'entregado'),
(25, 1, '2024-12-03', 8000.00, 'entregado'),
(26, 1, '2024-12-03', 3000.00, 'entregado'),
(27, 1, '2024-12-03', 3000.00, 'entregado'),
(28, 1, '2024-12-03', 3000.00, 'entregado'),
(29, 1, '2024-12-03', 3000.00, 'entregado'),
(30, 2, '2024-12-03', 4000.00, 'entregado'),
(31, 1, '2024-12-03', 3000.00, 'entregado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id_producto` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `id_tipo` int(11) DEFAULT NULL,
  `precio_compra` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id_producto`, `nombre`, `precio`, `id_tipo`, `precio_compra`) VALUES
(1, 'jugo Hit x400Ml', 3000.00, 14, 1500.00),
(2, 'De todito azul', 3000.00, 17, 1875.00),
(3, 'De todito rojo', 3000.00, 17, 1875.00),
(4, 'Aguardiente Nectar azul botella', 70000.00, 16, 35000.00),
(5, 'Coca Cola x330ml', 4000.00, 14, 2500.00),
(6, 'Chicles adams', 300.00, 18, 150.00),
(7, 'Aguila', 3500.00, 15, 1900.00),
(8, 'Aguila ligth', 4000.00, 15, 2000.00),
(9, 'Poker', 4000.00, 15, 1900.00),
(10, 'Bacana', 4000.00, 15, 1400.00),
(12, 'perro con perro', 45000.00, 19, 25000.00),
(13, 'Red lebal 770ml ', 105000.00, 22, 75000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos`
--

CREATE TABLE `tipos` (
  `id_tipo` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipos`
--

INSERT INTO `tipos` (`id_tipo`, `nombre`) VALUES
(14, 'Refrescos'),
(15, 'Cerveza'),
(16, 'Aguardiente'),
(17, 'Comida'),
(18, 'Dulces'),
(19, 'Wisky'),
(20, 'Cigarrillos'),
(22, 'Champaña');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tipos_pago`
--

CREATE TABLE `tipos_pago` (
  `id` int(11) NOT NULL,
  `metodo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tipos_pago`
--

INSERT INTO `tipos_pago` (`id`, `metodo`) VALUES
(1, 'Efectivo'),
(2, 'Transferencia');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transacciones`
--

CREATE TABLE `transacciones` (
  `id` int(11) NOT NULL,
  `caja_id` int(11) NOT NULL,
  `tipo` enum('ingreso','egreso') NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `tipo_pago_id` int(11) DEFAULT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `comprobante` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `transacciones`
--

INSERT INTO `transacciones` (`id`, `caja_id`, `tipo`, `monto`, `descripcion`, `fecha`, `tipo_pago_id`, `pedido_id`, `comprobante`) VALUES
(1, 1, 'ingreso', 12000.00, 'pagos de pedidos', '2024-12-03 14:30:03', 1, NULL, NULL),
(2, 2, 'ingreso', 4000.00, 'Pago de pedido', '2024-12-03 14:31:07', 2, 7, 'uploads/comprobantes/1733236267015-f4788e6a-1b48-4c0b-81b7-54c2ce4ebc43.jpg'),
(3, 1, 'ingreso', 80000.00, 'pago de pedido', '2024-12-03 14:35:57', 1, NULL, NULL),
(4, 1, 'ingreso', 3000.00, 'pago de pedidos', '2024-12-03 15:12:47', 1, NULL, NULL),
(5, 2, 'ingreso', 7000.00, 'Pago de pedido', '2024-12-03 15:23:18', 2, 15, 'uploads/comprobantes/1733239398410-bar-chart.png'),
(6, 1, 'ingreso', 3000.00, 'pago de tanda', '2024-12-03 15:32:27', 1, NULL, NULL),
(7, 1, 'ingreso', 3000.00, 'sdsd', '2024-12-03 15:34:18', 1, NULL, NULL),
(8, 1, 'ingreso', 3000.00, 'dccds', '2024-12-03 15:35:32', 1, NULL, NULL),
(9, 1, 'ingreso', 1222.00, 'zsxdas', '2024-12-03 15:37:09', 1, NULL, NULL),
(10, 1, 'ingreso', 70000.00, 'pago de pedido', '2024-12-03 16:10:05', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_login`
--

CREATE TABLE `usuarios_login` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_login`
--

INSERT INTO `usuarios_login` (`id`, `nombre`, `correo`, `contraseña`, `fecha_creacion`) VALUES
(1, 'ANSACA', 'thepubs@gmail.com', '$2b$10$z1YEPicWRXNGXbaq9nwVyeqIoN8wkcFMmVI0//5jP6RdgWLSNOHzK', '2024-12-02 14:36:43');

--
-- Disparadores `usuarios_login`
--
DELIMITER $$
CREATE TRIGGER `prevent_multiple_rows` BEFORE INSERT ON `usuarios_login` FOR EACH ROW BEGIN
  DECLARE cnt INT;
  SELECT COUNT(*) INTO cnt FROM usuarios_login;
  IF cnt >= 1 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No se puede insertar más de una fila en esta tabla';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas_por_mesa`
--

CREATE TABLE `ventas_por_mesa` (
  `id_venta` int(11) NOT NULL,
  `id_mesa` int(11) NOT NULL,
  `fecha` date DEFAULT NULL,
  `id_producto` int(11) NOT NULL,
  `nombre_producto` varchar(100) NOT NULL,
  `cantidad_vendida` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_detalles_pedidos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_detalles_pedidos` (
`id_pedido` int(11)
,`nombre_mesa` varchar(100)
,`fecha_pedido` date
,`id_producto` int(11)
,`nombre_producto` varchar(100)
,`cantidad` int(11)
,`subtotal` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_inventario_actual`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_inventario_actual` (
`id_producto` int(11)
,`nombre_producto` varchar(100)
,`cantidad_disponible` int(11)
,`fecha_actualizacion` date
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_pedidos_por_mesa`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_pedidos_por_mesa` (
`nombre_mesa` varchar(100)
,`id_pedido` int(11)
,`fecha` date
,`producto` varchar(100)
,`cantidad` int(11)
,`subtotal` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_resumen_diario`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_resumen_diario` (
`fecha` date
,`metodo_pago` varchar(50)
,`total_ingresos` decimal(32,2)
,`total_egresos` decimal(32,2)
,`balance_neto` decimal(33,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_resumen_ventas_mesa`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_resumen_ventas_mesa` (
`id_mesa` int(11)
,`nombre_mesa` varchar(100)
,`total_pedidos` bigint(21)
,`total_ventas` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_resumen_ventas_producto`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_resumen_ventas_producto` (
`id_producto` int(11)
,`nombre_producto` varchar(100)
,`total_vendido` decimal(32,0)
,`total_ventas` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_total_ventas_diarias`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_total_ventas_diarias` (
`fecha` date
,`total_ventas` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_ventas_por_periodo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_ventas_por_periodo` (
`dia` varchar(10)
,`mes` varchar(7)
,`anio` int(4)
,`total` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_detalles_pedidos`
--
DROP TABLE IF EXISTS `vista_detalles_pedidos`;

CREATE VIEW `vista_detalles_pedidos`  AS SELECT `p`.`id_pedido` AS `id_pedido`, `m`.`nombre` AS `nombre_mesa`, `p`.`fecha` AS `fecha_pedido`, `pr`.`id_producto` AS `id_producto`, `pr`.`nombre` AS `nombre_producto`, `dp`.`cantidad` AS `cantidad`, `dp`.`subtotal` AS `subtotal` FROM (((`pedidos` `p` join `mesas` `m` on(`p`.`id_mesa` = `m`.`id_mesa`)) join `detallespedido` `dp` on(`p`.`id_pedido` = `dp`.`id_pedido`)) join `productos` `pr` on(`dp`.`id_producto` = `pr`.`id_producto`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_inventario_actual`
--
DROP TABLE IF EXISTS `vista_inventario_actual`;

CREATE VIEW `vista_inventario_actual`  AS SELECT `i`.`id_producto` AS `id_producto`, `pr`.`nombre` AS `nombre_producto`, `i`.`cantidad` AS `cantidad_disponible`, `i`.`fecha_actualizacion` AS `fecha_actualizacion` FROM (`inventario` `i` join `productos` `pr` on(`i`.`id_producto` = `pr`.`id_producto`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_pedidos_por_mesa`
--
DROP TABLE IF EXISTS `vista_pedidos_por_mesa`;

CREATE VIEW `vista_pedidos_por_mesa`  AS SELECT `mesas`.`nombre` AS `nombre_mesa`, `pedidos`.`id_pedido` AS `id_pedido`, `pedidos`.`fecha` AS `fecha`, `productos`.`nombre` AS `producto`, `detallespedido`.`cantidad` AS `cantidad`, `detallespedido`.`subtotal` AS `subtotal` FROM (((`pedidos` join `mesas` on(`pedidos`.`id_mesa` = `mesas`.`id_mesa`)) join `detallespedido` on(`pedidos`.`id_pedido` = `detallespedido`.`id_pedido`)) join `productos` on(`detallespedido`.`id_producto` = `productos`.`id_producto`)) ORDER BY `mesas`.`nombre` ASC, `pedidos`.`fecha` ASC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_resumen_diario`
--
DROP TABLE IF EXISTS `vista_resumen_diario`;

CREATE VIEW `vista_resumen_diario`  AS SELECT cast(`t`.`fecha` as date) AS `fecha`, `tp`.`metodo` AS `metodo_pago`, sum(case when `t`.`tipo` = 'ingreso' then `t`.`monto` else 0 end) AS `total_ingresos`, sum(case when `t`.`tipo` = 'egreso' then `t`.`monto` else 0 end) AS `total_egresos`, sum(case when `t`.`tipo` = 'ingreso' then `t`.`monto` else 0 end) - sum(case when `t`.`tipo` = 'egreso' then `t`.`monto` else 0 end) AS `balance_neto` FROM (`transacciones` `t` join `tipos_pago` `tp` on(`t`.`tipo_pago_id` = `tp`.`id`)) GROUP BY cast(`t`.`fecha` as date), `tp`.`metodo` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_resumen_ventas_mesa`
--
DROP TABLE IF EXISTS `vista_resumen_ventas_mesa`;

CREATE VIEW `vista_resumen_ventas_mesa`  AS SELECT `p`.`id_mesa` AS `id_mesa`, `m`.`nombre` AS `nombre_mesa`, count(0) AS `total_pedidos`, sum(`p`.`total`) AS `total_ventas` FROM (`pedidos` `p` join `mesas` `m` on(`p`.`id_mesa` = `m`.`id_mesa`)) GROUP BY `p`.`id_mesa`, `m`.`nombre` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_resumen_ventas_producto`
--
DROP TABLE IF EXISTS `vista_resumen_ventas_producto`;

CREATE VIEW `vista_resumen_ventas_producto`  AS SELECT `dp`.`id_producto` AS `id_producto`, `pr`.`nombre` AS `nombre_producto`, sum(`dp`.`cantidad`) AS `total_vendido`, sum(`dp`.`subtotal`) AS `total_ventas` FROM (`detallespedido` `dp` join `productos` `pr` on(`dp`.`id_producto` = `pr`.`id_producto`)) GROUP BY `dp`.`id_producto`, `pr`.`nombre` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_total_ventas_diarias`
--
DROP TABLE IF EXISTS `vista_total_ventas_diarias`;

CREATE VIEW `vista_total_ventas_diarias`  AS SELECT `pedidos`.`fecha` AS `fecha`, sum(`pedidos`.`total`) AS `total_ventas` FROM `pedidos` GROUP BY `pedidos`.`fecha` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_ventas_por_periodo`
--
DROP TABLE IF EXISTS `vista_ventas_por_periodo`;

CREATE VIEW `vista_ventas_por_periodo`  AS SELECT date_format(`pedidos`.`fecha`,'%Y-%m-%d') AS `dia`, date_format(`pedidos`.`fecha`,'%Y-%m') AS `mes`, year(`pedidos`.`fecha`) AS `anio`, sum(`pedidos`.`total`) AS `total` FROM `pedidos` WHERE `pedidos`.`estado` = 'entregado' GROUP BY date_format(`pedidos`.`fecha`,'%Y-%m-%d'), date_format(`pedidos`.`fecha`,'%Y-%m'), year(`pedidos`.`fecha`) ORDER BY year(`pedidos`.`fecha`) DESC, date_format(`pedidos`.`fecha`,'%Y-%m') DESC, date_format(`pedidos`.`fecha`,'%Y-%m-%d') DESC ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cajas`
--
ALTER TABLE `cajas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detallespedido`
--
ALTER TABLE `detallespedido`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `id_pedido` (`id_pedido`),
  ADD KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `historial_pedidos`
--
ALTER TABLE `historial_pedidos`
  ADD PRIMARY KEY (`id_historial`);

--
-- Indices de la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD PRIMARY KEY (`id_inventario`),
  ADD UNIQUE KEY `id_producto` (`id_producto`);

--
-- Indices de la tabla `mesas`
--
ALTER TABLE `mesas`
  ADD PRIMARY KEY (`id_mesa`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `id_mesa` (`id_mesa`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `fk_tipo` (`id_tipo`);

--
-- Indices de la tabla `tipos`
--
ALTER TABLE `tipos`
  ADD PRIMARY KEY (`id_tipo`);

--
-- Indices de la tabla `tipos_pago`
--
ALTER TABLE `tipos_pago`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `caja_id` (`caja_id`),
  ADD KEY `tipo_pago_id` (`tipo_pago_id`),
  ADD KEY `fk_transacciones_pedido` (`pedido_id`);

--
-- Indices de la tabla `usuarios_login`
--
ALTER TABLE `usuarios_login`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- Indices de la tabla `ventas_por_mesa`
--
ALTER TABLE `ventas_por_mesa`
  ADD PRIMARY KEY (`id_venta`),
  ADD KEY `id_mesa` (`id_mesa`),
  ADD KEY `id_producto` (`id_producto`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cajas`
--
ALTER TABLE `cajas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `detallespedido`
--
ALTER TABLE `detallespedido`
  MODIFY `id_detalle` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `historial_pedidos`
--
ALTER TABLE `historial_pedidos`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `inventario`
--
ALTER TABLE `inventario`
  MODIFY `id_inventario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT de la tabla `mesas`
--
ALTER TABLE `mesas`
  MODIFY `id_mesa` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id_pedido` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id_producto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `tipos`
--
ALTER TABLE `tipos`
  MODIFY `id_tipo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT de la tabla `tipos_pago`
--
ALTER TABLE `tipos_pago`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `usuarios_login`
--
ALTER TABLE `usuarios_login`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `ventas_por_mesa`
--
ALTER TABLE `ventas_por_mesa`
  MODIFY `id_venta` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detallespedido`
--
ALTER TABLE `detallespedido`
  ADD CONSTRAINT `fk_pedido_detalle` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`),
  ADD CONSTRAINT `fk_producto_detalle` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventario`
--
ALTER TABLE `inventario`
  ADD CONSTRAINT `fk_producto_inventario` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_mesa_pedido` FOREIGN KEY (`id_mesa`) REFERENCES `mesas` (`id_mesa`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_tipo` FOREIGN KEY (`id_tipo`) REFERENCES `tipos` (`id_tipo`) ON DELETE CASCADE;

--
-- Filtros para la tabla `transacciones`
--
ALTER TABLE `transacciones`
  ADD CONSTRAINT `fk_transacciones_pedido` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id_pedido`),
  ADD CONSTRAINT `transacciones_ibfk_1` FOREIGN KEY (`caja_id`) REFERENCES `cajas` (`id`),
  ADD CONSTRAINT `transacciones_ibfk_2` FOREIGN KEY (`tipo_pago_id`) REFERENCES `tipos_pago` (`id`);

--
-- Filtros para la tabla `ventas_por_mesa`
--
ALTER TABLE `ventas_por_mesa`
  ADD CONSTRAINT `ventas_por_mesa_ibfk_1` FOREIGN KEY (`id_mesa`) REFERENCES `mesas` (`id_mesa`),
  ADD CONSTRAINT `ventas_por_mesa_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
