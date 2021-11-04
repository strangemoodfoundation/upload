import dotenv from 'dotenv';

const IsDev = process.env.NODE_ENV !== 'production';

if (IsDev) {
  dotenv.config({ path: __dirname + '/../.env' });
}
import Sentry from '@sentry/node';
import Tracing from '@sentry/tracing';
import cors from 'cors';
import express, { Request, Response } from 'express';
import http from 'http';

import log from './lib/log';
import { getPresignedPutUrl, uploadTest } from './services/fileUpload';

const app = express();

const PORT = process.env.PORT || 8080;
const SENTRY_DSN = process.env.SENTRY_DSN;

if (!IsDev && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 0.2, // Important not to make this too high ($$ she's pricey)
  });

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}

// disable weird 304 errors
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

app.use(cors());

// Set universal middleware
app.set('trust proxy', 1);

app.get('/', (req: Request, res: Response) => {
  res.send('🤠');
});

// Health endpoint for AWS ELB
app.get('/health', (req: Request, res: Response) => {
  res.status(200).end();
});

app.get('/upload-test', (req: Request, res: Response) => {
  uploadTest('myfile.txt', 'hello universe').then(() => {
    res.json({ status: 'success' }).send();
  });
});

app.get('/upload-url', (req: Request, res: Response) => {
  const fileName = req.query.fileName?.toString() || 'filename';
  getPresignedPutUrl(fileName).then((url) => {
    res.json({ url }).send();
  });
});

// Create the server
const server = http.createServer(app);

// As of 5/1/19, ELB idle timeout = 5 min (300000ms).
// Note that ELB can
// (a) pre-emptively open sockets and leave them idle
// (b) reuse sockets.
// https://docs.aws.amazon.com/elasticloadbalancing/latest/classic/config-idle-timeout.html
const serverTimeout = 310000;
server.timeout = serverTimeout;
server.keepAliveTimeout = serverTimeout;
server.headersTimeout = serverTimeout;

server.listen(PORT, () => {
  log.info(`server is listening on ${PORT}`);
});
