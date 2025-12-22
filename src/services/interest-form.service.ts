import openai from "../config/openai";
import UploadedProtocolDetails from "../models/uploaded-protocol-details.schema";
import ProtocolDocument from "../models/protocol-document.schema";
import PatientQuestions from "../models/patient-questions.schema";
import { generateQuestionnairePrompt } from "../constants/prompts";
import { buildQuestionPrompt } from "../constants/prompts";
import { QuestionnaireService } from "./questionaire.services";

export interface InterestFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNo1: string;
  phoneNo2?: string;
  email?: string;
  dateOfBirth?: string;
  studyOfInterest: string[];
  submittedBy: string;
  bestTimeToCall?: string[];
  mailingAddress?: string;
  streetAddress?: string;
  apartmentNumber?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  specialInstruction?: string;
  userId?: string | number;
  acceptTerms: boolean;
}

export class InterestFormService {
  async processInterestForm(formData: InterestFormData) {
    try {
      const relevantProtocols = await this.findRelevantProtocols(
        formData.studyOfInterest
      );

      if (relevantProtocols.length === 0) {
        const availableStudies = await this.getAvailableStudies();

        return {
          success: false,
          data: {
            ...formData,
            questions: null,
            availableStudies: availableStudies,
            message:
              "No specific studies found for your areas of interest. Would you like to answer questions about other available studies?",
            requiresUserChoice: true,
          },
          message:
            "No specific studies found for your areas of interest. Please choose from available studies.",
        };
      }

      const questions = await QuestionnaireService.fetch(
        relevantProtocols[0].protocol_id
      );

      const patientQuestions = new PatientQuestions({
        ...formData,
        questions: questions?.questionnaire,
        protocol_id: relevantProtocols[0]?.protocol_id,
        protocol_name: relevantProtocols[0]?.pi,
        indication: relevantProtocols[0]?.indication,
      });

      const savedPatientQuestions = await patientQuestions.save();

      return {
        success: true,
        data: savedPatientQuestions,
        message: "Interest form processed successfully and questions generated",
      };
    } catch (error) {
      console.error("Error processing interest form:", error);
      throw new Error("Failed to process interest form");
    }
  }

  private async findRelevantProtocols(studyOfInterest: string[]) {
    try {
      const exactMatches = await UploadedProtocolDetails.find({
        indication: { $in: studyOfInterest },
      }).limit(10);

      if (exactMatches.length > 0) {
        return exactMatches;
      }

      const regexPatterns = studyOfInterest.map(
        (study) => new RegExp(study.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      );

      const similarMatches = await UploadedProtocolDetails.find({
        $or: [
          { indication: { $regex: regexPatterns[0] } },
          { pi: { $regex: regexPatterns[0] } },
        ],
      }).limit(3);

      if (similarMatches.length > 0) {
        return similarMatches;
      }

      const anyProtocols = await UploadedProtocolDetails.find({})
        .limit(3)
        .sort({ createdAt: -1 });

      return anyProtocols;
    } catch (error) {
      console.error("Error finding relevant protocols:", error);
      return [];
    }
  }

  private async getAvailableStudies() {
    try {
      const studies = await UploadedProtocolDetails.find({})
        .select("protocol_id pi indication enrollment_startDate")
        .limit(10)
        .sort({ createdAt: -1 });

      return studies.map((study) => ({
        protocol_id: study.protocol_id,
        protocol_name: study.pi,
        indication: study.indication,
        enrollment_start_date: study.enrollment_startDate,
      }));
    } catch (error) {
      console.error("Error getting available studies:", error);
      return [];
    }
  }

  // private async getProtocolContext(
  //   protocols: any[],
  //   studyOfInterest: string[]
  // ) {
  //   try {
  //     let context = "";

  //     for (const protocol of protocols) {
  //       const searchQuery = `inclusion criteria exclusion criteria eligibility requirements screening criteria ${studyOfInterest.join(
  //         " "
  //       )}`;
  //       const inclusionExclusionEmbedding = await this.getEmbedding(
  //         searchQuery
  //       );

  //       const relevantChunks = await ProtocolDocument.aggregate([
  //         {
  //           $vectorSearch: {
  //             index: "vector_index",
  //             path: "embedding",
  //             queryVector: inclusionExclusionEmbedding,
  //             numCandidates: 100,
  //             limit: 15, // Reduced to 15 to manage context length
  //           },
  //         },
  //         {
  //           $match: {
  //             protocol_id: protocol.protocol_id,
  //           },
  //         },
  //         {
  //           $project: {
  //             _id: 0,
  //             text: 1,
  //             page: 1,
  //             chunk: 1,
  //             score: { $meta: "vectorSearchScore" },
  //           },
  //         },
  //         {
  //           $sort: { score: -1 },
  //         },
  //       ]);

  //       if (relevantChunks.length > 0) {
  //         context += `\n\nProtocol: ${protocol.pi} (${protocol.indication})\n`;
  //         context += `Protocol ID: ${protocol.protocol_id}\n`;
  //         context += `Enrollment Start Date: ${protocol.enrollment_startDate}\n`;
  //         context += `Study Areas of Interest: ${studyOfInterest.join(", ")}\n`;
  //         context += "Relevant Inclusion/Exclusion Criteria:\n";

  //         // Truncate content to prevent context length issues
  //         const truncatedChunks =
  //           this.truncateContentForContext(relevantChunks);

  //         truncatedChunks.forEach((chunk, index) => {
  //           context += `\n--- Document ${index + 1} (Page ${
  //             chunk.page
  //           }, Chunk ${chunk.chunk}, Relevance Score: ${chunk.score.toFixed(
  //             3
  //           )}) ---\n`;
  //           context += chunk.text;
  //         });
  //       }
  //     }

  //     return (
  //       context ||
  //       "No specific protocol context available. Generate general clinical trial screening questions."
  //     );
  //   } catch (error) {
  //     console.error("Error getting protocol context:", error);
  //     return "No specific protocol context available. Generate general clinical trial screening questions.";
  //   }
  // }

  // private async generateQuestions(context: string, studyOfInterest: string[]) {
  //   try {
  //     const prompt = buildQuestionPrompt(context, studyOfInterest);

  //     // Check if prompt is too long and truncate if necessary
  //     const maxPromptLength = 50000; // Conservative limit
  //     const finalPrompt =
  //       prompt.length > maxPromptLength
  //         ? prompt.substring(0, maxPromptLength) +
  //           "\n\n[Content truncated due to length]"
  //         : prompt;

  //     const completion = await openai.chat.completions.create({
  //       model: "gpt-4", // Use GPT-4 for better context handling
  //       messages: [
  //         {
  //           role: "system",
  //           content:
  //             "You are an expert clinical trial coordinator. Generate a comprehensive screening questionnaire for potential study participants based on the provided protocol context and study interests.",
  //         },
  //         {
  //           role: "user",
  //           content: finalPrompt,
  //         },
  //       ],
  //       max_tokens: 2000,
  //       temperature: 0.7,
  //     });

  //     return (
  //       completion.choices[0]?.message?.content || "No questions generated"
  //     );
  //   } catch (error) {
  //     console.error("Error generating questions with OpenAI:", error);

  //     // If it's a context length error, try with a shorter context
  //     if (
  //       error instanceof Error &&
  //       error.message &&
  //       error.message.includes("context length")
  //     ) {
  //       console.log("Context too long, trying with truncated context...");
  //       const truncatedContext =
  //         context.substring(0, 20000) + "\n\n[Context truncated due to length]";
  //       const truncatedPrompt = buildQuestionPrompt(
  //         truncatedContext,
  //         studyOfInterest
  //       );

  //       try {
  //         const completion = await openai.chat.completions.create({
  //           model: "gpt-4",
  //           messages: [
  //             {
  //               role: "system",
  //               content:
  //                 "You are an expert clinical trial coordinator. Generate a comprehensive screening questionnaire for potential study participants based on the provided protocol context and study interests.",
  //             },
  //             {
  //               role: "user",
  //               content: truncatedPrompt,
  //             },
  //           ],
  //           max_tokens: 2000,
  //           temperature: 0.7,
  //         });

  //         return (
  //           completion.choices[0]?.message?.content || "No questions generated"
  //         );
  //       } catch (retryError) {
  //         console.error("Error with truncated context:", retryError);
  //       }
  //     }

  //     return this.generateFallbackQuestions(studyOfInterest);
  //   }
  // }

  // private truncateContentForContext(chunks: any[]): any[] {
  //   const maxTokens = 12000; // Leave room for prompt and response
  //   const avgCharsPerToken = 4; // Rough estimate
  //   const maxChars = maxTokens * avgCharsPerToken;

  //   let totalChars = 0;
  //   const truncatedChunks = [];

  //   for (const chunk of chunks) {
  //     const chunkChars = chunk.text.length;

  //     if (totalChars + chunkChars > maxChars) {
  //       const remainingChars = maxChars - totalChars;
  //       if (remainingChars > 200) {
  //         const truncatedText =
  //           chunk.text.substring(0, remainingChars - 50) + "...";
  //         truncatedChunks.push({
  //           ...chunk,
  //           text: truncatedText,
  //         });
  //       }
  //       break;
  //     }

  //     truncatedChunks.push(chunk);
  //     totalChars += chunkChars;
  //   }

  //   return truncatedChunks;
  // }

  // private async getEmbedding(text: string): Promise<number[]> {
  //   try {
  //     const resp = await openai.embeddings.create({
  //       model: "text-embedding-3-small",
  //       input: text,
  //     });
  //     return resp.data[0].embedding;
  //   } catch (error) {
  //     console.error("Error generating embedding:", error);
  //     throw new Error("Failed to generate embedding");
  //   }
  // }

  // async processQuestionsForStudy(
  //   formData: InterestFormData,
  //   selectedProtocolId: string
  // ) {
  //   try {
  //     // Find the selected protocol
  //     const selectedProtocol = await UploadedProtocolDetails.findOne({
  //       protocol_id: selectedProtocolId,
  //     });

  //     if (!selectedProtocol) {
  //       throw new Error("Selected study not found");
  //     }

  //     const protocolContext = await this.getProtocolContext(
  //       [selectedProtocol],
  //       formData.studyOfInterest
  //     );

  //     const questions = await this.generateQuestions(protocolContext, [
  //       selectedProtocol.indication,
  //     ]);

  //     const patientQuestions = new PatientQuestions({
  //       ...formData,
  //       questions,
  //       protocol_id: selectedProtocol.protocol_id,
  //       protocol_name: selectedProtocol.pi,
  //       indication: selectedProtocol.indication,
  //     });

  //     const savedPatientQuestions = await patientQuestions.save();

  //     return {
  //       success: true,
  //       data: savedPatientQuestions,
  //       message: "Questions generated successfully for the selected study",
  //     };
  //   } catch (error) {
  //     console.error("Error processing questions for selected study:", error);
  //     throw new Error("Failed to process questions for selected study");
  //   }
  // }

  //   private generateFallbackQuestions(studyOfInterest: string[]) {
  //     return `Clinical Trial Screening Questionnaire

  // 1. What is your age?
  // 2. What is your gender?
  // 3. Do you have any known allergies to medications?
  // 4. Are you currently taking any medications? If yes, please list them.
  // 5. Do you have any chronic medical conditions
  // 6. Have you participated in any clinical trials in the past 6 months?
  // 7. Are you pregnant or planning to become pregnant?
  // 8. Do you have any mobility limitations?
  // 9. Are you available for regular study visits?
  // 10. Do you have any concerns about participating in a clinical trial?

  // Study-Specific Questions for: ${studyOfInterest.join(", ")}

  // 11. Have you been diagnosed with any conditions related to ${studyOfInterest.join(
  //       " or "
  //     )}?
  // 12. Are you currently receiving treatment for any of these conditions?
  // 13. How long have you been experiencing symptoms related to these conditions?
  // 14. Have you had any recent hospitalizations?
  // 15. Do you have any family history of ${studyOfInterest.join(" or ")}?

  // Please provide detailed answers to help determine your eligibility for our clinical trials.`;
  //   }
}

export default new InterestFormService();
