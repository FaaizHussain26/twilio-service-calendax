import { Request, Response } from "express";
import ProtocolDocument from "../models/protocol-document.schema";
import { generateQuestionnairePrompt } from "../constants/prompts";
import openai from "../config/openai";
import Questionnaire from "../models/questionnaire.schema";
import { QuestionnaireService } from "../services/questionaire.services";

async function getEmbedding(text: string): Promise<number[]> {
  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return resp.data[0].embedding;
}

export class QuestionnaireController {
  static async generate(req: Request, res: Response) {
    try {
      const { protocol_id, indication, additional_context } = req.body;
      if (!protocol_id) {
        return res
          .status(400)
          .json({ error: "Missing protocol_id" });
      }
      const question = await QuestionnaireService.generate(
        protocol_id,
        indication,
        additional_context
      );
      res.status(200).json({ success: true, data: question });
    } catch (err) {
      console.error(err);
      const details = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        error: "Failed to generate questionnaire",
        details,
      });
    }
  }

  static async fetch(req: Request, res: Response) {
    try {
      const { protocol_id } = req.query;

      if (!protocol_id) {
        return res.status(400).json({ error: "Missing protocol_id" });
      }

      const questionnaire = await QuestionnaireService.fetch(
        protocol_id as string
      );

      return res.status(200).json({ success: true, data: questionnaire });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({
        error: "Failed to fetch questionnaire",
        details: err.message || err,
      });
    }
  }

  static async approve(req: Request, res: Response) {
    try {
      const { protocol_id } = req.body;

      if (!protocol_id) {
        return res.status(400).json({ error: "Missing protocol_id" });
      }

      const questionnaire = await QuestionnaireService.approve(protocol_id);

      return res.status(200).json({
        success: true,
        message: "Questionnaire approved successfully",
        data: questionnaire,
      });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({
        error: "Failed to approve questionnaire",
        details: err.message || err,
      });
    }
  }

  // static async save(req: Request, res: Response) {
  //   try {
  //     const { protocol_id, protocol_name, questionnaire } = req.body;
  //     if (!protocol_id || !protocol_name || !questionnaire) {
  //       return res.status(400).json({ error: "Missing required fields" });
  //     }
  //     const saved = await Questionnaire.create({
  //       protocol_id,
  //       protocol_name,
  //       questionnaire,
  //     });
  //     res.status(201).json({ success: true, questionnaire: saved });
  //   } catch (err) {
  //     console.error(err);
  //     res
  //       .status(500)
  //       .json({ error: "Failed to save questionnaire", details: err });
  //   }
  // }
}
