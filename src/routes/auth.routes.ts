// @ts-nocheck

import { Router } from "express";
import { login, me_setAvailability, me_updateLocation } from "../controllers/auth.controller";
import { requireUser } from "../middleware/requireUser";

const r = Router();
r.post("/login", login);
r.post("/me/availability", requireUser, me_setAvailability);
r.post("/me/location", requireUser, me_updateLocation);

export default r;
