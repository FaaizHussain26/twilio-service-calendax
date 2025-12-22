import { Request, Response } from "express";
const { v4: uuidv4 } = require("uuid");
import openai from "../config/openai";

import protocolDocumentSchema from "../models/protocol-document.schema";
import ManualScreening from "../models/manual-screening.schema";
import { manualScreeningPrompt } from "../constants/prompts";

// helper to get embedding
async function getEmbedding(text: string): Promise<number[]> {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return resp.data[0].embedding;
}

export class ManualScreeningController {
  static async handleManualScreeningChat(req: Request, res: Response) {
    try {
      const { protocol_id } = req.params;
      const { message, session_id } = req.body;

      if (!protocol_id || !message?.trim()) {
        return res
          .status(400)
          .json({ error: "Missing protocol_id or message" });
      }

      const sessionId = session_id || uuidv4();

      // 🔹 Get embedding for user message
      const userEmbedding = await getEmbedding(message);

      const contextChunks = await protocolDocumentSchema.aggregate([
        {
          $vectorSearch: {
            index: "vector_index", // must match your Atlas index name
            path: "embedding",
            queryVector: userEmbedding,
            numCandidates: 100,
            limit: 20,
          },
        },
        {
          $match: { protocol_id },
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
        return res.json({
          protocol_id,
          session_id: sessionId,
          response:
            "I don’t have any protocol information available. Please contact support.",
        });
      }

      const context = contextChunks.map((c) => c.text).join("\n\n");

      const maxContextLength = 12000;
      const finalContext =
        context.length > maxContextLength
          ? context.substring(0, maxContextLength) +
            "\n\n[Content truncated due to length...]"
          : context;

      let conversation = await ManualScreening.findOne({
        protocol_id,
        session_id: sessionId,
      });

      if (!conversation) {
        conversation = new ManualScreening({
          protocol_id,
          session_id: sessionId,
          conversation: [],
        });
      }

      const history = conversation.conversation;

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

      // 🔹 Generate AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 800,
        temperature: 0.3,
      });

      const aiResponse =
        completion.choices[0]?.message?.content ||
        "I couldn’t generate a response. Please try again.";

      // 🔹 Save conversation (async)
      conversation.conversation.push(
        { role: "user", message, timestamp: new Date() },
        { role: "assistant", message: aiResponse, timestamp: new Date() }
      );

      conversation.updated_at = new Date();
      conversation.save().catch((err) => console.error("Save error:", err));

      return res.json({
        protocol_id,
        session_id: sessionId,
        response: aiResponse,
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getConversationHistory(req: Request, res: Response) {
    try {
      const protocol_id = req.query.protocol_id as string;
      const session_id = req.query.session_id as string;

      if (!protocol_id || !session_id) {
        return res
          .status(400)
          .json({ error: "Missing protocol_id or session_id" });
      }

      const conversation = await ManualScreening.findOne({
        protocol_id,
        session_id,
      })
        .select("conversation")
        .lean();
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      return res.json({
        session_id,
        conversation: conversation.conversation || [],
        total_messages: Array.isArray(conversation.conversation)
          ? conversation.conversation.length
          : 0,
      });
    } catch (error: any) {
      console.error("History error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
