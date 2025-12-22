import { Request, Response } from "express";
import PatientFollowupStatus from "../models/patient-followup-status.schema";
import {
  PatientFollowupStatusCreateRequest,
  PatientFollowupStatusUpdateRequest,
  PatientFollowupStatusQuery,
  PatientFollowupStatusStats,
} from "../types/patient-followup-status.types";
import { PatientFollowupStatusService } from "../services/patient-followup-status.servies";

export class PatientFollowupStatusController {
  public async getPatientFollowupsSimple(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id: patient_id } = req.params;
      const followupRecords = await PatientFollowupStatus.find({
        patient_id: parseInt(patient_id),
      }).sort({ time_utc: -1 });

      res.status(200).json({
        success: true,
        data: followupRecords,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error retrieving followups",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  public async updatePatientFollowupStatus(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { patient_id: patientId } = req.params;
      const crcApprove = await PatientFollowupStatusService.approveFollowup(
        patientId
      );
      res.status(200).json({
        status: true,
        data: crcApprove,
      });
    } catch (err: any) {
      res.json({
        status: false,
        details: err.message || err,
      });
    }
  }
}
