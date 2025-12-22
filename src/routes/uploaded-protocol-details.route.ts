import { Router } from 'express';
import { UploadedProtocolDetailsController } from '../controllers/uploaded-protocol-details.controller';

const router = Router();

router.get('/', UploadedProtocolDetailsController.list);
router.get('/protocol', UploadedProtocolDetailsController.getProtocolIds);
router.get('/indication', UploadedProtocolDetailsController.getIndication);

export default router;
