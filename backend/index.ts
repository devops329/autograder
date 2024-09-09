import app from './service';
import logger from './logger';

const port = 3001;
app.listen(port, () => {
  logger.log('info', { type: 'server' }, `Listening on port ${port}`);
});

// Catch any uncaught errors that would cause the server to crash
process.on('uncaughtException', (err) => {
  logger.log('error', { type: 'uncaught_exception', service: 'index' }, err);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.log('error', { type: 'unhandled_rejection', service: 'index' }, { reason });
});
