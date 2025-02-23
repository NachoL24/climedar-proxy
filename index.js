const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy para el endpoint raíz
app.use('/api/root', createProxyMiddleware({
    target: 'http://vps-4708087-x.dattaweb.com:443',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/api/root': ''
    }
}));

// Proxy para el endpoint de Apollo Federation
app.use('/api/apollo', createProxyMiddleware({
    target: 'http://vps-4708087-x.dattaweb.com:443/apollo-federation',
    changeOrigin: true,
    secure: false,
    pathRewrite: {
        '^/api/apollo': ''
    }
}));

// Inicializa el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Proxy escuchando en http://localhost:3000');
});

module.exports = app;
