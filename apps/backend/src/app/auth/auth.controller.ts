import { Controller, All, Req, Res } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import type { Request, Response } from 'express';

@Controller('api/auth')
export class AuthController {
  @All('*') // catches all request with auth, hands them over to better-auth
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    // Convert the Better Auth handler to a Node.js compatible handler
    const handler = toNodeHandler(auth);
    return handler(req, res);
  }
}