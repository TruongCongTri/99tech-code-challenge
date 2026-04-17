import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { env } from './common/configs/env';
import { errorHandler } from './middlewares/error-handler.middleware';
import { API_VERSION } from './constants/endpoints';
import v1Router from './routes/v1';

const app = express();

// Alert Express that it's behind a proxy (e.g., when deployed on platforms like Heroku, Vercel, etc.)
app.set('trust proxy', 1);

// Secure HTTP headers with Helmet
app.use(helmet());

// Config CORS to only allow requests from the FE URL defined in .env
const whitelist = [env.CLIENT_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies to be sent in CORS requests
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);

// Parse incoming request bodies (JSON and URL-encoded)
app.use(express.json()); // read application/json
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // read cookies (needed for auth, sessions, etc.)

// Health Check Route
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Demo API is running!' });
});

app.use(API_VERSION, v1Router);

// global error handler
app.use(errorHandler);

export default app;
