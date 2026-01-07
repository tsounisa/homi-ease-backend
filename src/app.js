import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';

import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';
import apiRouter from './routes/index.js';

const require = createRequire(import.meta.url);
const swaggerDocument = require('../docs/swagger.json');

const app = express();

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Disable ETag
app.disable('etag');

// Global middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// API routes
app.use('/api/v1', apiRouter);

// Health check
app.get('/', (req, res) => {
  res.send('HomiEase API is running');
});

// 404 handler
app.all('*', (req, res, next) => {
  next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global error handler
app.use(errorHandler);

export { app };
