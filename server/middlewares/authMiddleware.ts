import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseServer } from '../lib/supabaseServer';

export interface AuthenticatedUser {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required. Please provide a valid Bearer token.',
      error: 'Unauthorized',
    });
    return;
  }

  const token = authHeader.split(' ')[1]?.trim();

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Empty bearer token provided.',
      error: 'Unauthorized',
    });
    return;
  }

  try {
    // 1. Fast decode JWT payload (Supabase access_token payload includes sub: user_uuid, email)
    const decoded = jwt.decode(token) as { sub?: string; email?: string; id?: string; user_id?: string } | null;
    const userId = decoded?.sub || decoded?.id || decoded?.user_id;

    if (userId) {
      req.user = {
        id: userId,
        email: decoded?.email || '',
      };
      next();
      return;
    }

    // 2. Validate against Supabase Auth API with timeout safeguard
    try {
      const authPromise = supabaseServer.auth.getUser(token);
      const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error('Auth request timed out')), 2500)
      );

      const result = (await Promise.race([authPromise, timeoutPromise])) as {
        data: { user: { id: string; email?: string } | null } | null;
        error: Error | null;
      };

      if (!result.error && result.data?.user) {
        req.user = {
          id: result.data.user.id,
          email: result.data.user.email || '',
        };
        next();
        return;
      }
    } catch {
      // Fall through to 401
    }

    res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired Supabase session token.',
      error: 'Unauthorized',
    });
  } catch (err) {
    console.error('[Auth Middleware Error]:', err);
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Token validation error.',
      error: 'Unauthorized',
    });
  }
}
