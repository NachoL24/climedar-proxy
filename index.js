const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Lista de orígenes permitidos
const allowedOrigins = [
  'https://climedar-c7287.web.app',
  'https://climedar-front.vercel.app',
  'http://localhost:4200'
];

// Configuración CORS Dinámica
const corsOptions = {
  origin: (origin, callback) => {
    // Permitir solicitudes sin origin (como Postman o servidores internos)
    if (!origin) return callback(null, true);

    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.includes(origin)) {
      console.log('Origen permitido:', origin);
      return callback(null, true);
    } else {
      console.log('Origen no permitido:', origin);
      return callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Habilitar CORS con configuración dinámica
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
