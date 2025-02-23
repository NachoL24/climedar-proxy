const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Permitir solicitudes desde Firebase Hosting
app.use(cors({
    origin: 'https://climedar-c7287.web.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Proxy dinámico para cualquier ruta que comience con /api
app.use('/', createProxyMiddleware({
    target: 'http://vps-4708087-x.dattaweb.com:443',
    changeOrigin: true,
    secure: false,
    onProxyReq: (proxyReq, req, res) => {
        // Configura headers CORS para la solicitud al backend
        proxyReq.setHeader('Origin', 'https://climedar-c7287.web.app');
    },
    onProxyRes: (proxyRes, req, res) => {
        // Añade encabezados CORS en la respuesta
        proxyRes.headers['Access-Control-Allow-Origin'] = 'https://climedar-c7287.web.app';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
    }
}));

// Inicializa el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Proxy dinámico escuchando en http://localhost:3000');
});

module.exports = app;
