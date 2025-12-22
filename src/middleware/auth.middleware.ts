import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { KeyManager } from "../config/keys";
import { JwtPayload } from "../types/auth.types";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers["authorization"];
    const apiKeyFromParam = req.params.api_key as string;

    const apiKey = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    const token = apiKey || apiKeyFromParam;
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    const publicKey = KeyManager.getPublicKey();

    jwt.verify(
      token,
      publicKey,
      { algorithms: ["RS256"], ignoreExpiration: true }, // Specify RSA algorithm

      (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            res.status(401).json({
              success: false,
              message: "Token has expired.",
            });
            return;
          }
          if (err.name === "JsonWebTokenError") {
            res.status(403).json({
              success: false,
              message: "Invalid token.",
            });
            return;
          }
          res.status(403).json({
            success: false,
            message: "Token verification failed.",
          });
          return;
        }

        // Attach user info to request
        req.user = decoded as JwtPayload;
        next();
      }
    );
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
