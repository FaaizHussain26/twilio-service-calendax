import { Request, Response } from "express";
import InterestFormService, {
  InterestFormData,
} from "../services/interest-form.service";
import PatientQuestions from "../models/patient-questions.schema";

export class InterestFormController {
  async processInterestForm(req: Request, res: Response) {
    try {
      const formData: InterestFormData = req.body;

      // Validate required fields
      if (
        !formData.firstName ||
        !formData.lastName ||
        !formData.phoneNo1 ||
        !formData.studyOfInterest ||
        !formData.submittedBy ||
        formData.acceptTerms === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: firstName, lastName, phoneNo1, studyOfInterest, submittedBy, and acceptTerms are required",
        });
      }

      // Validate studyOfInterest is an array
      if (
        !Array.isArray(formData.studyOfInterest) ||
        formData.studyOfInterest.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "studyOfInterest must be a non-empty array",
        });
      }

      // Validate submittedBy value
      const validSubmittedBy = ["patient", "caregiver", "family", "other"];
      if (!validSubmittedBy.includes(formData.submittedBy)) {
        return res.status(400).json({
          success: false,
          message:
            "submittedBy must be one of: patient, caregiver, family, other",
        });
      }

      // Validate acceptTerms
      if (formData.acceptTerms !== true) {
        return res.status(400).json({
          success: false,
          message: "acceptTerms must be true",
        });
      }

      // Process the interest form
      const result = await InterestFormService.processInterestForm(formData);

      if (!result.success) {
        // No relevant studies found - return available studies for user to choose
        return res.status(200).json({
          success: false,
          message: result.message,
          data: {
            ...result.data,
            requiresUserChoice: true,
          },
        });
      }

      // Type assertion since we know result.data is a PatientQuestions document when success is true
      const patientData = result.data as any;

      res.status(201).json({
        success: true,
        message: "Interest form processed successfully",
        data: {
          id: patientData._id,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          email: patientData.email,
          studyOfInterest: patientData.studyOfInterest,
          protocol_id: patientData.protocol_id,
          protocol_name: patientData.protocol_name,
          indication: patientData.indication,
          questionsGenerated: true,
          createdAt: patientData.createdAt,
        },
      });
    } catch (error) {
      console.error("Error in processInterestForm controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while processing interest form",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Something went wrong",
      });
    }
  }

  async getPatientQuestions(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Patient ID is required",
        });
      }

      const patientQuestions = await PatientQuestions.findById(id);

      if (!patientQuestions) {
        return res.status(404).json({
          success: false,
          message: "Patient questions not found",
        });
      }

      res.status(200).json({
        success: true,
        data: patientQuestions,
      });
    } catch (error) {
      console.error("Error in getPatientQuestions controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while fetching patient questions",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Something went wrong",
      });
    }
  }

  async getAllPatientQuestions(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const patientQuestions = await PatientQuestions.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await PatientQuestions.countDocuments({});

      res.status(200).json({
        success: true,
        data: patientQuestions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error in getAllPatientQuestions controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error while fetching patient questions",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Something went wrong",
      });
    }
  }

  // async processQuestionsForStudy(req: Request, res: Response) {
  //   try {
  //     const formData: InterestFormData = req.body;
  //     const { protocolId } = req.params;

  //     if (!protocolId) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Protocol ID is required",
  //       });
  //     }

  //     // Validate required fields
  //     if (
  //       !formData.firstName ||
  //       !formData.lastName ||
  //       !formData.phoneNo1 ||
  //       !formData.studyOfInterest ||
  //       !formData.submittedBy ||
  //       formData.acceptTerms === undefined
  //     ) {
  //       return res.status(400).json({
  //         success: false,
  //         message:
  //           "Missing required fields: firstName, lastName, phoneNo1, studyOfInterest, submittedBy, and acceptTerms are required",
  //       });
  //     }

  //     // Process questions for the selected study
  //     const result = await InterestFormService.processQuestionsForStudy(
  //       formData,
  //       protocolId
  //     );

  //     res.status(201).json({
  //       success: true,
  //       message: "Questions generated successfully for the selected study",
  //       data: {
  //         id: result.data._id,
  //         firstName: result.data.firstName,
  //         lastName: result.data.lastName,
  //         email: result.data.email,
  //         studyOfInterest: result.data.studyOfInterest,
  //         protocol_id: result.data.protocol_id,
  //         protocol_name: result.data.protocol_name,
  //         indication: result.data.indication,
  //         questionsGenerated: true,
  //         createdAt: result.data.createdAt,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error in processQuestionsForStudy controller:", error);
  //     res.status(500).json({
  //       success: false,
  //       message:
  //         "Internal server error while processing questions for selected study",
  //       error:
  //         process.env.NODE_ENV === "development"
  //           ? (error as Error).message
  //           : "Something went wrong",
  //     });
  //   }
  // }
}

export default new InterestFormController();
