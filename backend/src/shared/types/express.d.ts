import { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }

  type Req = Request;
  type Res = Response;
  type Next = NextFunction;
}
