import { Request, Response } from "express";
import * as userService from "../services/user.service";

export async function register(req: Request, res: Response): Promise<void> {
  const { userId, displayName, role } = req.body;
  if (
    !userId ||
    !displayName ||
    (role !== "driver" && role !== "rider")
  ) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }

  try {
    await userService.registerUser(userId, displayName, role);
    res.status(201).json({ userId, displayName, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register user" });
  }
}
