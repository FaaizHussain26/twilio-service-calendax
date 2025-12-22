import { Request } from "express";
export interface JwtPayload {
  id: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      apiKey?: string;
    }
  }
}
