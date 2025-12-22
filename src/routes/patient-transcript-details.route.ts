import { Router } from "express";
import { PatientTranscriptDetailsController } from "../controllers/patient-transcript-details.controller";

const router = Router();

router.get("/:patien_id", PatientTranscriptDetailsController.getDetails);

export default router;
