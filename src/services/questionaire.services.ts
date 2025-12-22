import openai from "../config/openai";
import { buildQuestionPrompt } from "../constants/prompts";
import ProtocolDocument from "../models/protocol-document.schema";
import Questionnaire from "../models/questionnaire.schema";

async function getEmbedding(text: string): Promise<number[]> {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return resp.data[0].embedding;
}

export class QuestionnaireService {
  static async generate(
    protocol_id: string,
    indication?: string,
    additional_context?: string
  ) {
    try {
      const questionEmbedding = await getEmbedding(
        "inclusion criteria exclusion criteria"
      );
      console.log("Question embedding:", questionEmbedding);

      const contextChunks = await ProtocolDocument.aggregate([
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: questionEmbedding,
            numCandidates: 100,
            limit: 10,
          },
        },
        {
          $match: {
            protocol_id: protocol_id,
          },
        },
        {
          $project: {
            _id: 0,
            text: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ]);

      if (contextChunks.length === 0) {
        return "No relevant information found for this protocol.";
      }
      console.log("Context chunks:", contextChunks);

      const context = contextChunks.map((chunk) => chunk.text).join("\n\n");
      const existing = await Questionnaire.findOne({ protocol_id });
      if (existing?.is_approved) {
        throw new Error("Cannot modify an approved questionnaire.");
      }
      const prompt = buildQuestionPrompt(context, additional_context);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert medical questionnaire builder. You must follow all instructions precisely, especially any CRITICAL OVERRIDE INSTRUCTIONS provided.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      });

      const question = completion.choices[0]?.message?.content ?? "";

      if (existing) {
        existing.questionnaire = question;
        existing.indication = indication || existing?.indication;
        await existing.save();

        return { questionnaire: existing };
      } else {
        const created = await Questionnaire.create({
          protocol_id,
          questionnaire: question,
          indication,
        });

        return { questionnaire: created };
      }
    } catch (err) {
      console.error(err);
      const error = err instanceof Error ? err.message : String(err);
      throw new Error(error);
    }
  }
  static async fetch(protocol_id: string) {
    try {
      const questionnaire = await Questionnaire.findOne({
        protocol_id: protocol_id,
      });
      if (!questionnaire) {
        throw new Error("Questionnaire not found");
      }
      return questionnaire;
    } catch (err) {
      console.error(err);
      const error = err instanceof Error ? err.message : String(err);
      throw new Error(error);
    }
  }

  static async approve(protocol_id: string) {
    try {
      const questionnaire = await Questionnaire.findOne({ protocol_id });
      if (!questionnaire) {
        throw new Error("Questionnaire not found");
      }
      questionnaire.is_approved = true;
      await questionnaire.save();
      return questionnaire;
    } catch (err) {
      console.error(err);
      const error = err instanceof Error ? err.message : String(err);
      throw new Error(error);
    }

    //   static async save(req: Request, res: Response) {
    //     try {
    //       const { protocol_id, protocol_name, questionnaire } = req.body;
    //       if (!protocol_id || !protocol_name || !questionnaire) {
    //         return res.status(400).json({ error: "Missing required fields" });
    //       }
    //       const saved = await Questionnaire.create({
    //         protocol_id,
    //         protocol_name,
    //         questionnaire,
    //       });
    //       res.status(201).json({ success: true, questionnaire: saved });
    //     } catch (err) {
    //       console.error(err);
    //       res
    //         .status(500)
    //         .json({ error: "Failed to save questionnaire", details: err });
    //     }
    //   }
  }
}
