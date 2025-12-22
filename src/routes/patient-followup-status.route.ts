import { Router } from "express";
import { PatientFollowupStatusController } from "../controllers/patient-followup-status.controller";

const router = Router();
const patientFollowupStatusController = new PatientFollowupStatusController();

/**
 * @swagger
 * /api/patient-followup-status/{id}:
 *   get:
 *     summary: Get a specific patient followup status by ID
 *     tags: [Patient Followup Status]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Followup status ID
 *     responses:
 *       200:
 *         description: Patient followup status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PatientFollowupStatus'
 *       404:
 *         description: Patient followup status not found
 *       500:
 *         description: Server error
 */
router.get("/:id", patientFollowupStatusController.getPatientFollowupsSimple);

router.put(
  "/:patient_id",
  patientFollowupStatusController.updatePatientFollowupStatus
);

export default router;
