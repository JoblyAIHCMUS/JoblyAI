import type { Request } from 'express';

export interface RequestWithUser extends Request {
    user: {
        id: string;
        name: string | null;
        email: string;
        emailVerified: boolean;
        image: string | null;
        userType: string | null;
        createdAt: Date;
        updatedAt: Date;
    },
    session: {
        id: string;
        expiresAt: Date;
        token: string;
        createdAt: Date;
        updatedAt: Date;
        ipAddress: string | null;
        userAgent: string | null;
        userId: string;
    }
}
