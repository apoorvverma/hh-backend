import { Request, Response, NextFunction } from "express";
import { getUser } from "../models/user.model";

export interface AuthedRequest extends Request {
  userId?: string;
  userRole?: "driver" | "rider";
}

export async function requireUser(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req.headers["x-user-id"] as string) || "";
    if (!userId) {
      res.status(401).json({ error: "Missing x-user-id header" });
      return; // <- stop here
    }

    const user = await getUser(userId);
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return; // <- stop here
    }

    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (error) {
    next(error);
  }
}
