import { Router } from "express";
import { QuestionnaireController } from "../controllers/questionnaire.controller";

const router = Router();

router.get("/fetch", QuestionnaireController.fetch);
router.post("/generate", QuestionnaireController.generate);
router.post("/approve", QuestionnaireController.approve);
// router.post('/save', QuestionnaireController.save);

export default router;
