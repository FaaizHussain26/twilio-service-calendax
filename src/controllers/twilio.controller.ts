import { Request, Response } from "express";
import { TwilioService } from "../services/twilio.service";
import twilio from "twilio";

export class TwilioController {
  /**
   * Handle incoming SMS webhook from Twilio
   */
  static async handleIncomingSMS(req: Request, res: Response) {
    try {
      // Twilio sends form data, so we need to parse it
      const twiml = new twilio.twiml.MessagingResponse();
      
      const from = req.body.From;
      const body = req.body.Body;
      const protocolId = req.body.protocol_id; // Optional: can be passed in message or URL param

      if (!from || !body) {
        twiml.message("I'm sorry, I couldn't process your message. Please try again.");
        res.type("text/xml");
        return res.send(twiml.toString());
      }

      // Process the message and get AI response
      const response = await TwilioService.handleIncomingWebhook(
        from,
        body.trim(),
        protocolId || req.query.protocol_id as string
      );

      // Send response back via Twilio
      twiml.message(response);
      
      res.type("text/xml");
      return res.send(twiml.toString());
    } catch (error: any) {
      console.error("Error handling incoming SMS:", error);
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message(
        "I'm sorry, I encountered an error. Please try again or contact support."
      );
      res.type("text/xml");
      return res.send(twiml.toString());
    }
  }

  /**
   * Send a test SMS (for testing purposes)
   */
  static async sendTestSMS(req: Request, res: Response) {
    try {
      const { to, message, protocol_id } = req.body;

      if (!to || !message) {
        return res.status(400).json({
          error: "Missing required fields: 'to' and 'message'",
        });
      }

      await TwilioService.sendSMS(to, message);

      return res.json({
        success: true,
        message: "SMS sent successfully",
      });
    } catch (error: any) {
      console.error("Error sending test SMS:", error);
      return res.status(500).json({
        error: "Failed to send SMS",
        details: error.message,
      });
    }
  }

  /**
   * Process a message and get response (for API testing)
   */
  static async processMessage(req: Request, res: Response) {
    try {
      const { phone_number, message, protocol_id } = req.body;

      if (!phone_number || !message) {
        return res.status(400).json({
          error: "Missing required fields: 'phone_number' and 'message'",
        });
      }

      const response = await TwilioService.processIncomingMessage(
        phone_number,
        message,
        protocol_id
      );

      return res.json({
        success: true,
        response,
      });
    } catch (error: any) {
      console.error("Error processing message:", error);
      return res.status(500).json({
        error: "Failed to process message",
        details: error.message,
      });
    }
  }
}

