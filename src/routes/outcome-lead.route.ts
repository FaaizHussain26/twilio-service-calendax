import { Router } from "express";
import { outcomeLeadsController } from "../controllers/outcome-lead.controller";
import { authenticateAPIKey } from "../middleware/apikey.middleware";

const router = Router();

router.post("/leads", authenticateAPIKey, outcomeLeadsController.create);

router.get("/leads/:id", authenticateAPIKey, outcomeLeadsController.getById);

export default router;
