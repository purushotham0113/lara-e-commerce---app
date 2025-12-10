import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet'; // Security headers
import morgan from 'morgan'; // Logging
import connectDB from './config/db.js';
import routes from './routes.js'; // Centralized routes
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import rateLimiter from './middleware/rateLimitMiddleware.js';
import logger from './utils/logger.js';

// 1. Load Environment Variables
dotenv.config();

// 2. Connect to Database
connectDB();

const app = express();

// 3. Security & Middleware
app.use(helmet()); // Sets various HTTP headers for security

// CORS Fix: Allow specific origin or reflect origin for credentials
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (process.env.CLIENT_URL && origin !== process.env.CLIENT_URL) {
       // In strict production, fail. In dev/demo, might be lenient.
       // For this audit, we allow reflection if CLIENT_URL is not set, otherwise strict.
       if (!process.env.CLIENT_URL) return callback(null, true);
       return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json()); // Body parser
app.use(morgan('dev')); // HTTP Logger
app.use(rateLimiter); // Rate limiting

// 4. Mount API Routes
app.use('/api', routes);

// 5. Static Files (Uploads)
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// 6. Health Check
app.get('/', (req, res) => {
  res.send('✅ LARA API is running in production mode.');
});

// 7. Global Error Handling
app.use(notFound);
app.use(errorHandler);

// 8. Server Start
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`, err);
  server.close(() => process.exit(1));
});