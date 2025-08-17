// src/routes/request.routes.ts
import { Router } from "express";
import * as reqCtrl from "../controllers/request.controller";

const router = Router();

router.post("/", reqCtrl.createRequest);
router.get("/", reqCtrl.listRequests);
router.get("/nearby", reqCtrl.nearbyRequests);
router.get("/:requestId", reqCtrl.getRequest);

export default router;
