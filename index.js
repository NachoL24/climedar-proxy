const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();

// Configuración CORS
const corsOptions = {
  origin: 'https://climedar-c7287.web.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Habilitar CORS
app.use(cors(corsOptions));

// Responder a preflight requests (OPTIONS)
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', corsOptions.origin);
  res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(','));
  res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

// Proxy dinámico para pasar el JWT
app.use('/', createProxyMiddleware({
  target: 'http://vps-4708087-x.dattaweb.com:443',
  changeOrigin: true,
  secure: false,
  onProxyReq: (proxyReq, req, res) => {
    // Pasar el header Authorization con el JWT
    const token = req.headers['authorization'];
    if (token) {
      proxyReq.setHeader('Authorization', token);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Forzar encabezados CORS en todas las respuestas
    proxyRes.headers['Access-Control-Allow-Origin'] = corsOptions.origin;
    proxyRes.headers['Access-Control-Allow-Methods'] = corsOptions.methods.join(',');
    proxyRes.headers['Access-Control-Allow-Headers'] = corsOptions.allowedHeaders.join(',');
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
}));

// Inicializa el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Proxy dinámico con JWT escuchando en http://localhost:3000');
});

module.exports = app;
