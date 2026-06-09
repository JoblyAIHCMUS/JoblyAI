import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { Server } from 'socket.io';

export class JoblyIoAdapter extends IoAdapter {
  private readonly logger = new Logger(JoblyIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;

  constructor(app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const useAdapter = process.env.WS_REDIS_ADAPTER !== 'false';

    if (!useAdapter) {
      this.logger.log(
        'WS_REDIS_ADAPTER is disabled, using default in-memory adapter (single-instance only)'
      );
      return;
    }

    try {
      const pubClient = new Redis(redisUrl, { lazyConnect: true });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log(`Socket.IO Redis adapter connected at ${redisUrl}`);
    } catch (err) {
      this.logger.error(
        `Failed to connect Socket.IO Redis adapter at ${redisUrl}. ` +
          'Falling back to in-memory adapter (room broadcasts will NOT work across instances). ' +
          `Reason: ${(err as Error).message}`
      );
    }
  }

  override createIOServer(port: number, options?: ServerOptions): Server {
    const corsOrigins = [
      process.env.WEB_URL || 'http://localhost:5173',
      process.env.APP_URL || 'http://localhost:3000',
    ].filter(Boolean);

    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin:
          process.env.NODE_ENV === 'production'
            ? corsOrigins
            : corsOrigins,
        credentials: true,
        methods: ['GET', 'POST'],
      },
    });

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }
}
