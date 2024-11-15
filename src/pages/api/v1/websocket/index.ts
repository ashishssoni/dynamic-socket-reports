import { Server } from 'socket.io';
import { LogHandler } from '@/backend/handlers';

const logHandler = new LogHandler();

export default function SocketHandler(_req, res) {
  if (res.socket.server.io) {
    logHandler.log('Already set up');
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.use(async (_socket, next) => {
    try {
      next();
    } catch (e) {
      return next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    socket.on('error', (err) => {
      if (err && err.message === 'unauthorized') {
        socket.disconnect();
      }
    });
  });

  logHandler.log('Setting up socket');
  res.end();
}
