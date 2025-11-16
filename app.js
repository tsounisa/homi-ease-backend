import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';
import apiRouter from './routes/index.js';

// Initialize Express app
const app = express();

// Disable ETag generation
app.disable('etag');

// --- Global Middleware ---

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Set various security HTTP headers
app.use(helmet());

// Logger middleware (using morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10kb' })); // Parse JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // Parse URL-encoded

// --- Mount API Routes ---
app.use('/api/v1', apiRouter);

// --- 404 Not Found Handler ---
// Handles any request that doesn't match the routes above
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// --- Global Error Handling Middleware ---
app.use(errorHandler);

export { app };