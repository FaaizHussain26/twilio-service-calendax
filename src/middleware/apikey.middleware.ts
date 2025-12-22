import { Request, Response, NextFunction } from "express";
import { variables } from "../constants/variables";

export const authenticateAPIKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    let apiKey = req.headers["x-api-key"] as string;
    if (!apiKey) {
      res.status(401).json({
        success: false,
        message: "API key is required",
      });
      return;
    }

    const validKeys = variables.VALID_API_KEYS?.split(",") || [];
    if (!validKeys.includes(apiKey)) {
      res.status(403).json({
        success: false,
        message: "Invalid API key",
      });
      return;
    }
    req.apiKey = apiKey;
    next();
  } catch (error) {
    console.error("API Key error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
