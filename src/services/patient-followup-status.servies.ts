import PatientFollowupStatus from "../models/patient-followup-status.schema";
import patientQuestionsSchema from "../models/patient-questions.schema";
import { pgPool } from "../config/pg";
import uploadedProtocolDetailsSchema from "../models/uploaded-protocol-details.schema";

export class PatientFollowupStatusService {
  static async approveFollowup(patientId: string) {
    try {
      const patientIdNum = parseInt(patientId, 10);
      if (isNaN(patientIdNum)) {
        throw new Error("Invalid patient ID");
      }

      const [followupStatus, patientQuestions] = await Promise.all([
        PatientFollowupStatus.findOne({ patient_id: patientIdNum }),
        patientQuestionsSchema.findOne({ patientId: String(patientIdNum) }),
      ]);

      if (!followupStatus) {
        throw new Error("Patient followup status record not found");
      }

      if (followupStatus.is_crc_approved) {
        throw new Error("CRC already approved");
      }

      if (!patientQuestions) {
        throw new Error("Patient questions record not found");
      }

      const getUploadProtocol = await uploadedProtocolDetailsSchema.findOne({
        protocol_id: patientQuestions.protocol_id,
      });
      if (!getUploadProtocol) {
        throw new Error("Protocol not uploaded");
      }

      const getSite = await pgPool.query(
        `SELECT id,name FROM sites WHERE id = $1`,
        [parseInt(getUploadProtocol.site_id, 10)]
      );
      if (getSite.rows.length === 0) {
        throw new Error("No site found");
      }

      const siteName = getSite.rows[0].name;
      const siteId = getSite.rows[0].id;
      const siteVisitMessage = `I hope you’re doing well. You’ve been selected for a ${siteName} site visit. Could you please let me know which day and time would be most convenient for you to visit? We’ll schedule it accordingly.`;

      const setPatientQuestion = await patientQuestionsSchema.updateOne(
        { patientId: patientIdNum },
        {
          $set: {
            siteVisitQuestion: siteVisitMessage,
            siteId: siteId,
          },
        }
      );
      if (setPatientQuestion.matchedCount === 0) {
        throw new Error("Site Visit Question not added");
      }
      const updatedFollowupStatus =
        await PatientFollowupStatus.findOneAndUpdate(
          { patient_id: patientIdNum },
          {
            $set: { is_crc_approved: true, crc_approved_datetime: new Date() },
          },
          { new: true }
        );
      if (!updatedFollowupStatus) {
        throw new Error("Failed to update followup status");
      }

      return updatedFollowupStatus;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Unknown error");
    }
  }
}
