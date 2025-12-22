 import { Router } from 'express';
import multer from 'multer';
import { FileUploadController } from '../controllers/file-upload.controller';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/file-upload', upload.single('file'), FileUploadController.uploadPDF);

export default router;
