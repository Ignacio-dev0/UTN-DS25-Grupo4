import { Request, Response, NextFunction } from "express";

export default function debugging(req: Request, res: Response, next: NextFunction) {
  console.log(`🌐 [${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.get('Origin') || 'No Origin'}`);
  if (req.method === 'POST' && req.url.includes('register')) {
    console.log('📝 Body:', JSON.stringify(req.body, null, 2));
  }
  next();
}