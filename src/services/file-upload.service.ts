import fs from "fs";
import pdfParse from "pdf-parse";
import ProtocolDocument from "../models/protocol-document.schema";
import UploadedProtocolDetails from "../models/uploaded-protocol-details.schema";
import UploadedFile from "../models/uploaded-file.schema";
import openai from "../config/openai";

export class FileUploadService {
  static splitTextIntoChunks(text: string, maxLength = 2000): string[] {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.slice(start, start + maxLength));
      start += maxLength;
    }
    return chunks;
  }

  static async processAndStorePDF(
    file: Express.Multer.File,
    details: {
      pi: string;
      indication: string;
      enrollment_startDate: Date;
      is_updated: boolean;
      protocol_id: string;
      site_id: string;
    }
  ) {
    let processingSucceeded = false;
    try {
      console.log(`Starting processing for file: ${file.originalname}`);

      const uploadedFile = await UploadedFile.create({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        protocol_id: details.protocol_id,
        uploadedAt: new Date(),
      });

      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);

      if (!pdfData.text || pdfData.text.trim() === "") {
        console.error(
          "Failed to extract text from the PDF. The document might be empty, scanned, or image-based."
        );
        throw new Error("Failed to extract text from the PDF.");
      }

      const pages = pdfData.text.split(/\f/);
      console.log(`Extracted ${pages.length} pages from the PDF.`);

      const chunkPromises = [];
      for (const [idx, pageText] of pages.entries()) {
        const textChunks = this.splitTextIntoChunks(pageText.trim(), 2000);
        for (const [subIdx, chunk] of textChunks.entries()) {
          if (!chunk) continue;
          const promise = this.getEmbedding(chunk).then((embedding) => ({
            text: chunk,
            embedding,
            page: idx + 1,
            chunk: subIdx + 1,
            protocol_id: details.protocol_id,
            site_id: details.site_id,
            file_id: uploadedFile._id,
          }));
          chunkPromises.push(promise);
        }
      }

      const chunksToInsert = await Promise.all(chunkPromises);
      console.log(
        `Generated ${chunksToInsert.length} text chunks to be inserted.`
      );

      if (chunksToInsert.length > 0) {
        console.log(
          `Embedding for first chunk has length: ${chunksToInsert[0].embedding.length}`
        );
        console.log(
          `First 5 values of embedding: [${chunksToInsert[0].embedding
            .slice(0, 5)
            .join(", ")}]`
        );

        const insertResult = await ProtocolDocument.collection.insertMany(
          chunksToInsert
        );

        console.log("MongoDB Driver insertMany result:", {
          acknowledged: insertResult.acknowledged,
          insertedCount: insertResult.insertedCount,
        });

        if (insertResult.acknowledged && insertResult.insertedCount > 0) {
          const firstId = insertResult.insertedIds[0];
          console.log(
            `DATABASE CONFIRMED WRITE. Search for document with _id: ${firstId}`
          );
        } else {
          console.error("Database did not acknowledge the insert operation.");
        }
      } else {
        console.error(
          "No text chunks were generated from the PDF, so no documents were inserted."
        );
        throw new Error("No text chunks were generated from the PDF.");
      }

      const uploadedDetails = await UploadedProtocolDetails.create({
        ...details,
        file: uploadedFile._id,
      });

      processingSucceeded = true;
      return { uploadedFile, uploadedDetails };
    } catch (error) {
      console.error("An error occurred during PDF processing:", error);
      // Re-throw the error to be caught by the controller
      throw error;
    } finally {
      if (processingSucceeded) {
        // Only delete the file if everything was successful
        fs.unlinkSync(file.path);
        console.log(
          `Successfully processed and deleted temporary file: ${file.path}`
        );
      } else {
        console.log(
          `Processing failed. The temporary file was not deleted: ${file.path}`
        );
      }
    }
  }

  static async getEmbedding(text: string): Promise<number[]> {
    const resp = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return resp.data[0].embedding;
  }
}
