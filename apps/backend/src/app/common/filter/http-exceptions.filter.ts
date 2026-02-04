import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception as Error).message; // Capture the real error text

    const stack = (exception as Error).stack;

    this.logger.error(`💥 CRITICAL ERROR: ${status} on ${request.url}`);
    this.logger.error(`👉 Reason: ${JSON.stringify(message)}`);
    if (status === 500) {
      this.logger.error(`Stack: ${stack}`);
    }

    if (response.headersSent) {
      this.logger.error('⚠️ Response already sent. Skipping error response.');
      return;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    });
  }
}