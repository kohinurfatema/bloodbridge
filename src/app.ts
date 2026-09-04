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

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.', errors: [] },
}));

app.use(express.json());

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
