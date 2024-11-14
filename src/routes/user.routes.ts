import express, { RequestHandler } from 'express';
import { auth } from '../middleware/auth';
import * as UserController from '../controllers/user.controller';

const router = express.Router();

router.use(auth);

router.get('/', UserController.getAllUsers as RequestHandler);
router.get('/email', UserController.getUserByEmail as RequestHandler);
router.get('/:id', UserController.getOneUser as RequestHandler);
router.put('/:id', UserController.updateUser as RequestHandler);
router.delete('/:id', UserController.deleteUser as RequestHandler);

export default router; 