import openai from "../config/openai";
import ProtocolDocument from "../models/protocol-document.schema";
import ManualScreening from "../models/manual-screening.schema";
import PatientQuestions from "../models/patient-questions.schema";
import { manualScreeningPrompt } from "../constants/prompts";
import { twilioClient, twilioPhoneNumber } from "../config/twilio";

// Helper to get embedding
async function getEmbedding(text: string): Promise<number[]> {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return resp.data[0].embedding;
}

export class TwilioService {
  /**
   * Get protocol_id from phone number by looking up patient questions
   */
  static async getProtocolIdFromPhone(phoneNumber: string): Promise<string | null> {
    try {
      // Normalize phone number (remove +, spaces, etc.)
      const normalizedPhone = phoneNumber.replace(/[^\d]/g, "");
      
      // Try to find patient by phone number
      const patient = await PatientQuestions.findOne({
        $or: [
          { phoneNo1: { $regex: normalizedPhone.slice(-10) } }, // Last 10 digits
          { phoneNo2: { $regex: normalizedPhone.slice(-10) } },
        ],
      })
        .sort({ createdAt: -1 }) // Get most recent
        .select("protocol_id")
        .lean();

      return patient?.protocol_id || null;
    } catch (error) {
      console.error("Error getting protocol_id from phone:", error);
      return null;
    }
  }

  /**
   * Process incoming message and generate AI response using protocol context
   */
  static async processIncomingMessage(
    phoneNumber: string,
    message: string,
    protocolId?: string
  ): Promise<string> {
    try {
      // Get protocol_id if not provided
      let finalProtocolId = protocolId;
      if (!finalProtocolId) {
        finalProtocolId = await this.getProtocolIdFromPhone(phoneNumber);
      }

      if (!finalProtocolId) {
        return "I couldn't find your protocol information. Please contact support with your protocol ID.";
      }

      // Use phone number as session_id for continuity
      const sessionId = phoneNumber.replace(/[^\d]/g, "");

      // Get embedding for user message
      const userEmbedding = await getEmbedding(message);

      // Vector search for relevant protocol context
      const contextChunks = await ProtocolDocument.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: userEmbedding,
            numCandidates: 100,
            limit: 20,
          },
        },
        {
          $match: { protocol_id: finalProtocolId },
        },
        {
          $project: {
            _id: 0,
            text: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ]);

      if (!contextChunks.length) {
        return "I don't have any protocol information available for this study. Please contact support.";
      }

      const context = contextChunks.map((c) => c.text).join("\n\n");

      const maxContextLength = 12000;
      const finalContext =
        context.length > maxContextLength
          ? context.substring(0, maxContextLength) +
            "\n\n[Content truncated due to length...]"
          : context;

      // Get or create conversation history
      let conversation = await ManualScreening.findOne({
        protocol_id: finalProtocolId,
        session_id: sessionId,
      });

      if (!conversation) {
        conversation = new ManualScreening({
          protocol_id: finalProtocolId,
          session_id: sessionId,
          conversation: [],
        });
      }

      const history = conversation.conversation;

      // Build messages for OpenAI
      const messages = [
        {
          role: "system" as const,
          content: manualScreeningPrompt(finalContext),
        },
        ...history.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.message,
        })),
        {
          role: "user" as const,
          content: message,
        },
      ];

      // Generate AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 800,
        temperature: 0.3,
      });

      const aiResponse =
        completion.choices[0]?.message?.content ||
        "I couldn't generate a response. Please try again.";

      // Save conversation (async)
      conversation.conversation.push(
        { role: "user", message, timestamp: new Date() },
        { role: "assistant", message: aiResponse, timestamp: new Date() }
      );

      conversation.updated_at = new Date();
      conversation.save().catch((err) => console.error("Save error:", err));

      return aiResponse;
    } catch (error: any) {
      console.error("Error processing message:", error);
      return "I'm sorry, I encountered an error processing your message. Please try again or contact support.";
    }
  }

  /**
   * Send SMS message via Twilio
   */
  static async sendSMS(to: string, message: string): Promise<void> {
    try {
      await twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: to,
      });
      console.log(`SMS sent to ${to}`);
    } catch (error: any) {
      console.error("Error sending SMS:", error);
      throw error;
    }
  }

  /**
   * Handle incoming webhook from Twilio
   */
  static async handleIncomingWebhook(
    from: string,
    body: string,
    protocolId?: string
  ): Promise<string> {
    const response = await this.processIncomingMessage(from, body, protocolId);
    return response;
  }
}

