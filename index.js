const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Configuración CORS
const corsOptions = {
  origin: ['https://climedar-c7287.web.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Habilitar CORS
app.use(cors(corsOptions));

// Custom Stream para Vercel
const stream = {
  write: (message) => console.log(message)
};

// Agregar morgan para logging HTTP detallado con el stream customizado
app.use(morgan('dev', { stream }));

// Responder a preflight requests (OPTIONS)
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', corsOptions.origin);
  res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(','));
  res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

app.use((req, res, next) => {
  console.log('Middleware de ejemplo');
  console.log('Petición:', req.method, req.url);
  console.log('Headers:', req.headers);
  //TODO: BORRAR CUANDO SE IMPLEMENTE EL JWT EN EL BACKEND
  if (req.headers.authorization) {
    console.log('JWT:', req.headers.authorization);
    delete req.headers.authorization;
    console.log('Headers modificados:', req.headers);
  }
  next();
});

// Proxy dinámico para pasar el JWT
app.use('/', createProxyMiddleware({
  target: 'http://vps-4708087-x.dattaweb.com:443',
  changeOrigin: true,
  secure: false,
  on: {
  proxyRes: (proxyRes, req, res) => {
    // Forzar encabezados CORS en todas las respuestas
    console.log("Middleware de respuesta");
    console.log('Headers:', proxyRes.headers);
    console.log('Status:', proxyRes.statusCode);
    console.log('Status Message:', proxyRes.statusMessage);
    proxyRes.headers['Access-Control-Allow-Origin'] = corsOptions.origin;
    proxyRes.headers['Access-Control-Allow-Methods'] = corsOptions.methods.join(',');
    proxyRes.headers['Access-Control-Allow-Headers'] = corsOptions.allowedHeaders.join(',');
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }}
}));

// Inicializa el servidor en el puerto 3000
app.listen(3000, () => {
  console.log('Proxy dinámico con JWT escuchando en http://localhost:3000');
});

module.exports = app;
