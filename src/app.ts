import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler';
import routes from './routes';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL ?? '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Render sits behind a load balancer; trust its X-Forwarded-For so each
// client is rate limited by its own IP instead of sharing the proxy's.
app.set('trust proxy', 1);

const tooManyRequests = { success: false, message: 'Too many requests, please try again later.', errors: [] };

// Stricter limit on credential endpoints to slow down brute-force attempts.
app.use('/api/v1/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooManyRequests,
}));

// General limit. The Next.js frontend proxies every user's calls from its
// own servers, so this budget is shared by all frontend users.
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooManyRequests,
}));

app.use((req, res, next) => {
  const ct = req.headers['content-type'] ?? '';
  const hasBody = Number(req.headers['content-length'] ?? 0) > 0 || req.headers['transfer-encoding'];
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && ct.includes('application/json') && hasBody) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'BloodBridge API is running 🩸' });
});

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/v1', routes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', errors: [] });
});

app.use(errorHandler);

export default app;
