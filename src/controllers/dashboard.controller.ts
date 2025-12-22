import { Request, Response } from "express";
import patientFollowupStatusSchema from "../models/patient-followup-status.schema";

export class DashboardController {
  static async dashboardStats(req: Request, res: Response) {
    const totalCall = await patientFollowupStatusSchema.countDocuments();

    const completeCall = await patientFollowupStatusSchema.countDocuments({
      call_status: { $eq: true },
    });
    const totalEligible = await patientFollowupStatusSchema.countDocuments({
      iseligible: { $eq: true },
    });

    let callPercentage: string = "0%";
    let preScreenerEligible: string = "0%";

    if (totalCall > 0) {
      callPercentage = `${Math.round((completeCall / totalCall) * 100)}%`;
      preScreenerEligible = `${Math.round((totalEligible / totalCall) * 100)}%`;
    }

    const response = {
      kpis: {
        PreScreenerEligible: preScreenerEligible,
      },
      graph: {
        TotalEligible: totalEligible,
      },
      crc: {
        CallMade: totalCall,
        Call: callPercentage,
      },
    };

    return res.json(response);
  }
}
