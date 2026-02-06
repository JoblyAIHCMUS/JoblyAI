import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: (err: Error | null, user: any) => void): any {
    // Save only the user ID to the session to keep it small
    done(null, user); 
  }

  deserializeUser(payload: any, done: (err: Error | null, payload: any) => void): any {
    // Reconstruct the user object from the session
    done(null, payload);
  }
}