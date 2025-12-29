import { Router } from "express";
import { TwilioController } from "../controllers/twilio.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Webhook endpoint for Twilio to send incoming SMS
// This should be configured in Twilio console as: POST /api/twilio/webhook
// Note: This endpoint does NOT require authentication as it's a webhook from Twilio
router.post("/webhook", TwilioController.handleIncomingSMS);

// Protected routes for testing (require authentication)
router.use(authenticateToken);
router.post("/send", TwilioController.sendTestSMS);
router.post("/process", TwilioController.processMessage);

export default router;

