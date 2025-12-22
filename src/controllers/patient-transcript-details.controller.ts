import { Request, Response } from "express";
import patientTranscriptDetailsSchema from "../models/patient-transcript-details.schema";

export class PatientTranscriptDetailsController {
  static async getDetails(req: Request, res: Response) {
    const { patien_id: patientId } = req.params;
    const doc = await patientTranscriptDetailsSchema
      .findOne({ "patients.patient_id": patientId })
      .lean();
    if (!doc) {
      res.status(404).json("Transcript Detail not found");
    }
    res.status(200).json(doc);
  }
}
