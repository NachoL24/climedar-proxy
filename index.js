const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy dinámico para cualquier ruta que comience con /api
app.use('/api', createProxyMiddleware({
    target: 'http://vps-4708087-x.dattaweb.com:443',
    changeOrigin: true,
    secure: false,
    pathRewrite: (path, req) => {
        // Reemplaza /api con la ruta real en el backend
        return path.replace('/api', '');
    }
}));

// Inicializa el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Proxy dinámico escuchando en http://localhost:3000');
});

module.exports = app;
