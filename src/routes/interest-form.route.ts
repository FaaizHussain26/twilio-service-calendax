import { Router } from "express";
import InterestFormController from "../controllers/interest-form.controller";

const router = Router();

/**
 * @swagger
 * /api/interest-form:
 *   post:
 *     summary: Process interest form and generate questions
 *     tags: [Interest Form]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phoneNo1
 *               - studyOfInterest
 *               - submittedBy
 *               - acceptTerms
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Patient's first name
 *               middleName:
 *                 type: string
 *                 description: Patient's middle name
 *               lastName:
 *                 type: string
 *                 description: Patient's last name
 *               phoneNo1:
 *                 type: string
 *                 description: Primary phone number
 *               phoneNo2:
 *                 type: string
 *                 description: Secondary phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               studyOfInterest:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of study areas of interest
 *               submittedBy:
 *                 type: string
 *                 enum: [patient, caregiver, family, other]
 *                 description: Who submitted the form
 *               bestTimeToCall:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Preferred times for contact
 *               mailingAddress:
 *                 type: string
 *                 description: Mailing address
 *               streetAddress:
 *                 type: string
 *                 description: Street address
 *               apartmentNumber:
 *                 type: string
 *                 description: Apartment number
 *               state:
 *                 type: string
 *                 description: State
 *               city:
 *                 type: string
 *                 description: City
 *               zipCode:
 *                 type: string
 *                 description: ZIP code
 *               specialInstruction:
 *                 type: string
 *                 description: Special instructions
 *               acceptTerms:
 *                 type: boolean
 *                 description: Terms acceptance
 *     responses:
 *       201:
 *         description: Interest form processed successfully
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     studyOfInterest:
 *                       type: array
 *                       items:
 *                         type: string
 *                     protocol_id:
 *                       type: string
 *                     protocol_name:
 *                       type: string
 *                     indication:
 *                       type: string
 *                     questionsGenerated:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 */
router.post("/", InterestFormController.processInterestForm);

/**
 * @swagger
 * /api/interest-form/study/{protocolId}:
 *   post:
 *     summary: Process questions for a selected study
 *     tags: [Interest Form]
 *     parameters:
 *       - in: path
 *         name: protocolId
 *         required: true
 *         schema:
 *           type: string
 *         description: Protocol ID of the selected study
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - phoneNo1
 *               - studyOfInterest
 *               - submittedBy
 *               - acceptTerms
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Patient's first name
 *               middleName:
 *                 type: string
 *                 description: Patient's middle name
 *               lastName:
 *                 type: string
 *                 description: Patient's last name
 *               phoneNo1:
 *                 type: string
 *                 description: Primary phone number
 *               phoneNo2:
 *                 type: string
 *                 description: Secondary phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth
 *               studyOfInterest:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Areas of medical interest
 *               submittedBy:
 *                 type: string
 *                 enum: [patient, caregiver, family, other]
 *                 description: Who is submitting the form
 *               bestTimeToCall:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Preferred times to be called
 *               mailingAddress:
 *                 type: string
 *                 description: Mailing address
 *               streetAddress:
 *                 type: string
 *                 description: Street address
 *               apartmentNumber:
 *                 type: string
 *                 description: Apartment number
 *               state:
 *                 type: string
 *                 description: State
 *               city:
 *                 type: string
 *                 description: City
 *               zipCode:
 *                 type: string
 *                 description: ZIP code
 *               specialInstruction:
 *                 type: string
 *                 description: Special instructions
 *               acceptTerms:
 *                 type: boolean
 *                 description: Whether terms are accepted
 *     responses:
 *       201:
 *         description: Questions generated successfully for selected study
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     studyOfInterest:
 *                       type: array
 *                       items:
 *                         type: string
 *                     protocol_id:
 *                       type: string
 *                     protocol_name:
 *                       type: string
 *                     indication:
 *                       type: string
 *                     questionsGenerated:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - missing required fields or invalid protocol ID
 *       500:
 *         description: Internal server error
 */
// router.post(
//   "/study/:protocolId",
//   InterestFormController.processQuestionsForStudy
// );

/**
 * @swagger
 * /api/interest-form/{id}:
 *   get:
 *     summary: Get patient questions by ID
 *     tags: [Interest Form]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Patient questions ID
 *     responses:
 *       200:
 *         description: Patient questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PatientQuestions'
 *       404:
 *         description: Patient questions not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", InterestFormController.getPatientQuestions);

/**
 * @swagger
 * /api/interest-form:
 *   get:
 *     summary: Get all patient questions with pagination
 *     tags: [Interest Form]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Patient questions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PatientQuestions'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
router.get("/", InterestFormController.getAllPatientQuestions);

export default router;
