import { Router, type IRouter } from 'express';
import { authenticateSse } from '../middlewares/auth.middleware';
import { addClient, removeClient } from '../services/sse.service';

export const eventsRouter: IRouter = Router();

eventsRouter.get('/', authenticateSse, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  // Disable proxy/nginx buffering so events are flushed immediately
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const userId = req.user!.userId;
  addClient(userId, res);

  // Keep-alive heartbeat (comment lines are ignored by EventSource)
  const heartbeat = setInterval(() => res.write(':\n\n'), 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeClient(userId, res);
  });
});
