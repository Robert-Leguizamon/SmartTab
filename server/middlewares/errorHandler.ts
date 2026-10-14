import { NextFunction, Request, Response } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[Express Error] ${req.method} ${req.url}:`, err);

  const status = (err as unknown as { status?: number }).status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
}
