import express, { RequestHandler } from 'express';
import { auth } from '../middleware/auth';
import * as ContactController from '../controllers/contact.controller';
import { uploadSingle } from '../middleware/upload';

const router = express.Router();

router.use(auth);

router.post('/', uploadSingle('photo'), ContactController.createContact as RequestHandler);
router.get('/', ContactController.getContacts as RequestHandler);
router.get('/:id', ContactController.getContact as RequestHandler);
router.put('/:id', uploadSingle('photo'), ContactController.updateContact as RequestHandler);
router.delete('/:id', ContactController.deleteContact as RequestHandler);
router.post('/:id/share', ContactController.shareContact as RequestHandler);
router.delete('/:id/share', ContactController.unshareContact as RequestHandler);

export default router; 