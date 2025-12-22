import { Router } from 'express';
import { ManualScreeningController } from "../controllers/manual-screening.controller";

const router = Router();

router.post(
  "/chat/:protocol_id",
  ManualScreeningController.handleManualScreeningChat
);

router.get(
  "/history/",
  ManualScreeningController.getConversationHistory
);

export default router;
