import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // Use NestJS's built-in Logger for nice formatting
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Hook into the response 'finish' event
    // This runs AFTER the controller is done and the response is sent
    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const duration = Date.now() - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength}b - ${duration}ms - ${userAgent} ${ip}`
      );

      // OPTIONAL: Log error bodies if status >= 400
      if (statusCode >= 400) {
        this.logger.error(`❌ Request Failed: ${method} ${originalUrl}`);
      }
    });

    next();
  }
}
